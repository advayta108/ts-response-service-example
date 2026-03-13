import { Pool } from "pg";
import { getPostgresConnectionString } from "../src/lib/postgresUrl";

const url = getPostgresConnectionString();
if (!url)
  throw new Error(
    "DATABASE_URL или POSTGRES_URL_NON_POOLING / POSTGRES_URL (Supabase)"
  );

const pool = new Pool({ connectionString: url });
await pool.query("DELETE FROM requests; DELETE FROM users;");
await pool.query(
  `INSERT INTO users (name, password, role) VALUES
   ('dispatcher','disp123','dispatcher'),
   ('master1','m1pass','master'),
   ('master2','m2pass','master')`
);
const m1 = await pool.query("SELECT id FROM users WHERE name = 'master1'");
const m2 = await pool.query("SELECT id FROM users WHERE name = 'master2'");
const id1 = m1.rows[0].id as number;
const id2 = m2.rows[0].id as number;
const now = new Date();
const t0 = new Date(now.getTime() - 86400000 * 5);
const t1 = new Date(now.getTime() - 86400000 * 2);

const rows: [string, string, string, string, string, number | null, Date][] = [
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
    id1,
    now,
  ],
  [
    "Сидоров",
    "+7 900 111-03-03",
    "ул. Пушкина, 5",
    "Смеситель",
    "assigned",
    id1,
    now,
  ],
  [
    "Козлов",
    "+7 900 111-04-04",
    "ул. Гагарина, 7",
    "Засор",
    "in_progress",
    id1,
    now,
  ],
  [
    "Новикова",
    "+7 900 111-05-05",
    "ул. Мира, 3",
    "Бойлер",
    "assigned",
    id2,
    now,
  ],
  ["Орлов", "+7 900 111-06-06", "пер. Светлый, 2", "Счётчик", "new", null, now],
  [
    "Волкова",
    "+7 900 111-07-07",
    "наб. Речная, 15",
    "Труба холодная",
    "done",
    id1,
    t1,
  ],
  [
    "Соколов",
    "+7 900 111-08-08",
    "ул. Зелёная, 9",
    "Радиатор",
    "done",
    id2,
    t0,
  ],
  [
    "Лебедев",
    "+7 900 111-09-09",
    "ул. Садовая, 4",
    "Отказ от ремонта",
    "canceled",
    id1,
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
];

for (const [
  clientName,
  phone,
  address,
  problemText,
  status,
  assignedTo,
  updatedAt,
] of rows) {
  await pool.query(
    `INSERT INTO requests (client_name, phone, address, problem_text, status, assigned_to, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      clientName,
      phone,
      address,
      problemText,
      status,
      assignedTo,
      updatedAt,
      updatedAt,
    ]
  );
}
await pool.end();
console.log("Seed PG OK:", rows.length, "заявок");
