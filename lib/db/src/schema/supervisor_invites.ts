import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supervisorInvitesTable = pgTable("supervisor_invites", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  supervisorAdvisorId: integer("supervisor_advisor_id").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupervisorInviteSchema = createInsertSchema(supervisorInvitesTable).omit({ id: true, createdAt: true });
export type InsertSupervisorInvite = z.infer<typeof insertSupervisorInviteSchema>;
export type SupervisorInvite = typeof supervisorInvitesTable.$inferSelect;
