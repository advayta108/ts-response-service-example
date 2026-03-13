import { NextResponse } from "next/server";
import { getDb, getSqlite } from "@/db";
import { requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/session";
import { users } from "@/db/schema";

/** Диспетчер: назначить мастера (new → assigned) или отменить */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const db = getDb();
  const u = db.select().from(users).where(eq(users.id, userId)).get();
  if (!u || u.role !== "dispatcher")
    return NextResponse.json({ error: "Только диспетчер" }, { status: 403 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const now = Math.floor(Date.now() / 1000);

  if (action === "cancel") {
    const sqlite = getSqlite();
    const r = sqlite
      .prepare(
        `UPDATE requests SET status = 'canceled', updated_at = ? WHERE id = ? AND status NOT IN ('done','canceled')`
      )
      .run(now, id);
    if (r.changes === 0)
      return NextResponse.json({ error: "Заявка не найдена или уже закрыта" }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "assign") {
    const masterId = parseInt(String(body.masterId), 10);
    if (!Number.isFinite(masterId))
      return NextResponse.json({ error: "masterId обязателен" }, { status: 400 });
    const master = db.select().from(users).where(eq(users.id, masterId)).get();
    if (!master || master.role !== "master")
      return NextResponse.json({ error: "Некорректный мастер" }, { status: 400 });

    const sqlite = getSqlite();
    const r = sqlite
      .prepare(
        `UPDATE requests SET status = 'assigned', assigned_to = ?, updated_at = ? WHERE id = ? AND status = 'new'`
      )
      .run(masterId, now, id);
    if (r.changes === 0)
      return NextResponse.json(
        { error: "Назначение только из статуса new" },
        { status: 400 }
      );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Неизвестное action" }, { status: 400 });
}
