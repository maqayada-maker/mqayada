import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  advisorId: integer("advisor_id").notNull(),
  profitRate: numeric("profit_rate", { precision: 5, scale: 2 }).notNull(),
  principal: numeric("principal", { precision: 12, scale: 2 }),
  profitAmount: numeric("profit_amount", { precision: 12, scale: 2 }),
  monthlyInstallment: numeric("monthly_installment", { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  durationMonths: integer("duration_months").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  contactStatus: text("contact_status"),
  contactStatusUpdatedAt: timestamp("contact_status_updated_at"),
  clientRating: integer("client_rating"),
  clientRatingComment: text("client_rating_comment"),
  clientRatingAt: timestamp("client_rating_at"),
  officialApprovalAt: timestamp("official_approval_at"),
  features: text("features").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, status: true, createdAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
