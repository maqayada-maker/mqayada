import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bestPriceAdsTable = pgTable("best_price_ads", {
  id: serial("id").primaryKey(),
  product: text("product").notNull(),
  bankName: text("bank_name").notNull(),
  profitRate: numeric("profit_rate", { precision: 5, scale: 2 }).notNull(),
  sponsorshipAmount: numeric("sponsorship_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBestPriceAdSchema = createInsertSchema(bestPriceAdsTable).omit({ id: true, createdAt: true });
export type InsertBestPriceAd = z.infer<typeof insertBestPriceAdSchema>;
export type BestPriceAd = typeof bestPriceAdsTable.$inferSelect;
