import { NextResponse } from "next/server";
import { getDbContext } from "@/db";
import { broadcast } from "@/lib/realtime";
import {
  toastInProgress,
  toastTakeAlreadyInProgress,
  toastTakeNotYours,
} from "@/lib/toastMessages";
import { getSessionUserId } from "@/lib/session";
import { eq } from "drizzle-orm";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId)
      return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
    const ctx = await getDbContext();
    const u =
      ctx.driver === "pg"
        ? (
            await ctx.db
              .select()
              .from(schemaPg.users)
              .where(eq(schemaPg.users.id, userId))
              .limit(1)
          )[0]
        : ctx.db
            .select()
            .from(schemaSqlite.users)
            .where(eq(schemaSqlite.users.id, userId))
            .get();
    if (!u || u.role !== "master")
      return NextResponse.json({ error: "Только мастер" }, { status: 403 });

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id))
      return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

    type Before = {
      status: string;
      assigned_to: number | null;
      master_name: string | null;
    };

    let before: Before | undefined;
    if (ctx.driver === "pg") {
      const q = await ctx.pool.query<Before>(
        `SELECT r.status, r.assigned_to, u.name AS master_name
         FROM requests r LEFT JOIN users u ON u.id = r.assigned_to WHERE r.id = $1`,
        [id]
      );
      before = q.rows[0];
    } else {
      before = ctx.sqlite
        .query(
          `SELECT r.status, r.assigned_to, u.name AS master_name
         FROM requests r LEFT JOIN users u ON u.id = r.assigned_to WHERE r.id = ?`
        )
        .get(id) as Before | undefined;
    }

    if (!before)
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });

    if (before.assigned_to !== userId) {
      const name = before.master_name ?? `id${before.assigned_to}`;
      const toast = toastTakeNotYours(id, name);
      return NextResponse.json(
        { error: "Не назначена вам", code: "NOT_ASSIGNED", toast },
        { status: 403 }
      );
    }

    if (before.status === "in_progress") {
      const toast = toastTakeAlreadyInProgress(
        id,
        before.master_name ?? u.name
      );
      return NextResponse.json(
        { error: "Уже в работе", code: "CONFLICT", toast },
        { status: 409 }
      );
    }

    if (before.status !== "assigned") {
      return NextResponse.json(
        {
          error: "Взять можно только из статуса «Назначена мастеру»",
          code: "CONFLICT",
        },
        { status: 409 }
      );
    }

    const now = new Date();
    let changed = 0;
    if (ctx.driver === "pg") {
      const up = await ctx.pool.query(
        `UPDATE requests SET status = 'in_progress', updated_at = $1
         WHERE id = $2 AND status = 'assigned' AND assigned_to = $3`,
        [now, id, userId]
      );
      changed = up.rowCount ?? 0;
    } else {
      const sec = Math.floor(now.getTime() / 1000);
      const r = ctx.sqlite.run(
        `UPDATE requests SET status = 'in_progress', updated_at = ?
         WHERE id = ? AND status = 'assigned' AND assigned_to = ?`,
        [sec, id, userId]
      );
      changed = r.changes;
    }

    if (!changed) {
      let winner = u.name;
      if (ctx.driver === "pg") {
        const after = await ctx.pool.query<{ master_name: string }>(
          `SELECT u.name AS master_name FROM requests r
           JOIN users u ON u.id = r.assigned_to WHERE r.id = $1 AND r.status = 'in_progress'`,
          [id]
        );
        winner = after.rows[0]?.master_name ?? u.name;
      } else {
        const after = ctx.sqlite
          .query(
            `SELECT u.name AS master_name FROM requests r
           JOIN users u ON u.id = r.assigned_to WHERE r.id = ? AND r.status = 'in_progress'`
          )
          .get(id) as { master_name: string } | undefined;
        winner = after?.master_name ?? u.name;
      }
      const toast = toastTakeAlreadyInProgress(id, winner);
      return NextResponse.json(
        {
          error: "Параллельный запрос уже перевёл заявку в работу",
          code: "CONFLICT",
          toast,
        },
        { status: 409 }
      );
    }

    const toast = toastInProgress(id, u.name);
    broadcast({ type: "dispatcher_toast", message: toast });
    return NextResponse.json({ ok: true, toast });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Сервис временно недоступен (БД)" },
      { status: 503 }
    );
  }
}
