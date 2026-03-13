import { users, requests } from "../src/db/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";
import Database from "better-sqlite3";
import { join } from "path";

const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), "data", "app.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

sqlite.exec("DELETE FROM requests; DELETE FROM users;");

const now = new Date();
db.insert(users).values([
  { name: "dispatcher", password: "disp123", role: "dispatcher" },
  { name: "master1", password: "m1pass", role: "master" },
  { name: "master2", password: "m2pass", role: "master" },
]);

const [d, m1, m2] = sqlite
  .prepare("SELECT id, name FROM users ORDER BY id")
  .all() as { id: number; name: string }[];

db.insert(requests).values([
  {
    clientName: "Иванов",
    phone: "+7 900 111-22-33",
    address: "ул. Ленина, 1",
    problemText: "Не греет вода",
    status: "new",
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    clientName: "Петрова",
    phone: "+7 900 222-33-44",
    address: "пр. Мира, 10",
    problemText: "Протечка под раковиной",
    status: "assigned",
    assignedTo: m1.id,
    createdAt: now,
    updatedAt: now,
  },
  {
    clientName: "Сидоров",
    phone: "+7 900 333-44-55",
    address: "ул. Пушкина, 5",
    problemText: "Замена смесителя",
    status: "assigned",
    assignedTo: m1.id,
    createdAt: now,
    updatedAt: now,
  },
]);

sqlite.close();
console.log("Seed OK. Users: dispatcher/disp123, master1/m1pass, master2/m2pass");
