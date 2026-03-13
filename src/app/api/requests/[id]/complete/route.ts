import { NextResponse } from "next/server";
import { getSqlite } from "@/db";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  const db = getDb();
  const u = db.select().from(users).where(eq(users.id, userId)).get();
  if (!u || u.role !== "master")
    return NextResponse.json({ error: "Только мастер" }, { status: 403 });

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const sqlite = getSqlite();
  const r = sqlite
    .prepare(
      `UPDATE requests SET status = 'done', updated_at = ? 
       WHERE id = ? AND status = 'in_progress' AND assigned_to = ?`
    )
    .run(now, id, userId);

  if (r.changes === 0)
    return NextResponse.json(
      { error: "Завершить можно только свою заявку в работе" },
      { status: 400 }
    );
  return NextResponse.json({ ok: true });
}
