import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const financingRequestsTable = pgTable("financing_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  employer: text("employer").notNull(),
  sector: text("sector").notNull().default("government"),
  financingPurpose: text("financing_purpose").notNull().default("new_financing"),
  financingType: text("financing_type").notNull().default("personal"),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  currentDebt: numeric("current_debt", { precision: 12, scale: 2 }).notNull(),
  remainingMonths: integer("remaining_months").notNull(),
  bankName: text("bank_name").notNull(),
  notes: text("notes"),
  preferredFeature: text("preferred_feature"),
  userId: integer("user_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinancingRequestSchema = createInsertSchema(financingRequestsTable).omit({ id: true, status: true, createdAt: true });
export type InsertFinancingRequest = z.infer<typeof insertFinancingRequestSchema>;
export type FinancingRequest = typeof financingRequestsTable.$inferSelect;
