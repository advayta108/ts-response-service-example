import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const id = await getSessionUserId();
  if (!id) return NextResponse.json({ user: null });
  const db = getDb();
  const row = db.select().from(users).where(eq(users.id, id)).get();
  if (!row) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: row.id, name: row.name, role: row.role },
  });
}
