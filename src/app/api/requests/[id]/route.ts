import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { getDbContext } from "@/db";
import { broadcast } from "@/lib/realtime";
import { toastAssigned, toastCanceledByDispatcher } from "@/lib/toastMessages";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";

export async function PATCH(
  req: Request,
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
    if (!u || u.role !== "dispatcher")
      return NextResponse.json({ error: "Только диспетчер" }, { status: 403 });

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id))
      return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const now = new Date();
    const nowSec = Math.floor(now.getTime() / 1000);

    if (action === "cancel") {
      let changes = 0;
      if (ctx.driver === "pg") {
        const r = await ctx.pool.query(
          `UPDATE requests SET status = 'canceled', updated_at = $1 WHERE id = $2 AND status NOT IN ('done','canceled')`,
          [now, id]
        );
        changes = r.rowCount ?? 0;
      } else {
        const r = ctx.sqlite.run(
          `UPDATE requests SET status = 'canceled', updated_at = ? WHERE id = ? AND status NOT IN ('done','canceled')`,
          [nowSec, id]
        );
        changes = r.changes;
      }
      if (!changes)
        return NextResponse.json(
          { error: "Заявка не найдена или уже закрыта" },
          { status: 400 }
        );
      const toast = toastCanceledByDispatcher(id);
      broadcast({ type: "dispatcher_toast", message: toast });
      return NextResponse.json({ ok: true, toast });
    }

    if (action === "assign") {
      const masterId = parseInt(String(body.masterId), 10);
      if (!Number.isFinite(masterId))
        return NextResponse.json(
          { error: "masterId обязателен" },
          { status: 400 }
        );
      const master =
        ctx.driver === "pg"
          ? (
              await ctx.db
                .select()
                .from(schemaPg.users)
                .where(eq(schemaPg.users.id, masterId))
                .limit(1)
            )[0]
          : ctx.db
              .select()
              .from(schemaSqlite.users)
              .where(eq(schemaSqlite.users.id, masterId))
              .get();
      if (!master || master.role !== "master")
        return NextResponse.json(
          { error: "Некорректный мастер" },
          { status: 400 }
        );

      let client_name = "";
      let problem_text = "";
      if (ctx.driver === "pg") {
        const row = await ctx.pool.query<{
          client_name: string;
          problem_text: string;
        }>("SELECT client_name, problem_text FROM requests WHERE id = $1", [
          id,
        ]);
        client_name = row.rows[0]?.client_name ?? "";
        problem_text = row.rows[0]?.problem_text ?? "";
      } else {
        const row = ctx.sqlite
          .query("SELECT client_name, problem_text FROM requests WHERE id = ?")
          .get(id) as { client_name: string; problem_text: string } | undefined;
        client_name = row?.client_name ?? "";
        problem_text = row?.problem_text ?? "";
      }

      let changes = 0;
      if (ctx.driver === "pg") {
        const r = await ctx.pool.query(
          `UPDATE requests SET status = 'assigned', assigned_to = $1, updated_at = $2 WHERE id = $3 AND status = 'new'`,
          [masterId, now, id]
        );
        changes = r.rowCount ?? 0;
      } else {
        const r = ctx.sqlite.run(
          `UPDATE requests SET status = 'assigned', assigned_to = ?, updated_at = ? WHERE id = ? AND status = 'new'`,
          [masterId, nowSec, id]
        );
        changes = r.changes;
      }
      if (!changes)
        return NextResponse.json(
          { error: "Назначение только из статуса new" },
          { status: 400 }
        );
      broadcast({
        type: "assigned_to_master",
        requestId: id,
        masterId,
        masterName: master.name,
        clientName: client_name,
        problemText: problem_text,
      });
      const toast = toastAssigned(id, master.name);
      broadcast({ type: "dispatcher_toast", message: toast });
      return NextResponse.json({ ok: true, toast });
    }

    return NextResponse.json({ error: "Неизвестное action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Сервис временно недоступен" },
      { status: 503 }
    );
  }
}
