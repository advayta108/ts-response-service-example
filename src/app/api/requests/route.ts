import { NextResponse } from "next/server";
import { getDbContext } from "@/db";
import * as schemaSqlite from "@/db/schema";
import * as schemaPg from "@/db/schema.pg";
import { broadcast } from "@/lib/realtime";
import { toastNewRequest } from "@/lib/toastMessages";
import { eq, desc } from "drizzle-orm";
import type { RequestStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as RequestStatus | null;
    const ctx = await getDbContext();
    const rows =
      ctx.driver === "pg"
        ? status
          ? await ctx.db
              .select()
              .from(schemaPg.requests)
              .where(eq(schemaPg.requests.status, status))
              .orderBy(desc(schemaPg.requests.id))
          : await ctx.db
              .select()
              .from(schemaPg.requests)
              .orderBy(desc(schemaPg.requests.id))
        : status
          ? ctx.db
              .select()
              .from(schemaSqlite.requests)
              .where(eq(schemaSqlite.requests.status, status))
              .orderBy(desc(schemaSqlite.requests.id))
              .all()
          : ctx.db
              .select()
              .from(schemaSqlite.requests)
              .orderBy(desc(schemaSqlite.requests.id))
              .all();
    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Сервис временно недоступен" },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientName = String(body.clientName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const problemText = String(body.problemText ?? "").trim();
    if (!clientName || !phone || !address || !problemText)
      return NextResponse.json(
        {
          error:
            "Все поля обязательны: clientName, phone, address, problemText",
        },
        { status: 400 }
      );
    const now = new Date();
    const ctx = await getDbContext();

    if (ctx.driver === "pg") {
      const ins = await ctx.db
        .insert(schemaPg.requests)
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
        .returning();
      const r = ins[0];
      if (r?.id != null) {
        broadcast({ type: "dispatcher_toast", message: toastNewRequest(r.id) });
      }
      return NextResponse.json(r, { status: 201 });
    }

    const r = ctx.db
      .insert(schemaSqlite.requests)
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
    if (r?.id != null) {
      broadcast({ type: "dispatcher_toast", message: toastNewRequest(r.id) });
    }
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Не удалось сохранить заявку. Повторите позже." },
      { status: 503 }
    );
  }
}
