import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const rateAlertsTable = pgTable("rate_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  targetRate: numeric("target_rate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type RateAlert = typeof rateAlertsTable.$inferSelect;
