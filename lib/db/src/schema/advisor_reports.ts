import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const advisorReportsTable = pgTable("advisor_reports", {
  id: serial("id").primaryKey(),
  reporterAdvisorId: integer("reporter_advisor_id").notNull(),
  reporterName: text("reporter_name").notNull(),
  reportedAdvisorId: integer("reported_advisor_id").notNull(),
  reportedName: text("reported_name").notNull(),
  bankName: text("bank_name").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export type AdvisorReport = typeof advisorReportsTable.$inferSelect;
