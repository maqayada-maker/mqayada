import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const annualOffersTable = pgTable("annual_offers", {
  id: serial("id").primaryKey(),
  bankName: text("bank_name").notNull(),
  supervisorAdvisorId: integer("supervisor_advisor_id"),
  title: text("title").notNull(),
  terms: text("terms"),
  profitRate: numeric("profit_rate", { precision: 5, scale: 2 }),
  financingType: text("financing_type").notNull().default("personal"),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  status: text("status").notNull().default("active"),
  features: text("features").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnnualOfferSchema = createInsertSchema(annualOffersTable).omit({ id: true, createdAt: true });
export type InsertAnnualOffer = z.infer<typeof insertAnnualOfferSchema>;
export type AnnualOffer = typeof annualOffersTable.$inferSelect;
