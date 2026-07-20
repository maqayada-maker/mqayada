import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { rateAlertsTable, bankRateHistoryTable } from "@workspace/db/schema";
import { eq, gte, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { sendPushToUser } from "../lib/push.js";

const router: IRouter = Router();

type TokenPayload = { userId: number; role: string };
function parseToken(req: Request): TokenPayload | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as TokenPayload;
  } catch { return null; }
}

/**
 * Notify every client whose target rate has been reached by a newly
 * published bank rate. Fire-and-forget (callers should .catch and log).
 */
export async function notifyRateAlerts(newRate: number, bankName: string, product: string): Promise<void> {
  const alerts = await db
    .select()
    .from(rateAlertsTable)
    .where(gte(rateAlertsTable.targetRate, String(newRate)));

  await Promise.all(
    alerts.map((a) =>
      sendPushToUser(a.userId, {
        title: "🎯 وصل السعر إلى هدفك",
        body: `${bankName} — ${product} بنسبة ${newRate}٪ (هدفك ${Number(a.targetRate)}٪)`,
        link: "/client?tab=best",
        tag: "rate-alert",
      }).catch((err) => console.error("[rate-alerts] push failed for user", a.userId, err)),
    ),
  );
}

// GET /rate-alert — current user's target rate (null if none)
router.get("/rate-alert", async (req: Request, res: Response) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  try {
    const [alert] = await db.select().from(rateAlertsTable).where(eq(rateAlertsTable.userId, p.userId));
    res.json({ targetRate: alert ? Number(alert.targetRate) : null });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /rate-alert — set/update the target rate
router.put("/rate-alert", async (req: Request, res: Response) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  const rate = Number(req.body?.targetRate);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 20) {
    return res.status(400).json({ error: "أدخل نسبة مستهدفة صحيحة بين 0.1٪ و 20٪" });
  }
  try {
    const [saved] = await db
      .insert(rateAlertsTable)
      .values({ userId: p.userId, targetRate: String(rate) })
      .onConflictDoUpdate({
        target: rateAlertsTable.userId,
        set: { targetRate: String(rate), updatedAt: new Date() },
      })
      .returning();
    res.json({ targetRate: Number(saved.targetRate) });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /rate-alert — remove the target rate
router.delete("/rate-alert", async (req: Request, res: Response) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  try {
    await db.delete(rateAlertsTable).where(eq(rateAlertsTable.userId, p.userId));
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /rate-history — public rate history (for the trend chart)
router.get("/rate-history", async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(bankRateHistoryTable)
      .orderBy(asc(bankRateHistoryTable.recordedAt))
      .limit(500);
    res.json(rows.map((r) => ({ ...r, profitRate: Number(r.profitRate) })));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
