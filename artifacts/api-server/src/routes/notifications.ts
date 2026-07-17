import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  financingRequestsTable, offersTable, advisorsTable,
  clientReportsTable, advisorReportsTable, adminNotificationsTable,
  annualOffersTable, bestPriceAdsTable
} from "@workspace/db/schema";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { count, eq, and, inArray, notInArray, sql, not, desc, or, isNull, gte, gt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { PUSH_ENABLED, getPublicKey } from "../lib/push.js";

const router: IRouter = Router();

function getUser(req: any) {
  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return null;
  try {
    return jwt.verify(auth, JWT_SECRET) as { userId: number; role: string; advisorId: number | null };
  } catch {
    return null;
  }
}

// Parse a client-supplied "last seen" timestamp (ms since epoch) into a Date, or null.
function parseSince(v: unknown): Date | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  return isNaN(d.getTime()) ? null : d;
}

router.get("/notifications/badge", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "غير مصرح" });

  try {
    // ── CLIENT ──────────────────────────────────────────────────────────
    if (user.role === "client") {
      const [{ newOffers }] = await db
        .select({ newOffers: count() })
        .from(financingRequestsTable)
        .where(
          and(
            eq(financingRequestsTable.userId, user.userId),
            eq(financingRequestsTable.status, "active"),
            sql`${financingRequestsTable.id} IN (
              SELECT DISTINCT request_id FROM offers WHERE status = 'pending'
            )`
          )
        );

      const [{ approved }] = await db
        .select({ approved: count() })
        .from(financingRequestsTable)
        .where(
          and(
            eq(financingRequestsTable.userId, user.userId),
            eq(financingRequestsTable.status, "approved")
          )
        );

      // ── New annual offers / best-price deals (since the client last viewed them) ──
      const now = new Date();
      const sinceAnnual = parseSince(req.query.dealsSeenAnnual);
      const sinceBest = parseSince(req.query.dealsSeenBest);

      const annualConds = [
        eq(annualOffersTable.status, "active"),
        or(isNull(annualOffersTable.validTo), gte(annualOffersTable.validTo, now)),
        ...(sinceAnnual ? [gt(annualOffersTable.createdAt, sinceAnnual)] : []),
      ];
      const [{ newAnnual }] = await db
        .select({ newAnnual: count() })
        .from(annualOffersTable)
        .where(and(...annualConds));

      const bestConds = [
        eq(bestPriceAdsTable.active, true),
        ...(sinceBest ? [gt(bestPriceAdsTable.createdAt, sinceBest)] : []),
      ];
      const [{ newBest }] = await db
        .select({ newBest: count() })
        .from(bestPriceAdsTable)
        .where(and(...bestConds));

      const total =
        Number(newOffers) + Number(approved) + Number(newAnnual) + Number(newBest);
      return res.json({
        total,
        items: [
          ...(Number(newOffers) > 0 ? [{ type: "offers", count: Number(newOffers), label: "طلبات لديها عروض جديدة للمراجعة", link: "/client" }] : []),
          ...(Number(approved) > 0 ? [{ type: "approved", count: Number(approved), label: "طلبات تمّ اعتمادها — تواصل مع المستشار", link: "/client" }] : []),
          ...(Number(newAnnual) > 0 ? [{ type: "annual_offers", count: Number(newAnnual), label: "عروض سنوية جديدة من البنوك", link: "/annual-offers" }] : []),
          ...(Number(newBest) > 0 ? [{ type: "best_price", count: Number(newBest), label: "أفضل الأسعار المعلَنة من البنوك", link: "/" }] : []),
        ],
      });
    }

    // ── ADVISOR ─────────────────────────────────────────────────────────
    if (user.role === "advisor") {
      if (!user.advisorId) return res.json({ total: 0, items: [] });

      const advisorOfferRows = await db
        .select({ requestId: offersTable.requestId })
        .from(offersTable)
        .where(eq(offersTable.advisorId, user.advisorId));

      const offeredIds = advisorOfferRows.map(r => r.requestId);

      let newRequestsCount = 0;
      if (offeredIds.length > 0) {
        const [{ c }] = await db
          .select({ c: count() })
          .from(financingRequestsTable)
          .where(
            and(
              inArray(financingRequestsTable.status, ["pending", "active"]),
              notInArray(financingRequestsTable.id, offeredIds)
            )
          );
        newRequestsCount = Number(c);
      } else {
        const [{ c }] = await db
          .select({ c: count() })
          .from(financingRequestsTable)
          .where(inArray(financingRequestsTable.status, ["pending", "active"]));
        newRequestsCount = Number(c);
      }

      const [{ justApproved }] = await db
        .select({ justApproved: count() })
        .from(offersTable)
        .where(
          and(
            eq(offersTable.advisorId, user.advisorId),
            eq(offersTable.status, "approved")
          )
        );

      const total = newRequestsCount + Number(justApproved);
      return res.json({
        total,
        items: [
          ...(newRequestsCount > 0 ? [{ type: "new_requests", count: newRequestsCount, label: "طلبات عملاء جديدة تنتظر عرضك", link: "/advisor" }] : []),
          ...(Number(justApproved) > 0 ? [{ type: "approved", count: Number(justApproved), label: "عملاء قبلوا عروضك — تواصل معهم الآن", link: "/advisor" }] : []),
        ],
      });
    }

    // ── ADMIN (oversight only) ──────────────────────────────────────────
    if (user.role === "admin") {
      const [{ pendingAdvisors }] = await db
        .select({ pendingAdvisors: count() })
        .from(advisorsTable)
        .where(eq(advisorsTable.status, "pending"));

      const [{ clientReports }] = await db
        .select({ clientReports: count() })
        .from(clientReportsTable)
        .where(eq(clientReportsTable.status, "pending"));

      const [{ advisorReports }] = await db
        .select({ advisorReports: count() })
        .from(advisorReportsTable)
        .where(eq(advisorReportsTable.status, "pending"));

      const [{ adminNotifs }] = await db
        .select({ adminNotifs: count() })
        .from(adminNotificationsTable)
        .where(eq(adminNotificationsTable.read, false));

      const total = Number(pendingAdvisors) + Number(clientReports) + Number(advisorReports) + Number(adminNotifs);
      return res.json({
        total,
        items: [
          ...(Number(pendingAdvisors) > 0 ? [{ type: "advisors", count: Number(pendingAdvisors), label: "طلبات انضمام مستشارين جديدة", link: "/admin" }] : []),
          ...(Number(clientReports) > 0 ? [{ type: "client_reports", count: Number(clientReports), label: "شكاوى عملاء بانتظار المراجعة", link: "/admin" }] : []),
          ...(Number(advisorReports) > 0 ? [{ type: "advisor_reports", count: Number(advisorReports), label: "بلاغات مستشارين بانتظار المراجعة", link: "/admin" }] : []),
          ...(Number(adminNotifs) > 0 ? [{ type: "admin_notifs", count: Number(adminNotifs), label: "إشعارات إدارية جديدة", link: "/admin" }] : []),
        ],
      });
    }

    return res.json({ total: 0, items: [] });
  } catch (err) {
    console.error("notifications badge error:", err);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /admin/notifications — list admin notifications (newest first)
router.get("/admin/notifications", async (req, res) => {
  const user = getUser(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "مخصص للمدير فقط" });
  try {
    const rows = await db.select().from(adminNotificationsTable)
      .orderBy(desc(adminNotificationsTable.createdAt))
      .limit(100);
    res.json(rows);
  } catch (err) {
    console.error("admin notifications error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// POST /admin/notifications/read-all — mark all admin notifications read
router.post("/admin/notifications/read-all", async (req, res) => {
  const user = getUser(req);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "مخصص للمدير فقط" });
  try {
    await db.update(adminNotificationsTable).set({ read: true }).where(eq(adminNotificationsTable.read, false));
    res.json({ ok: true });
  } catch (err) {
    console.error("admin notifications read error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ── WEB PUSH ──────────────────────────────────────────────────────────────

// GET /notifications/push/public-key — VAPID public key for the browser to subscribe
router.get("/notifications/push/public-key", (_req, res) => {
  if (!PUSH_ENABLED) return res.json({ enabled: false, key: null });
  res.json({ enabled: true, key: getPublicKey() });
});

// POST /notifications/push/subscribe — register a browser push subscription
router.post("/notifications/push/subscribe", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "غير مصرح" });
  const { endpoint, keys } = (req.body ?? {}) as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "بيانات الاشتراك غير مكتملة" });
  }
  try {
    await db
      .insert(pushSubscriptionsTable)
      .values({ userId: user.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth })
      .onConflictDoUpdate({
        target: pushSubscriptionsTable.endpoint,
        set: { userId: user.userId, p256dh: keys.p256dh, auth: keys.auth },
      });
    res.json({ ok: true });
  } catch (err) {
    console.error("push subscribe error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// POST /notifications/push/unsubscribe — remove a browser push subscription
router.post("/notifications/push/unsubscribe", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "غير مصرح" });
  const { endpoint } = (req.body ?? {}) as { endpoint?: string };
  if (!endpoint) return res.status(400).json({ error: "endpoint مطلوب" });
  try {
    await db
      .delete(pushSubscriptionsTable)
      .where(and(
        eq(pushSubscriptionsTable.endpoint, endpoint),
        eq(pushSubscriptionsTable.userId, user.userId),
      ));
    res.json({ ok: true });
  } catch (err) {
    console.error("push unsubscribe error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
