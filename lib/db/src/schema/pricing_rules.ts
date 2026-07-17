import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advisorPricingRulesTable = pgTable("advisor_pricing_rules", {
  id: serial("id").primaryKey(),
  advisorId: integer("advisor_id"),
  sector: text("sector").notNull(),
  financingType: text("financing_type").notNull().default("personal"),
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  profitRate: numeric("profit_rate", { precision: 5, scale: 2 }).notNull(),
  bankName: text("bank_name").notNull(),
  durationMonths: integer("duration_months"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastModifiedByAdvisorId: integer("last_modified_by_advisor_id"),
  lastModifiedByName: text("last_modified_by_name"),
  lastModifiedAt: timestamp("last_modified_at"),
});

export const insertPricingRuleSchema = createInsertSchema(advisorPricingRulesTable).omit({ id: true, createdAt: true });
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type PricingRule = typeof advisorPricingRulesTable.$inferSelect;
