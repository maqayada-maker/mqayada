import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advisorsTable = pgTable("advisors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  employeeId: text("employee_id").notNull(),
  appointmentDate: text("appointment_date"),
  monthsExperience: integer("months_experience").notNull().default(0),
  offersCount: integer("offers_count").notNull().default(0),
  successRate: numeric("success_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  availability: boolean("availability").notNull().default(true),
  status: text("status").notNull().default("pending"),
  pendingCompany: text("pending_company"),
  bankChangeStatus: text("bank_change_status"),
  bankChangeRequestedAt: timestamp("bank_change_requested_at"),
  isSupervisor: boolean("is_supervisor").notNull().default(false),
  supervisorAdvisorId: integer("supervisor_advisor_id"),
  vacationDelegateAdvisorId: integer("vacation_delegate_advisor_id"),
  joinedViaSupervisorId: integer("joined_via_supervisor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  rejectedAt: timestamp("rejected_at"),
});

export const insertAdvisorSchema = createInsertSchema(advisorsTable).omit({ id: true, offersCount: true, successRate: true, createdAt: true });
export type InsertAdvisor = z.infer<typeof insertAdvisorSchema>;
export type Advisor = typeof advisorsTable.$inferSelect;
