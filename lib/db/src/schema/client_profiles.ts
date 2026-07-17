import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientProfilesTable = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  sector: text("sector"),
  employer: text("employer"),
  totalObligations: numeric("total_obligations", { precision: 12, scale: 2 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientProfileSchema = createInsertSchema(clientProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type ClientProfile = typeof clientProfilesTable.$inferSelect;
