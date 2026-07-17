import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { offersTable, financingRequestsTable, advisorsTable, usersTable } from "@workspace/db/schema";
import { eq, and, inArray, not, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { sendOfferAcceptedEmail } from "../lib/email.js";
import { sendBankApprovalToClientEmail } from "../utils/email.js";
import { sendPushToUser } from "../lib/push.js";

const router: IRouter = Router();

function parseToken(req: any): { userId: number; role: string; advisorId?: number } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as any;
  } catch { return null; }
}

function formatOffer(offer: typeof offersTable.$inferSelect, advisor?: typeof advisorsTable.$inferSelect | null) {
  return {
    ...offer,
    profitRate: Number(offer.profitRate),
    principal: offer.principal ? Number(offer.principal) : null,
    profitAmount: offer.profitAmount ? Number(offer.profitAmount) : null,
    monthlyInstallment: Number(offer.monthlyInstallment),
    totalAmount: Number(offer.totalAmount),
    advisorName: advisor?.name ?? "مستشار",
    advisorCompany: advisor?.company ?? "",
  };
}

/* ── POST /offers/:id/accept — client accepts an offer (must own the request) ── */
router.post("/offers/:id/accept", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
  if (payload.role !== "client") return res.status(403).json({ error: "فقط العملاء يمكنهم اختيار العروض" });

  try {
    const id = parseInt(req.params.id);

    const result = await db.transaction(async (tx) => {
      const [offer] = await tx.select().from(offersTable).where(eq(offersTable.id, id));
      if (!offer) return { error: { status: 404, message: "العرض غير موجود" } };

      // IDOR check: make sure the request belongs to this client
      const [request] = await tx
        .select({ userId: financingRequestsTable.userId, status: financingRequestsTable.status })
        .from(financingRequestsTable)
        .where(eq(financingRequestsTable.id, offer.requestId));

      if (!request) return { error: { status: 404, message: "الطلب غير موجود" } };
      if (request.userId !== payload.userId) return { error: { status: 403, message: "لا يمكنك اختيار عرض لطلب شخص آخر" } };
      if (!["active", "pending"].includes(request.status)) {
        return { error: { status: 400, message: "لا يمكن اختيار عرض لطلب غير نشط" } };
      }
      if (offer.status !== "pending") {
        return { error: { status: 400, message: "لا يمكن اختيار هذا العرض — حالته الحالية لا تسمح بذلك" } };
      }

      // Conditional approve: only succeeds if offer is still pending (single-winner guarantee)
      const approvedRows = await tx
        .update(offersTable)
        .set({ status: "approved" })
        .where(and(eq(offersTable.id, id), eq(offersTable.status, "pending")))
        .returning();

      if (approvedRows.length === 0) {
        return { error: { status: 409, message: "تم اختيار عرض آخر لهذا الطلب — يرجى التحديث" } };
      }

      // Close all other pending offers on the same request
      await tx
        .update(offersTable)
        .set({ status: "closed" })
        .where(and(
          eq(offersTable.requestId, offer.requestId),
          eq(offersTable.status, "pending"),
          not(eq(offersTable.id, id))
        ));

      // Conditional request transition: only flip if still pending/active
      await tx
        .update(financingRequestsTable)
        .set({ status: "approved" })
        .where(and(
          eq(financingRequestsTable.id, offer.requestId),
          inArray(financingRequestsTable.status, ["pending", "active"])
        ));

      const [advisor] = await tx.select().from(advisorsTable).where(eq(advisorsTable.id, approvedRows[0].advisorId));
      return { ok: { updated: approvedRows[0], advisor } };
    });

    if ("error" in result && result.error) {
      return res.status(result.error.status).json({ error: result.error.message });
    }
    const ok = result.ok!;
    // Fire-and-forget email notification
    if (ok.advisor?.email) {
      sendOfferAcceptedEmail({
        to: ok.advisor.email,
        advisorName: ok.advisor.name,
        requestRef: `#${ok.updated.requestId}`,
        profitRate: Number(ok.updated.profitRate),
        monthlyInstallment: Number(ok.updated.monthlyInstallment),
        totalAmount: Number(ok.updated.totalAmount),
      }).catch((e) => console.error("[email] notify failed:", e));
    }
    // Fire-and-forget web push to the advisor (resolve their user account)
    (async () => {
      try {
        const [advisorUser] = await db
          .select({ userId: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.advisorId, ok.updated.advisorId));
        if (advisorUser?.userId) {
          await sendPushToUser(advisorUser.userId, {
            title: "تم قبول عرضك 🎉",
            body: `قبل العميل عرضك على الطلب #${ok.updated.requestId} — تواصل معه الآن.`,
            link: "/advisor",
            tag: `offer-accepted-${ok.updated.id}`,
          });
        }
      } catch (e) {
        console.error("[push] offer-accepted notify failed:", e);
      }
    })();
    res.json({ ...formatOffer(ok.updated, ok.advisor), advisorPhone: ok.advisor?.phone ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/official-approval — advisor marks bank-side official approval ── */
router.post("/offers/:id/official-approval", async (req, res) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const id = parseInt(req.params.id);
    const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, id));
    if (!offer) return res.status(404).json({ error: "العرض غير موجود" });
    if (offer.advisorId !== payload.advisorId) {
      return res.status(403).json({ error: "لا يمكنك تحديث عرض مستشار آخر" });
    }
    if (offer.contactStatus !== "agreed") {
      return res.status(400).json({ error: "يجب تسجيل \"تم الاتفاق\" مع العميل أولاً" });
    }
    if (offer.officialApprovalAt) {
      return res.status(409).json({ error: "تم تسجيل الموافقة الرسمية مسبقاً" });
    }
    const [updated] = await db
      .update(offersTable)
      .set({ officialApprovalAt: new Date() })
      .where(eq(offersTable.id, id))
      .returning();
    res.json({ ok: true, officialApprovalAt: updated.officialApprovalAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/approve — admin approves chosen offer ── */
router.post("/offers/:id/approve", async (req, res) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "admin") return res.status(403).json({ error: "مخصص للمدير فقط" });

  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(offersTable)
      .set({ status: "approved" })
      .where(eq(offersTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Offer not found" });

    await db
      .update(financingRequestsTable)
      .set({ status: "approved" })
      .where(eq(financingRequestsTable.id, updated.requestId));

    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, updated.advisorId));

    // Fire-and-forget: notify client their offer was officially approved
    (async () => {
      try {
        const [reqRow] = await db
          .select({ userId: financingRequestsTable.userId, clientName: financingRequestsTable.fullName })
          .from(financingRequestsTable)
          .where(eq(financingRequestsTable.id, updated.requestId));
        if (!reqRow?.userId) return;
        const [client] = await db
          .select({ email: usersTable.email, name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, reqRow.userId));
        if (!client?.email) return;
        await sendBankApprovalToClientEmail({
          to: client.email,
          clientName: client.name ?? reqRow.clientName ?? "عميلنا",
          requestRef: `#${updated.requestId}`,
          advisorName: advisor?.name ?? "المستشار",
          advisorCompany: advisor?.company ?? "",
        });
      } catch (e) {
        console.error("[email] bank-approval notify failed:", e);
      }
    })();

    // Fire-and-forget web push to the client about the approval
    (async () => {
      try {
        const [reqRow] = await db
          .select({ userId: financingRequestsTable.userId })
          .from(financingRequestsTable)
          .where(eq(financingRequestsTable.id, updated.requestId));
        if (reqRow?.userId) {
          await sendPushToUser(reqRow.userId, {
            title: "تمت الموافقة على عرضك ✅",
            body: `حصل طلبك #${updated.requestId} على الموافقة الرسمية — تابع التفاصيل الآن.`,
            link: "/client",
            tag: `offer-approved-${updated.id}`,
          });
        }
      } catch (e) {
        console.error("[push] bank-approval notify failed:", e);
      }
    })();

    res.json(formatOffer(updated, advisor));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/reject-admin — admin rejects chosen offer with reason → back to active ── */
router.post("/offers/:id/reject-admin", async (req, res) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "admin") return res.status(403).json({ error: "مخصص للمدير فقط" });

  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body as { reason?: string };

    // Mark the rejected offer as "rejected" (not "pending") with the reason
    const [updated] = await db
      .update(offersTable)
      .set({ status: "rejected", rejectionReason: reason ?? null })
      .where(eq(offersTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Offer not found" });

    // Set request back to active so client can choose from remaining offers
    await db
      .update(financingRequestsTable)
      .set({ status: "active" })
      .where(eq(financingRequestsTable.id, updated.requestId));

    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, updated.advisorId));
    res.json(formatOffer(updated, advisor));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/bulk-approve — admin approves all client_accepted offers ── */
router.post("/offers/bulk-approve", async (req, res) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "admin") return res.status(403).json({ error: "مخصص للمدير فقط" });

  try {
    // Get all client_accepted offers
    const pendingOffers = await db
      .select({ id: offersTable.id, requestId: offersTable.requestId })
      .from(offersTable)
      .where(eq(offersTable.status, "client_accepted"));

    if (pendingOffers.length === 0) {
      return res.json({ approved: 0, message: "لا توجد عروض معلقة" });
    }

    const offerIds = pendingOffers.map(o => o.id);
    const requestIds = [...new Set(pendingOffers.map(o => o.requestId))];

    // Approve all
    await db
      .update(offersTable)
      .set({ status: "approved" })
      .where(inArray(offersTable.id, offerIds));

    await db
      .update(financingRequestsTable)
      .set({ status: "approved" })
      .where(inArray(financingRequestsTable.id, requestIds));

    res.json({ approved: pendingOffers.length, message: `تم اعتماد ${pendingOffers.length} عرض بنجاح` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/contact-status — advisor marks "تم التواصل" ── */
router.post("/offers/:id/contact-status", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
  if (payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const id = parseInt(req.params.id);
    const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, id));
    if (!offer) return res.status(404).json({ error: "العرض غير موجود" });
    if (offer.advisorId !== payload.advisorId) {
      return res.status(403).json({ error: "لا يمكنك تحديث عرض مستشار آخر" });
    }
    if (offer.status !== "approved") {
      return res.status(400).json({ error: "لا يمكن تحديث حالة التواصل قبل اعتماد العرض" });
    }
    // Block re-opening once a final result is set
    if (offer.contactStatus === "agreed" || offer.contactStatus === "not_agreed") {
      return res.status(409).json({ error: "تم تسجيل النتيجة النهائية مسبقاً ولا يمكن تعديلها" });
    }
    const [updated] = await db
      .update(offersTable)
      .set({ contactStatus: "contacted", contactStatusUpdatedAt: new Date() })
      .where(eq(offersTable.id, id))
      .returning();
    res.json({ ok: true, contactStatus: updated.contactStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/contact-result — advisor sets "تم الاتفاق" / "لم يتم الاتفاق" ── */
router.post("/offers/:id/contact-result", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
  if (payload.role !== "advisor" || !payload.advisorId) {
    return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  }
  try {
    const id = parseInt(req.params.id);
    const { result } = req.body as { result?: string };
    if (result !== "agreed" && result !== "not_agreed") {
      return res.status(400).json({ error: "نتيجة التواصل غير صحيحة" });
    }
    const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, id));
    if (!offer) return res.status(404).json({ error: "العرض غير موجود" });
    if (offer.advisorId !== payload.advisorId) {
      return res.status(403).json({ error: "لا يمكنك تحديث عرض مستشار آخر" });
    }
    if (offer.status !== "approved") {
      return res.status(400).json({ error: "لا يمكن تحديث حالة التواصل قبل اعتماد العرض" });
    }
    if (offer.contactStatus !== "contacted") {
      if (offer.contactStatus === "agreed" || offer.contactStatus === "not_agreed") {
        return res.status(409).json({ error: "تم تسجيل النتيجة النهائية مسبقاً ولا يمكن تعديلها" });
      }
      return res.status(400).json({ error: "يجب تحديد \"تم التواصل\" أولاً" });
    }
    const [updated] = await db
      .update(offersTable)
      .set({ contactStatus: result, contactStatusUpdatedAt: new Date() })
      .where(eq(offersTable.id, id))
      .returning();
    res.json({ ok: true, contactStatus: updated.contactStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /offers/:id/rate — client rates the offer (only after advisor confirms contact) ── */
router.post("/offers/:id/rate", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح — يجب تسجيل الدخول" });
  if (payload.role !== "client") return res.status(403).json({ error: "مخصص للعملاء فقط" });
  try {
    const id = parseInt(req.params.id);
    const { rating, comment } = req.body as { rating?: number; comment?: string };
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5" });
    }
    const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, id));
    if (!offer) return res.status(404).json({ error: "العرض غير موجود" });
    const [request] = await db
      .select({ userId: financingRequestsTable.userId })
      .from(financingRequestsTable)
      .where(eq(financingRequestsTable.id, offer.requestId));
    if (!request || request.userId !== payload.userId) {
      return res.status(403).json({ error: "لا يمكنك تقييم عرض ليس ضمن طلبك" });
    }
    if (!offer.contactStatus || (offer.contactStatus !== "contacted" && offer.contactStatus !== "agreed" && offer.contactStatus !== "not_agreed")) {
      return res.status(400).json({ error: "لا يمكن التقييم قبل أن يؤكد المستشار التواصل معك" });
    }
    // Atomic single-statement update — guarantees only the first concurrent submission wins
    const updated = await db
      .update(offersTable)
      .set({ clientRating: ratingNum, clientRatingComment: comment ?? null, clientRatingAt: new Date() })
      .where(and(eq(offersTable.id, id), sql`${offersTable.clientRating} IS NULL`))
      .returning();
    if (updated.length === 0) {
      return res.status(409).json({ error: "تم تقييم هذا العرض مسبقاً" });
    }
    res.json({ ok: true, clientRating: updated[0].clientRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
