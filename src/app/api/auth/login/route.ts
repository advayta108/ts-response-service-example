import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");
  if (!name || !password)
    return NextResponse.json({ error: "Имя и пароль обязательны" }, { status: 400 });

  const db = getDb();
  const row = db.select().from(users).where(eq(users.name, name)).get();
  if (!row || row.password !== password)
    return NextResponse.json({ error: "Неверные учётные данные" }, { status: 401 });

  const res = NextResponse.json({
    ok: true,
    user: { id: row.id, name: row.name, role: row.role },
  });
  res.cookies.set(SESSION_COOKIE_NAME, String(row.id), sessionCookieOptions());
  return res;
}
