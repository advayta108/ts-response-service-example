import { NextResponse } from "next/server";
import { getDbContext } from "@/db";
import { getSessionUserId } from "@/lib/session";
import { eq } from "drizzle-orm";
import { broadcast } from "@/lib/realtime";
import { toastReturnedToQueue } from "@/lib/toastMessages";
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

    const now = new Date();
    const nowSec = Math.floor(now.getTime() / 1000);
    let changes = 0;
    if (ctx.driver === "pg") {
      const r = await ctx.pool.query(
        `UPDATE requests SET status = 'new', assigned_to = NULL, updated_at = $1
         WHERE id = $2 AND assigned_to = $3 AND status IN ('assigned','in_progress')`,
        [now, id, userId]
      );
      changes = r.rowCount ?? 0;
    } else {
      const r = ctx.sqlite.run(
        `UPDATE requests SET status = 'new', assigned_to = NULL, updated_at = ?
         WHERE id = ? AND assigned_to = ? AND status IN ('assigned','in_progress')`,
        [nowSec, id, userId]
      );
      changes = r.changes;
    }
    if (!changes)
      return NextResponse.json(
        { error: "Вернуть можно только свою заявку (assigned / in_progress)" },
        { status: 400 }
      );
    const toast = toastReturnedToQueue(id, u.name);
    broadcast({ type: "dispatcher_toast", message: toast });
    return NextResponse.json({ ok: true, toast });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Сервис временно недоступен" },
      { status: 503 }
    );
  }
}
