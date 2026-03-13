import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RequestStatus } from "@/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as RequestStatus | null;
  const db = getDb();
  const rows = status
    ? db
        .select()
        .from(requests)
        .where(eq(requests.status, status))
        .orderBy(desc(requests.id))
        .all()
    : db.select().from(requests).orderBy(desc(requests.id)).all();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const clientName = String(body.clientName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const problemText = String(body.problemText ?? "").trim();
  if (!clientName || !phone || !address || !problemText)
    return NextResponse.json(
      { error: "Все поля обязательны: clientName, phone, address, problemText" },
      { status: 400 }
    );
  const now = new Date();
  const db = getDb();
  const r = db
    .insert(requests)
    .values({
      clientName,
      phone,
      address,
      problemText,
      status: "new",
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
  return NextResponse.json(r, { status: 201 });
}
