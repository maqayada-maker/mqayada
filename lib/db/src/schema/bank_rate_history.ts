import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";

export const bankRateHistoryTable = pgTable("bank_rate_history", {
  id: serial("id").primaryKey(),
  product: text("product").notNull(),
  bankName: text("bank_name").notNull(),
  profitRate: numeric("profit_rate", { precision: 5, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export type BankRateHistory = typeof bankRateHistoryTable.$inferSelect;
