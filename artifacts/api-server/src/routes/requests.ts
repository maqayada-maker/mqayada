import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { financingRequestsTable, offersTable, advisorsTable, usersTable, advisorPricingRulesTable } from "@workspace/db/schema";
import { eq, count, and, gte, lte, sql, desc, isNotNull, inArray } from "drizzle-orm";
import { CreateRequestBody } from "@workspace/api-zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { sendNewOfferToClientEmail, sendMatchingRequestToAdvisorEmail } from "../utils/email.js";
import { sendPushToUser } from "../lib/push.js";

const router: IRouter = Router();

/* ── Auth helpers ── */
function parseToken(req: any): { userId: number; role: string; advisorId?: number } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as any;
  } catch { return null; }
}
function requireAuth(req: any, res: any): { userId: number; role: string; advisorId?: number } | null {
  const p = parseToken(req);
  if (!p) { res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" }); return null; }
  return p;
}
function requireAdmin(req: any, res: any): boolean {
  const p = parseToken(req);
  if (!p || p.role !== "admin") { res.status(403).json({ error: "مخصص للمدير فقط" }); return false; }
  return true;
}

/* ── GET /requests — advisor sees pending+active requests (anonymized), admin sees all ── */
router.get("/requests", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });

  // Clients cannot access the full list
  if (payload.role === "client") {
    return res.status(403).json({ error: "استخدم /api/requests/my لرؤية طلباتك" });
  }

  try {
    const { status } = req.query;
    let requests = await db
      .select()
      .from(financingRequestsTable)
      .orderBy(financingRequestsTable.createdAt);

    if (status) {
      // Explicit status filter (used by admin)
      requests = requests.filter((r) => r.status === status);
    } else if (payload.role === "advisor") {
      // Advisors see only open requests: pending (no offers yet) and active (has offers but client hasn't chosen)
      requests = requests.filter((r) => r.status === "pending" || r.status === "active");
    }

    const offersCountsRaw = await db
      .select({ requestId: offersTable.requestId, cnt: count() })
      .from(offersTable)
      .groupBy(offersTable.requestId);
    const offersMap = new Map(offersCountsRaw.map((o) => [o.requestId, Number(o.cnt)]));

    const result = requests.map((r) => ({
      ...r,
      salary: Number(r.salary),
      currentDebt: Number(r.currentDebt),
      offersCount: offersMap.get(r.id) ?? 0,
      // Advisors see anonymized PII — admin sees everything
      fullName: payload.role === "admin" ? r.fullName : "مجهول",
      phone: payload.role === "admin" ? r.phone : "محمي",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /requests/pending-chosen — admin only ── */
router.get("/requests/pending-chosen", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const offers = await db
      .select({
        offerId: offersTable.id,
        requestId: offersTable.requestId,
        advisorId: offersTable.advisorId,
        profitRate: offersTable.profitRate,
        monthlyInstallment: offersTable.monthlyInstallment,
        totalAmount: offersTable.totalAmount,
        durationMonths: offersTable.durationMonths,
        notes: offersTable.notes,
        offerStatus: offersTable.status,
        offerCreatedAt: offersTable.createdAt,
        advisorName: advisorsTable.name,
        advisorCompany: advisorsTable.company,
        clientName: financingRequestsTable.fullName,
        clientPhone: financingRequestsTable.phone,
        employer: financingRequestsTable.employer,
        sector: financingRequestsTable.sector,
        currentDebt: financingRequestsTable.currentDebt,
        requestStatus: financingRequestsTable.status,
        requestCreatedAt: financingRequestsTable.createdAt,
      })
      .from(offersTable)
      .leftJoin(advisorsTable, eq(offersTable.advisorId, advisorsTable.id))
      .leftJoin(financingRequestsTable, eq(offersTable.requestId, financingRequestsTable.id))
      .where(eq(offersTable.status, "client_accepted"))
      .orderBy(offersTable.createdAt);

    res.json(offers.map(o => ({
      ...o,
      profitRate: Number(o.profitRate),
      monthlyInstallment: Number(o.monthlyInstallment),
      totalAmount: Number(o.totalAmount),
      currentDebt: Number(o.currentDebt ?? 0),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /requests/my — client's own requests (auto-expires pending after 24h) ── */
router.get("/requests/my", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return;
  try {
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Auto-expire pending requests with no offers older than 24 hours
    const pendingOldRequests = await db
      .select({ id: financingRequestsTable.id })
      .from(financingRequestsTable)
      .where(
        and(
          eq(financingRequestsTable.userId, payload.userId),
          eq(financingRequestsTable.status, "pending"),
          sql`${financingRequestsTable.createdAt} < ${cutoff24h}`
        )
      );

    if (pendingOldRequests.length > 0) {
      const ids = pendingOldRequests.map(r => r.id);
      for (const id of ids) {
        await db
          .update(financingRequestsTable)
          .set({ status: "expired" })
          .where(eq(financingRequestsTable.id, id));
      }
    }

    const requests = await db
      .select()
      .from(financingRequestsTable)
      .where(eq(financingRequestsTable.userId, payload.userId))
      .orderBy(desc(financingRequestsTable.createdAt));

    const offersCountsRaw = await db
      .select({ requestId: offersTable.requestId, cnt: count() })
      .from(offersTable)
      .groupBy(offersTable.requestId);
    const offersMap = new Map(offersCountsRaw.map((o) => [o.requestId, Number(o.cnt)]));

    res.json(requests.map(r => ({
      ...r,
      salary: Number(r.salary),
      currentDebt: Number(r.currentDebt),
      offersCount: offersMap.get(r.id) ?? 0,
    })));
  } catch {
    res.status(401).json({ error: "غير مصرح" });
  }
});

/* ── GET /requests/my/rate-limit ── */
router.get("/requests/my/rate-limit", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return;
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await db
      .select({ createdAt: financingRequestsTable.createdAt })
      .from(financingRequestsTable)
      .where(and(
        eq(financingRequestsTable.userId, payload.userId),
        gte(financingRequestsTable.createdAt, since24h)
      ))
      .orderBy(desc(financingRequestsTable.createdAt));

    const cnt = recent.length;
    let nextAvailableAt: string | null = null;
    if (cnt >= 2) {
      const oldest = recent[recent.length - 1];
      nextAvailableAt = new Date(oldest.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
    res.json({ requestsInWindow: cnt, maxRequests: 2, nextAvailableAt, canSubmit: cnt < 2 });
  } catch {
    res.status(401).json({ error: "غير مصرح" });
  }
});

/* ── GET /offers/my — advisor sees all their submitted offers with request context ── */
router.get("/offers/my", async (req, res) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "advisor") {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  if (!payload.advisorId) return res.status(400).json({ error: "advisorId مفقود" });
  try {
    const offers = await db
      .select({
        offerId: offersTable.id,
        requestId: offersTable.requestId,
        profitRate: offersTable.profitRate,
        principal: offersTable.principal,
        profitAmount: offersTable.profitAmount,
        monthlyInstallment: offersTable.monthlyInstallment,
        totalAmount: offersTable.totalAmount,
        durationMonths: offersTable.durationMonths,
        notes: offersTable.notes,
        offerStatus: offersTable.status,
        offerCreatedAt: offersTable.createdAt,
        contactStatus: offersTable.contactStatus,
        officialApprovalAt: offersTable.officialApprovalAt,
        features: offersTable.features,
        clientRating: offersTable.clientRating,
        clientRatingComment: offersTable.clientRatingComment,
        employer: financingRequestsTable.employer,
        sector: financingRequestsTable.sector,
        financingType: financingRequestsTable.financingType,
        financingPurpose: financingRequestsTable.financingPurpose,
        salary: financingRequestsTable.salary,
        currentDebt: financingRequestsTable.currentDebt,
        remainingMonths: financingRequestsTable.remainingMonths,
        bankName: financingRequestsTable.bankName,
        requestStatus: financingRequestsTable.status,
        requestCreatedAt: financingRequestsTable.createdAt,
        clientName: financingRequestsTable.fullName,
        clientPhone: financingRequestsTable.phone,
      })
      .from(offersTable)
      .leftJoin(financingRequestsTable, eq(offersTable.requestId, financingRequestsTable.id))
      .where(eq(offersTable.advisorId, payload.advisorId))
      .orderBy(desc(offersTable.createdAt));

    res.json(offers.map(o => ({
      ...o,
      profitRate: Number(o.profitRate),
      monthlyInstallment: Number(o.monthlyInstallment),
      totalAmount: Number(o.totalAmount),
      salary: Number(o.salary ?? 0),
      currentDebt: Number(o.currentDebt ?? 0),
      // Reveal client contact info only after offer is approved
      clientName: o.offerStatus === "approved" ? o.clientName : "مجهول",
      clientPhone: o.offerStatus === "approved" ? o.clientPhone : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /requests — create a new request (client must be authenticated) ── */
router.post("/requests", async (req, res) => {
  try {
    const body = CreateRequestBody.parse(req.body);

    let userId: number | null = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number; role: string };
        if (payload.role !== "client") {
          return res.status(403).json({ error: "فقط العملاء يمكنهم رفع طلبات تمويل" });
        }
        userId = payload.userId;

        // Rate limit: max 2 requests per rolling 24 hours
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentRequests = await db
          .select({ createdAt: financingRequestsTable.createdAt })
          .from(financingRequestsTable)
          .where(and(
            eq(financingRequestsTable.userId, userId),
            gte(financingRequestsTable.createdAt, since24h)
          ))
          .orderBy(desc(financingRequestsTable.createdAt));

        if (recentRequests.length >= 2) {
          const oldest = recentRequests[recentRequests.length - 1];
          const nextAvailableAt = new Date(oldest.createdAt.getTime() + 24 * 60 * 60 * 1000);
          return res.status(429).json({
            error: "يمكنك إرسال طلبين كحد أقصى خلال ٢٤ ساعة",
            nextAvailableAt: nextAvailableAt.toISOString(),
          });
        }
      } catch {
        return res.status(401).json({ error: "رمز الجلسة غير صالح" });
      }
    } else {
      return res.status(401).json({ error: "يجب تسجيل الدخول لرفع طلب" });
    }

    const [created] = await db
      .insert(financingRequestsTable)
      .values({
        fullName: body.fullName,
        phone: body.phone || "",
        employer: body.employer,
        sector: body.sector,
        financingPurpose: body.financingPurpose,
        financingType: body.financingType,
        salary: String(body.salary),
        currentDebt: String(body.currentDebt),
        remainingMonths: body.remainingMonths,
        bankName: body.bankName || "",
        notes: body.notes,
        preferredFeature: body.preferredFeature ?? null,
        userId: userId ?? undefined,
      })
      .returning();

    // Fire-and-forget: notify advisors whose pricing rule matches this request
    (async () => {
      try {
        const salaryNum = Number(created.salary);
        const matches = await db
          .select({ advisorId: advisorsTable.id, email: advisorsTable.email, name: advisorsTable.name })
          .from(advisorPricingRulesTable)
          .innerJoin(advisorsTable, eq(advisorPricingRulesTable.advisorId, advisorsTable.id))
          .where(and(
            isNotNull(advisorPricingRulesTable.advisorId),
            eq(advisorPricingRulesTable.sector, created.sector),
            eq(advisorPricingRulesTable.financingType, created.financingType),
            lte(advisorPricingRulesTable.salaryMin, salaryNum),
            gte(advisorPricingRulesTable.salaryMax, salaryNum),
            eq(advisorsTable.status, "approved"),
            eq(advisorsTable.availability, true),
            isNotNull(advisorsTable.email),
          ));
        const seen = new Set<string>();
        const pushedAdvisorIds = new Set<number>();
        for (const m of matches) {
          if (!m.email || seen.has(m.email)) continue;
          seen.add(m.email);
          sendMatchingRequestToAdvisorEmail({
            to: m.email,
            advisorName: m.name ?? "مستشار",
            requestRef: `#${created.id}`,
            sector: created.sector,
            financingType: created.financingType,
            salary: salaryNum,
            bankName: created.bankName ?? "",
          }).catch((e) => console.error("[email] matching-advisor notify failed:", e));
          pushedAdvisorIds.add(m.advisorId);
        }
        // Fire-and-forget web push to each matching advisor (resolve user accounts)
        if (pushedAdvisorIds.size > 0) {
          const advisorUsers = await db
            .select({ userId: usersTable.id, advisorId: usersTable.advisorId })
            .from(usersTable)
            .where(inArray(usersTable.advisorId, Array.from(pushedAdvisorIds)));
          for (const u of advisorUsers) {
            if (!u.userId) continue;
            sendPushToUser(u.userId, {
              title: "طلب تمويل جديد يناسبك 📩",
              body: `وصل طلب جديد (#${created.id}) ضمن نطاق تسعيرك — قدّم عرضك الآن.`,
              link: "/advisor",
              tag: `matching-request-${created.id}`,
            }).catch((e) => console.error("[push] matching-advisor notify failed:", e));
          }
        }
      } catch (e) {
        console.error("[email] matching-advisor lookup failed:", e);
      }
    })();

    res.status(201).json({
      ...created,
      salary: Number(created.salary),
      currentDebt: Number(created.currentDebt),
      offersCount: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid request data" });
  }
});

/* ── GET /requests/:id — admin or request owner only ── */
router.get("/requests/:id", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });
  try {
    const id = parseInt(req.params.id);
    const [request] = await db.select().from(financingRequestsTable).where(eq(financingRequestsTable.id, id));
    if (!request) return res.status(404).json({ error: "Request not found" });

    // Clients can only see their own request
    if (payload.role === "client" && request.userId !== payload.userId) {
      return res.status(403).json({ error: "غير مصرح" });
    }

    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(offersTable)
      .where(eq(offersTable.requestId, id));

    res.json({
      ...request,
      salary: Number(request.salary),
      currentDebt: Number(request.currentDebt),
      offersCount: Number(cnt),
      fullName: payload.role === "admin" ? request.fullName : (request.userId === payload.userId ? request.fullName : "مجهول"),
      phone: payload.role === "admin" ? request.phone : (request.userId === payload.userId ? request.phone : "محمي"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /requests/:id/offers — client (own), advisor, admin ── */
router.get("/requests/:id/offers", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });
  try {
    const requestId = parseInt(req.params.id);

    // Client must own this request
    if (payload.role === "client") {
      const [request] = await db.select({ userId: financingRequestsTable.userId })
        .from(financingRequestsTable)
        .where(eq(financingRequestsTable.id, requestId));
      if (!request) return res.status(404).json({ error: "الطلب غير موجود" });
      if (request.userId !== payload.userId) return res.status(403).json({ error: "لا يمكنك الوصول لعروض طلب شخص آخر" });
    }

    const offers = await db
      .select({
        id: offersTable.id,
        requestId: offersTable.requestId,
        advisorId: offersTable.advisorId,
        profitRate: offersTable.profitRate,
        principal: offersTable.principal,
        profitAmount: offersTable.profitAmount,
        monthlyInstallment: offersTable.monthlyInstallment,
        totalAmount: offersTable.totalAmount,
        durationMonths: offersTable.durationMonths,
        notes: offersTable.notes,
        status: offersTable.status,
        rejectionReason: offersTable.rejectionReason,
        contactStatus: offersTable.contactStatus,
        officialApprovalAt: offersTable.officialApprovalAt,
        features: offersTable.features,
        clientRating: offersTable.clientRating,
        createdAt: offersTable.createdAt,
        advisorName: advisorsTable.name,
        advisorCompany: advisorsTable.company,
        advisorPhone: advisorsTable.phone,
        advisorStatus: advisorsTable.status,
      })
      .from(offersTable)
      .leftJoin(advisorsTable, eq(offersTable.advisorId, advisorsTable.id))
      .where(eq(offersTable.requestId, requestId));

    const result = offers
      .filter((o) => o.advisorStatus === "approved" || o.advisorStatus === null)
      .map((o) => ({
        ...o,
        profitRate: Number(o.profitRate),
        principal: o.principal ? Number(o.principal) : null,
        profitAmount: o.profitAmount ? Number(o.profitAmount) : null,
        monthlyInstallment: Number(o.monthlyInstallment),
        totalAmount: Number(o.totalAmount),
        advisorName: o.advisorName ?? "مستشار",
        advisorCompany: o.advisorCompany ?? "",
        // Phone only revealed after approval
        advisorPhone: o.status === "approved" ? (o.advisorPhone ?? null) : null,
      }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /requests/:id/offers — advisor submits offer (must be approved advisor) ── */
router.post("/requests/:id/offers", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });
  if (payload.role !== "advisor" && payload.role !== "admin") {
    return res.status(403).json({ error: "فقط المستشارون يمكنهم تقديم عروض" });
  }
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) return res.status(400).json({ error: "معرّف الطلب غير صالح" });
    const { profitRate, monthlyInstallment, totalAmount, durationMonths, notes, principal, profitAmount, features } = req.body;

    // Always use advisorId from token — never from body (security fix)
    const resolvedAdvisorId = payload.advisorId;
    if (!resolvedAdvisorId) return res.status(400).json({ error: "advisorId مفقود من الرمز" });

    // Request must exist and still be open to offers (prevents orphan offers + offers on closed deals)
    const [targetRequest] = await db
      .select({ status: financingRequestsTable.status })
      .from(financingRequestsTable)
      .where(eq(financingRequestsTable.id, requestId));
    if (!targetRequest) return res.status(404).json({ error: "الطلب غير موجود" });
    if (!["pending", "active"].includes(targetRequest.status)) {
      return res.status(400).json({ error: "لا يمكن تقديم عرض على طلب غير مفتوح" });
    }

    // Verify advisor is approved and currently available
    const [advisor] = await db.select({
        status: advisorsTable.status,
        name: advisorsTable.name,
        company: advisorsTable.company,
        availability: advisorsTable.availability,
      })
      .from(advisorsTable)
      .where(eq(advisorsTable.id, resolvedAdvisorId));
    if (!advisor || advisor.status !== "approved") {
      return res.status(403).json({ error: "حسابك غير معتمد بعد — يرجى انتظار موافقة الإدارة" });
    }
    if (!advisor.availability) {
      return res.status(403).json({ error: "حالتك \"متوقف مؤقتاً\" — فعّل الاستقبال من بوابتك قبل تقديم العروض" });
    }

    // Prevent duplicate offer from same advisor for same request
    const [existing] = await db
      .select({ id: offersTable.id })
      .from(offersTable)
      .where(and(eq(offersTable.requestId, requestId), eq(offersTable.advisorId, resolvedAdvisorId)));
    if (existing) {
      return res.status(409).json({ error: "لقد قدّمت عرضاً على هذا الطلب مسبقاً" });
    }

    const [offer] = await db
      .insert(offersTable)
      .values({
        requestId,
        advisorId: resolvedAdvisorId,
        profitRate: String(profitRate),
        monthlyInstallment: String(monthlyInstallment),
        totalAmount: String(totalAmount),
        durationMonths,
        notes,
        ...(principal !== undefined ? { principal: String(principal) } : {}),
        ...(profitAmount !== undefined ? { profitAmount: String(profitAmount) } : {}),
        ...(Array.isArray(features) ? { features: features.filter((f): f is string => typeof f === "string").slice(0, 20) } : {}),
      })
      .returning();

    await db
      .update(financingRequestsTable)
      .set({ status: "active" })
      .where(eq(financingRequestsTable.id, requestId));

    // Fire-and-forget: notify the client that a new offer arrived
    (async () => {
      try {
        const [reqRow] = await db
          .select({ userId: financingRequestsTable.userId, clientName: financingRequestsTable.fullName })
          .from(financingRequestsTable)
          .where(eq(financingRequestsTable.id, requestId));
        if (!reqRow?.userId) return;
        const [client] = await db
          .select({ email: usersTable.email, name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, reqRow.userId));
        if (!client?.email) return;
        await sendNewOfferToClientEmail({
          to: client.email,
          clientName: client.name ?? reqRow.clientName ?? "عميلنا",
          requestRef: `#${requestId}`,
          profitRate: Number(offer.profitRate),
          monthlyInstallment: Number(offer.monthlyInstallment),
          totalAmount: Number(offer.totalAmount),
          advisorCompany: advisor.company ?? "",
        });
      } catch (e) {
        console.error("[email] new-offer notify failed:", e);
      }
    })();

    // Fire-and-forget web push to the client about the new offer
    (async () => {
      try {
        const [reqRow] = await db
          .select({ userId: financingRequestsTable.userId })
          .from(financingRequestsTable)
          .where(eq(financingRequestsTable.id, requestId));
        if (reqRow?.userId) {
          await sendPushToUser(reqRow.userId, {
            title: "عرض تمويل جديد 💸",
            body: `وصلك عرض جديد على طلبك #${requestId} — راجعه الآن وقارن.`,
            link: "/client",
            tag: `new-offer-${offer.id}`,
          });
        }
      } catch (e) {
        console.error("[push] new-offer notify failed:", e);
      }
    })();

    res.status(201).json({
      ...offer,
      profitRate: Number(offer.profitRate),
      monthlyInstallment: Number(offer.monthlyInstallment),
      totalAmount: Number(offer.totalAmount),
      advisorName: advisor.name ?? "مستشار",
      advisorCompany: advisor.company ?? "",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid offer data" });
  }
});

export default router;
