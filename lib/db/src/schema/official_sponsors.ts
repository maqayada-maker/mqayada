import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const officialSponsorsTable = pgTable("official_sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfficialSponsorSchema = createInsertSchema(officialSponsorsTable).omit({ id: true, createdAt: true });
export type InsertOfficialSponsor = z.infer<typeof insertOfficialSponsorSchema>;
export type OfficialSponsor = typeof officialSponsorsTable.$inferSelect;
