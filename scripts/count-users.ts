import { Database } from "bun:sqlite";
const db = new Database(process.env.DATABASE_URL || "/data/app.db");
const row = db.query("SELECT COUNT(*) as c FROM users").get() as { c: number };
console.log(row.c);
db.close();
