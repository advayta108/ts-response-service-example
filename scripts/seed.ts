import { users, requests } from "../src/db/schema";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../src/db/schema";
import { Database } from "bun:sqlite";
import { getSqliteFilePath } from "../src/lib/sqlitePath";

const dbPath = getSqliteFilePath();
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

sqlite.exec("DELETE FROM requests; DELETE FROM users;");

const now = new Date();
const t0 = new Date(now.getTime() - 86400000 * 5);
const t1 = new Date(now.getTime() - 86400000 * 2);

db.insert(users)
  .values([
    { name: "dispatcher", password: "disp123", role: "dispatcher" },
    { name: "master1", password: "m1pass", role: "master" },
    { name: "master2", password: "m2pass", role: "master" },
  ])
  .run();

const m1 = sqlite
  .query("SELECT id FROM users WHERE name = ?")
  .get("master1") as { id: number };
const m2 = sqlite
  .query("SELECT id FROM users WHERE name = ?")
  .get("master2") as { id: number };
if (!m1 || !m2) throw new Error("seed: masters missing");

const R = [
  [
    "Иванов",
    "+7 900 111-01-01",
    "ул. Ленина, 1",
    "Не греет вода",
    "new",
    null,
    now,
  ],
  [
    "Петрова",
    "+7 900 111-02-02",
    "пр. Мира, 10",
    "Протечка",
    "assigned",
    m1.id,
    now,
  ],
  [
    "Сидоров",
    "+7 900 111-03-03",
    "ул. Пушкина, 5",
    "Смеситель",
    "assigned",
    m1.id,
    now,
  ],
  [
    "Козлов",
    "+7 900 111-04-04",
    "ул. Гагарина, 7",
    "Засор",
    "in_progress",
    m1.id,
    now,
  ],
  [
    "Новикова",
    "+7 900 111-05-05",
    "ул. Мира, 3",
    "Бойлер",
    "assigned",
    m2.id,
    now,
  ],
  ["Орлов", "+7 900 111-06-06", "пер. Светлый, 2", "Счётчик", "new", null, now],
  [
    "Волкова",
    "+7 900 111-07-07",
    "наб. Речная, 15",
    "Труба холодная",
    "done",
    m1.id,
    t1,
  ],
  [
    "Соколов",
    "+7 900 111-08-08",
    "ул. Зелёная, 9",
    "Радиатор",
    "done",
    m2.id,
    t0,
  ],
  [
    "Лебедев",
    "+7 900 111-09-09",
    "ул. Садовая, 4",
    "Отказ от ремонта",
    "canceled",
    m1.id,
    t1,
  ],
  [
    "Морозов",
    "+7 900 111-10-10",
    "пр. Победы, 20",
    "Плановая замена",
    "canceled",
    null,
    now,
  ],
  [
    "Фёдоров",
    "+7 900 111-11-11",
    "ул. Школьная, 8",
    "Шум в трубах",
    "new",
    null,
    now,
  ],
  [
    "Романова",
    "+7 900 111-12-12",
    "ул. Центральная, 11",
    "Горячая вода слабая",
    "assigned",
    m2.id,
    now,
  ],
  [
    "Григорьев",
    "+7 900 111-13-13",
    "ул. Южная, 6",
    "Установка фильтра",
    "new",
    null,
    now,
  ],
  [
    "Дмитриева",
    "+7 900 111-14-14",
    "ул. Северная, 14",
    "Протечка в подвале",
    "done",
    m1.id,
    t0,
  ],
  [
    "Егоров",
    "+7 900 111-15-15",
    "ул. Лесная, 22",
    "Замена стояка",
    "in_progress",
    m2.id,
    now,
  ],
] as const;

for (const [
  clientName,
  phone,
  address,
  problemText,
  status,
  assignedTo,
  updatedAt,
] of R) {
  db.insert(requests)
    .values({
      clientName,
      phone,
      address,
      problemText,
      status: status as
        | "new"
        | "assigned"
        | "in_progress"
        | "done"
        | "canceled",
      assignedTo: assignedTo ?? null,
      createdAt: updatedAt,
      updatedAt,
    })
    .run();
}

sqlite.close();
console.log(
  "Seed OK:",
  R.length,
  "заявок. Users: dispatcher/disp123, master1/m1pass, master2/m2pass"
);
