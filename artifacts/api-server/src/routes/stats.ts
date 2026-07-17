import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { financingRequestsTable, offersTable, advisorsTable, usersTable } from "@workspace/db/schema";
import { count, eq, sum, avg, sql, and, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [{ totalRequests }] = await db.select({ totalRequests: count() }).from(financingRequestsTable);

    const [{ totalOffers }] = await db.select({ totalOffers: count() }).from(offersTable);

    const [{ approvedDeals }] = await db
      .select({ approvedDeals: count() })
      .from(offersTable)
      .where(eq(offersTable.status, "approved"));

    const [{ pendingRequests }] = await db
      .select({ pendingRequests: count() })
      .from(financingRequestsTable)
      .where(eq(financingRequestsTable.status, "pending"));

    const awaitingAdmin = 0;

    const [{ totalAdvisors }] = await db.select({ totalAdvisors: count() }).from(advisorsTable);

    const [{ activeAdvisors }] = await db
      .select({ activeAdvisors: count() })
      .from(advisorsTable)
      .where(eq(advisorsTable.status, "approved"));

    const [{ totalClients }] = await db
      .select({ totalClients: count() })
      .from(usersTable)
      .where(eq(usersTable.role, "client"));

    const [{ totalFinancingRequested }] = await db
      .select({ totalFinancingRequested: sum(financingRequestsTable.currentDebt) })
      .from(financingRequestsTable);

    const [{ totalFinancingOffered }] = await db
      .select({ totalFinancingOffered: sum(offersTable.totalAmount) })
      .from(offersTable);

    const [{ avgProfitRate }] = await db
      .select({ avgProfitRate: avg(offersTable.profitRate) })
      .from(offersTable);

    const advisorsByBank = await db
      .select({ bank: advisorsTable.company, count: count() })
      .from(advisorsTable)
      .where(eq(advisorsTable.status, "approved"))
      .groupBy(advisorsTable.company)
      .orderBy(sql`count(*) desc`);

    const clientsBySector = await db
      .select({ sector: financingRequestsTable.sector, count: count() })
      .from(financingRequestsTable)
      .groupBy(financingRequestsTable.sector)
      .orderBy(sql`count(*) desc`);

    res.json({
      totalRequests: Number(totalRequests),
      totalOffers: Number(totalOffers),
      approvedDeals: Number(approvedDeals),
      pendingRequests: Number(pendingRequests),
      awaitingAdmin: Number(awaitingAdmin),
      totalAdvisors: Number(totalAdvisors),
      activeAdvisors: Number(activeAdvisors),
      totalClients: Number(totalClients),
      totalFinancingRequested: Number(totalFinancingRequested ?? 0),
      totalFinancingOffered: Number(totalFinancingOffered ?? 0),
      avgProfitRate: Number(avgProfitRate ?? 0).toFixed(2),
      advisorsByBank,
      clientsBySector,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /stats/advisor — stats for the logged-in advisor's own offers
router.get("/stats/advisor", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "غير مصرح" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number; advisorId?: number | null };
    const advisorId = payload.advisorId;
    if (!advisorId) return res.status(403).json({ error: "مستشار فقط" });

    const [{ totalSent }] = await db
      .select({ totalSent: count() })
      .from(offersTable)
      .where(eq(offersTable.advisorId, advisorId));

    const [{ clientAccepted }] = await db
      .select({ clientAccepted: count() })
      .from(offersTable)
      .where(and(
        eq(offersTable.advisorId, advisorId),
        inArray(offersTable.status, ["client_accepted", "approved"]),
      ));

    const [{ approved }] = await db
      .select({ approved: count() })
      .from(offersTable)
      .where(and(
        eq(offersTable.advisorId, advisorId),
        eq(offersTable.status, "approved"),
      ));

    const [{ awaitingAdmin }] = await db
      .select({ awaitingAdmin: count() })
      .from(offersTable)
      .where(and(
        eq(offersTable.advisorId, advisorId),
        eq(offersTable.status, "client_accepted"),
      ));

    const [{ rejected }] = await db
      .select({ rejected: count() })
      .from(offersTable)
      .where(and(
        eq(offersTable.advisorId, advisorId),
        eq(offersTable.status, "rejected"),
      ));

    res.json({
      totalSent: Number(totalSent),
      clientAccepted: Number(clientAccepted),
      approved: Number(approved),
      awaitingAdmin: Number(awaitingAdmin),
      rejected: Number(rejected),
    });
  } catch {
    res.status(401).json({ error: "غير مصرح" });
  }
});

export default router;
