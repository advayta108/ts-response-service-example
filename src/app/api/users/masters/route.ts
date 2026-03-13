import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  const rows = db.select().from(users).where(eq(users.role, "master")).all();
  return NextResponse.json(rows.map((r) => ({ id: r.id, name: r.name })));
}
