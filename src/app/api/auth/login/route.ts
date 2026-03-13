import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDbContext } from "@/db";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    if (!name || !password)
      return NextResponse.json(
        { error: "Имя и пароль обязательны" },
        { status: 400 }
      );

    const ctx = await getDbContext();
    let row:
      | { id: number; password: string; name: string; role: string }
      | undefined;
    if (ctx.driver === "pg") {
      const users = schemaPg.users;
      row = (
        await ctx.db.select().from(users).where(eq(users.name, name)).limit(1)
      )[0];
    } else {
      const users = schemaSqlite.users;
      row = ctx.db.select().from(users).where(eq(users.name, name)).get();
    }

    if (!row || row.password !== password)
      return NextResponse.json(
        { error: "Неверные учётные данные" },
        { status: 401 }
      );

    const res = NextResponse.json({
      ok: true,
      user: { id: row.id, name: row.name, role: row.role },
    });
    res.cookies.set(
      SESSION_COOKIE_NAME,
      String(row.id),
      sessionCookieOptions()
    );
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Вход временно недоступен (БД). Проверьте миграции." },
      { status: 503 }
    );
  }
}
