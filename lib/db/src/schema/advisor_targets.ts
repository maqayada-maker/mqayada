import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advisorTargetsTable = pgTable("advisor_targets", {
  id: serial("id").primaryKey(),
  advisorId: integer("advisor_id").notNull(),
  label: text("label").notNull(),
  metric: text("metric").notNull().default("offers"),
  targetValue: integer("target_value").notNull(),
  period: text("period").notNull().default("monthly"),
  setByAdvisorId: integer("set_by_advisor_id"),
  setByName: text("set_by_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdvisorTargetSchema = createInsertSchema(advisorTargetsTable).omit({ id: true, createdAt: true });
export type InsertAdvisorTarget = z.infer<typeof insertAdvisorTargetSchema>;
export type AdvisorTarget = typeof advisorTargetsTable.$inferSelect;
