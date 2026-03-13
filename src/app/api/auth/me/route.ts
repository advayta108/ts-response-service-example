import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDbContext } from "@/db";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ user: null });
    const ctx = await getDbContext();
    let row: { id: number; name: string; role: string } | undefined;
    if (ctx.driver === "pg") {
      const users = schemaPg.users;
      row = (
        await ctx.db.select().from(users).where(eq(users.id, userId)).limit(1)
      )[0];
    } else {
      const users = schemaSqlite.users;
      row = ctx.db.select().from(users).where(eq(users.id, userId)).get();
    }
    if (!row) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: { id: row.id, name: row.name, role: row.role },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ user: null });
  }
}
