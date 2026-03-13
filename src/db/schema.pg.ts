import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
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

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  problemText: text("problem_text").notNull(),
  status: text("status").notNull().$type<RequestStatus>().default("new"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
