import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { advisorsTable, advisorReportsTable, offersTable, usersTable, financingRequestsTable } from "@workspace/db/schema";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET, authenticateToken } from "./auth.js";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "غير مصرح" }); return false; }
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { role: string };
    if (payload.role !== "admin") { res.status(403).json({ error: "مخصص للمدير فقط" }); return false; }
    return true;
  } catch {
    res.status(401).json({ error: "رمز الجلسة غير صالح" });
    return false;
  }
}

function parseAdvisorToken(req: Request): { role: string; advisorId: number | null; name: string } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as { role: string; advisorId: number | null; name: string };
  } catch { return null; }
}

/* ── GET /advisors/pending ── */
router.get("/advisors/pending", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const pending = await db
      .select()
      .from(advisorsTable)
      .where(eq(advisorsTable.status, "pending"))
      .orderBy(advisorsTable.createdAt);
    res.json(pending.map((a) => ({ ...a, successRate: Number(a.successRate) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/my-bank ── all approved advisors in same bank as the calling advisor */
router.get("/advisors/my-bank", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, payload.advisorId));
    if (!me) return res.status(404).json({ error: "المستشار غير موجود" });

    const colleagues = await db
      .select()
      .from(advisorsTable)
      .where(and(
        eq(advisorsTable.company, me.company),
        eq(advisorsTable.status, "approved"),
      ))
      .orderBy(advisorsTable.name);

    res.json(colleagues.map(a => ({
      id: a.id,
      name: a.name,
      company: a.company,
      employeeId: a.employeeId,
      monthsExperience: a.monthsExperience,
      offersCount: a.offersCount,
      successRate: Number(a.successRate),
      availability: a.availability,
      isMe: a.id === payload.advisorId,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/leaderboard — public top advisors by avg rating + ratings count ── */
router.get("/advisors/leaderboard", async (_req: Request, res: Response) => {
  try {
    const stats = await db
      .select({
        advisorId: offersTable.advisorId,
        avgRating: sql<number>`avg(${offersTable.clientRating})`,
        ratingCount: sql<number>`count(${offersTable.clientRating})`,
        agreedCount: sql<number>`count(*) filter (where ${offersTable.contactStatus} = 'agreed')`,
      })
      .from(offersTable)
      .where(isNotNull(offersTable.clientRating))
      .groupBy(offersTable.advisorId);

    const advisorIds = stats.map((s) => s.advisorId);
    if (advisorIds.length === 0) return res.json([]);

    const advisors = await db
      .select()
      .from(advisorsTable)
      .where(eq(advisorsTable.status, "approved"));
    const adMap = new Map(advisors.map((a) => [a.id, a]));

    const board = stats
      .map((s) => {
        const a = adMap.get(s.advisorId);
        if (!a) return null;
        const avg = Number(s.avgRating ?? 0);
        const count = Number(s.ratingCount ?? 0);
        return {
          advisorId: a.id,
          name: a.name,
          company: a.company,
          monthsExperience: a.monthsExperience,
          avgRating: Number(avg.toFixed(2)),
          ratingCount: count,
          agreedCount: Number(s.agreedCount ?? 0),
          trustedAdvisor: count >= 10 && avg >= 4,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const A = a!, B = b!;
        if (B.avgRating !== A.avgRating) return B.avgRating - A.avgRating;
        return B.ratingCount - A.ratingCount;
      })
      .slice(0, 20);

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/me — current advisor profile (availability state) ── */
router.get("/advisors/me", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, payload.advisorId));
    if (!me) return res.status(404).json({ error: "المستشار غير موجود" });
    res.json({ ...me, successRate: Number(me.successRate) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/me/analytics — deeper performance metrics for the advisor ── */
router.get("/advisors/me/analytics", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const advisorId = payload.advisorId;
    const rows = await db
      .select({
        status: offersTable.status,
        contactStatus: offersTable.contactStatus,
        totalAmount: offersTable.totalAmount,
        profitAmount: offersTable.profitAmount,
        clientRating: offersTable.clientRating,
        offerCreatedAt: offersTable.createdAt,
        requestCreatedAt: financingRequestsTable.createdAt,
      })
      .from(offersTable)
      .leftJoin(financingRequestsTable, eq(offersTable.requestId, financingRequestsTable.id))
      .where(eq(offersTable.advisorId, advisorId));

    const totalOffers = rows.length;
    const approvedOffers = rows.filter((r) => r.status === "approved").length;
    const agreedDeals = rows.filter((r) => r.contactStatus === "agreed").length;

    // Conversion rate: approved offers / total submitted offers
    const conversionRate = totalOffers > 0 ? (approvedOffers / totalOffers) * 100 : 0;

    // Average response time (hours) between request creation and offer submission
    const responseDeltas = rows
      .filter((r) => r.requestCreatedAt && r.offerCreatedAt)
      .map((r) => (new Date(r.offerCreatedAt).getTime() - new Date(r.requestCreatedAt as Date).getTime()) / 3_600_000)
      .filter((h) => h >= 0);
    const avgResponseTimeHours = responseDeltas.length > 0
      ? responseDeltas.reduce((a, b) => a + b, 0) / responseDeltas.length
      : null;

    // Expected revenue: profit on offers that converted (approved or agreed)
    const wonRows = rows.filter((r) => r.status === "approved" || r.contactStatus === "agreed");
    const expectedRevenue = wonRows.reduce((sum, r) => sum + Number(r.profitAmount ?? 0), 0);
    const wonVolume = wonRows.reduce((sum, r) => sum + Number(r.totalAmount ?? 0), 0);

    // Pipeline value: total amount of offers still pending a client decision
    const pipelineValue = rows
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + Number(r.totalAmount ?? 0), 0);

    // Average client rating
    const ratings = rows.map((r) => r.clientRating).filter((v): v is number => typeof v === "number");
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    res.json({
      totalOffers,
      approvedOffers,
      agreedDeals,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgResponseTimeHours: avgResponseTimeHours === null ? null : Math.round(avgResponseTimeHours * 10) / 10,
      expectedRevenue: Math.round(expectedRevenue * 100) / 100,
      wonVolume: Math.round(wonVolume * 100) / 100,
      pipelineValue: Math.round(pipelineValue * 100) / 100,
      avgRating: avgRating === null ? null : Math.round(avgRating * 10) / 10,
      ratingsCount: ratings.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PATCH /advisors/me/availability — advisor toggles availability ── */
router.patch("/advisors/me/availability", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  const { availability } = req.body as { availability?: boolean };
  if (typeof availability !== "boolean") {
    return res.status(400).json({ error: "قيمة غير صالحة" });
  }
  try {
    const [updated] = await db
      .update(advisorsTable)
      .set({ availability })
      .where(eq(advisorsTable.id, payload.advisorId))
      .returning();
    if (!updated) return res.status(404).json({ error: "المستشار غير موجود" });
    res.json({ ok: true, availability: updated.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PATCH /advisors/me/bank-change — advisor requests bank transfer ── */
router.patch("/advisors/me/bank-change", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  const { newCompany } = req.body as { newCompany?: string };
  if (!newCompany || typeof newCompany !== "string" || newCompany.trim().length < 2) {
    return res.status(400).json({ error: "اسم البنك الجديد مطلوب" });
  }
  try {
    const [current] = await db.select({ company: advisorsTable.company, bankChangeStatus: advisorsTable.bankChangeStatus })
      .from(advisorsTable).where(eq(advisorsTable.id, payload.advisorId));
    if (!current) return res.status(404).json({ error: "المستشار غير موجود" });
    if (current.bankChangeStatus === "pending") {
      return res.status(409).json({ error: "لديك طلب نقل بنك قيد المراجعة" });
    }
    if (current.company === newCompany.trim()) {
      return res.status(400).json({ error: "البنك الجديد مطابق لبنكك الحالي" });
    }
    const [updated] = await db.update(advisorsTable)
      .set({
        pendingCompany: newCompany.trim(),
        bankChangeStatus: "pending",
        bankChangeRequestedAt: new Date(),
      })
      .where(eq(advisorsTable.id, payload.advisorId))
      .returning();
    res.json({ ok: true, pendingCompany: updated.pendingCompany, bankChangeStatus: updated.bankChangeStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/bank-change-requests — admin lists pending bank changes ── */
router.get("/advisors/bank-change-requests", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db.select({
        id: advisorsTable.id,
        name: advisorsTable.name,
        company: advisorsTable.company,
        pendingCompany: advisorsTable.pendingCompany,
        bankChangeStatus: advisorsTable.bankChangeStatus,
        bankChangeRequestedAt: advisorsTable.bankChangeRequestedAt,
        phone: advisorsTable.phone,
        employeeId: advisorsTable.employeeId,
      })
      .from(advisorsTable)
      .where(eq(advisorsTable.bankChangeStatus, "pending"))
      .orderBy(advisorsTable.bankChangeRequestedAt);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/bank-change/approve ── */
router.post("/advisors/:id/bank-change/approve", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(String(req.params.id));
    const [current] = await db.select({ pendingCompany: advisorsTable.pendingCompany, status: advisorsTable.bankChangeStatus })
      .from(advisorsTable).where(eq(advisorsTable.id, id));
    if (!current || current.status !== "pending" || !current.pendingCompany) {
      return res.status(404).json({ error: "لا يوجد طلب نقل قيد المراجعة" });
    }
    const [updated] = await db.update(advisorsTable)
      .set({
        company: current.pendingCompany,
        pendingCompany: null,
        bankChangeStatus: "approved",
      })
      .where(eq(advisorsTable.id, id))
      .returning();
    res.json({ ok: true, company: updated.company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/bank-change/reject ── */
router.post("/advisors/:id/bank-change/reject", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(String(req.params.id));
    const [current] = await db.select({ status: advisorsTable.bankChangeStatus })
      .from(advisorsTable).where(eq(advisorsTable.id, id));
    if (!current || current.status !== "pending") {
      return res.status(404).json({ error: "لا يوجد طلب نقل قيد المراجعة" });
    }
    const [updated] = await db.update(advisorsTable)
      .set({ pendingCompany: null, bankChangeStatus: "rejected" })
      .where(eq(advisorsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "المستشار غير موجود" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors ── (admin-only: returns full advisor records incl. contact info) */
router.get("/advisors", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const advisors = await db
      .select()
      .from(advisorsTable)
      .where(eq(advisorsTable.status, "approved"))
      .orderBy(advisorsTable.createdAt);

    // Per-advisor activity metrics: distinct requests worked + average client rating
    const metrics = await db
      .select({
        advisorId: offersTable.advisorId,
        requestsWorked: sql<number>`count(distinct ${offersTable.requestId})`,
        ratingAvg: sql<number>`coalesce(avg(${offersTable.clientRating}), 0)`,
      })
      .from(offersTable)
      .groupBy(offersTable.advisorId);
    const metricById = new Map(metrics.map((m) => [m.advisorId, m]));

    const nameById = new Map(advisors.map((a) => [a.id, a.name]));

    // Most-active ranking (1 = most active) by submitted offers count
    const ranked = [...advisors].sort((x, y) => (y.offersCount ?? 0) - (x.offersCount ?? 0));
    const rankById = new Map<number, number>();
    ranked.forEach((a, i) => rankById.set(a.id, i + 1));

    const result = advisors.map((a) => {
      const m = metricById.get(a.id);
      return {
        ...a,
        successRate: Number(a.successRate),
        rating: m ? Number(Number(m.ratingAvg).toFixed(2)) : 0,
        requestsWorked: m ? Number(m.requestsWorked) : 0,
        activityRank: rankById.get(a.id) ?? null,
        supervisorName: a.supervisorAdvisorId ? (nameById.get(a.supervisorAdvisorId) ?? null) : null,
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/revoke-membership ── admin removes an advisor from the platform */
router.post("/advisors/:id/revoke-membership", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
    const [updated] = await db
      .update(advisorsTable)
      .set({ status: "revoked", isSupervisor: false, availability: false })
      .where(eq(advisorsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "المستشار غير موجود" });
    // Demote the linked user account and clear any references to this advisor
    await db.update(usersTable).set({ role: "advisor" }).where(eq(usersTable.advisorId, id));
    await db.update(advisorsTable).set({ supervisorAdvisorId: null }).where(eq(advisorsTable.supervisorAdvisorId, id));
    await db.update(advisorsTable).set({ vacationDelegateAdvisorId: null }).where(eq(advisorsTable.vacationDelegateAdvisorId, id));
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/approve ── */
router.post("/advisors/:id/approve", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(String(req.params.id));
    const [updated] = await db
      .update(advisorsTable)
      .set({ status: "approved" })
      .where(eq(advisorsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Advisor not found" });
    res.json({ ...updated, successRate: Number(updated.successRate) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/reject ── */
router.post("/advisors/:id/reject", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(String(req.params.id));
    const [updated] = await db
      .update(advisorsTable)
      .set({ status: "rejected", rejectedAt: new Date() })
      .where(eq(advisorsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Advisor not found" });
    res.json({ ...updated, successRate: Number(updated.successRate) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors/:id/report ── advisor reports another advisor */
router.post("/advisors/:id/report", async (req: Request, res: Response) => {
  const payload = parseAdvisorToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  const reportedId = parseInt(String(req.params.id));
  if (isNaN(reportedId)) return res.status(400).json({ error: "Invalid advisor ID" });
  if (reportedId === payload.advisorId) return res.status(400).json({ error: "لا يمكنك الإبلاغ عن نفسك" });

  const { reason } = req.body;
  if (!reason || String(reason).trim().length < 10) {
    return res.status(400).json({ error: "يجب ذكر سبب البلاغ (10 أحرف على الأقل)" });
  }

  try {
    const [reporter] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, payload.advisorId));
    const [reported] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, reportedId));
    if (!reporter || !reported) return res.status(404).json({ error: "مستشار غير موجود" });

    // Only allow reporting colleagues in same bank
    if (reporter.company !== reported.company) {
      return res.status(403).json({ error: "يمكنك الإبلاغ عن مستشارين ضمن بنكك فقط" });
    }

    const [report] = await db
      .insert(advisorReportsTable)
      .values({
        reporterAdvisorId: reporter.id,
        reporterName: reporter.name,
        reportedAdvisorId: reported.id,
        reportedName: reported.name,
        bankName: reporter.company,
        reason: String(reason).trim(),
        status: "pending",
      })
      .returning();

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /advisors/reports ── admin only */
router.get("/advisors/reports", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const reports = await db
      .select()
      .from(advisorReportsTable)
      .orderBy(desc(advisorReportsTable.createdAt));
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PATCH /advisors/reports/:id ── admin action: dismiss or remove the reported advisor */
router.patch("/advisors/reports/:id", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const reportId = parseInt(String(req.params.id));
  const { action, adminNote } = req.body;
  if (!["dismiss", "remove"].includes(action)) {
    return res.status(400).json({ error: "action must be 'dismiss' or 'remove'" });
  }
  try {
    const [report] = await db.select().from(advisorReportsTable).where(eq(advisorReportsTable.id, reportId));
    if (!report) return res.status(404).json({ error: "Report not found" });

    const newStatus = action === "remove" ? "actioned" : "dismissed";
    const [updated] = await db
      .update(advisorReportsTable)
      .set({ status: newStatus, adminNote: adminNote || null, resolvedAt: new Date() })
      .where(eq(advisorReportsTable.id, reportId))
      .returning();

    // If action is "remove", deactivate the reported advisor
    if (action === "remove") {
      await db
        .update(advisorsTable)
        .set({ status: "rejected", rejectedAt: new Date() })
        .where(eq(advisorsTable.id, report.reportedAdvisorId));
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /advisors ── admin only: direct advisor creation */
router.post("/advisors", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { name, company, phone, email, employeeId, appointmentDate } = req.body;
    if (!name || !company || !employeeId) {
      return res.status(400).json({ error: "الاسم والجهة والرقم الوظيفي مطلوبة" });
    }
    const [advisor] = await db
      .insert(advisorsTable)
      .values({ name, company, phone: phone ?? "", email: email ?? null, employeeId, appointmentDate: appointmentDate ?? null, status: "pending" })
      .returning();
    res.status(201).json({ ...advisor, successRate: Number(advisor.successRate) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid advisor data" });
  }
});

export default router;
