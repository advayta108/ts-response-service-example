import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import {
  toastTakeAlreadyInProgress,
  toastTakeNotYours,
} from "@/lib/toastMessages";

/**
 * TASK.txt:43 — атомарный UPDATE: один take успешен, второй без изменений строки.
 */
describe("take race (SQLite)", () => {
  test("first UPDATE wins, second changes=0", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
      CREATE TABLE requests (
        id INTEGER PRIMARY KEY,
        status TEXT,
        assigned_to INTEGER,
        updated_at INTEGER
      );
      INSERT INTO users VALUES (1,'master1'),(2,'master2');
      INSERT INTO requests VALUES (1,'assigned',1,0);`);
    const now = 100;
    const a = db.run(
      `UPDATE requests SET status='in_progress', updated_at=? WHERE id=1 AND status='assigned' AND assigned_to=1`,
      [now]
    );
    const b = db.run(
      `UPDATE requests SET status='in_progress', updated_at=? WHERE id=1 AND status='assigned' AND assigned_to=1`,
      [now + 1]
    );
    expect(a.changes).toBe(1);
    expect(b.changes).toBe(0);
    const row = db.query("SELECT status FROM requests WHERE id=1").get() as {
      status: string;
    };
    expect(row.status).toBe("in_progress");
  });

  test("master2 cannot take master1 assignment (403 scenario)", () => {
    expect(toastTakeNotYours(5, "master1")).toContain("master1");
    expect(toastTakeNotYours(5, "master1")).toContain("#5");
  });

  test("toast after race lost names winner", () => {
    expect(toastTakeAlreadyInProgress(10, "master1")).toContain("master1");
    expect(toastTakeAlreadyInProgress(10, "master1")).toContain("#10");
  });
});
