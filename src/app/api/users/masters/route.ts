import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDbContext } from "@/db";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";

export async function GET() {
  try {
    const ctx = await getDbContext();
    const rows =
      ctx.driver === "pg"
        ? await ctx.db
            .select()
            .from(schemaPg.users)
            .where(eq(schemaPg.users.role, "master"))
        : ctx.db
            .select()
            .from(schemaSqlite.users)
            .where(eq(schemaSqlite.users.role, "master"))
            .all();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "БД" }, { status: 503 });
  }
}
