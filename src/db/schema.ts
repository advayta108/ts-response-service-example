import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["dispatcher", "master"] }).notNull(),
});

export type RequestStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "done"
  | "canceled";

export const requests = sqliteTable("requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  problemText: text("problem_text").notNull(),
  status: text("status").notNull().$type<RequestStatus>().default("new"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
