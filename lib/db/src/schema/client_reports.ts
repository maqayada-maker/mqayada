import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const clientReportsTable = pgTable("client_reports", {
  id: serial("id").primaryKey(),
  clientUserId: integer("client_user_id"),
  clientName: text("client_name").notNull(),
  requestId: integer("request_id"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export type ClientReport = typeof clientReportsTable.$inferSelect;
