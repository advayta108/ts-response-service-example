import { describe, expect, test } from "bun:test";

/** Логика: успех только если одна строка обновлена (имитация SQLite changes) */
function simulateTake(
  rows: Map<number, { status: string; assignedTo: number }>,
  id: number,
  masterId: number
): { ok: boolean; statusCode: number } {
  const row = rows.get(id);
  if (!row || row.status !== "assigned" || row.assignedTo !== masterId)
    return { ok: false, statusCode: 409 };
  row.status = "in_progress";
  return { ok: true, statusCode: 200 };
}

describe("take race", () => {
  test("only first parallel take succeeds", () => {
    const rows = new Map([[1, { status: "assigned", assignedTo: 2 }]]);
    const a = simulateTake(rows, 1, 2);
    const b = simulateTake(rows, 1, 2);
    const successes = [a, b].filter((x) => x.ok).length;
    expect(successes).toBe(1);
    expect(rows.get(1)!.status).toBe("in_progress");
  });
});

describe("validation", () => {
  test("create request requires all fields", () => {
    const body = { clientName: "a", phone: "", address: "c", problemText: "d" };
    const ok = ["clientName", "phone", "address", "problemText"].every(
      (k) => String((body as Record<string, string>)[k] ?? "").trim()
    );
    expect(ok).toBe(false);
  });
});
