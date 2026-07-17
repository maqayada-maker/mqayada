import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { annualOffersTable, advisorsTable } from "@workspace/db/schema";
import { eq, and, or, gte, isNull, desc, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router: IRouter = Router();

type TokenPayload = { userId: number; role: string; advisorId: number | null; name: string };
function parseToken(req: Request): TokenPayload | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as TokenPayload;
  } catch { return null; }
}

async function requireSupervisor(req: Request, res: Response): Promise<{ id: number; company: string } | null> {
  const p = parseToken(req);
  if (!p) { res.status(401).json({ error: "غير مصرح" }); return null; }
  if (p.role !== "supervisor" || !p.advisorId) { res.status(403).json({ error: "مخصص لمشرف المستشارين فقط" }); return null; }
  const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, p.advisorId));
  if (!me) { res.status(404).json({ error: "المشرف غير موجود" }); return null; }
  if (!me.isSupervisor) { res.status(403).json({ error: "تم إلغاء صلاحية الإشراف" }); return null; }
  return { id: me.id, company: me.company };
}

function serialize(o: typeof annualOffersTable.$inferSelect) {
  return { ...o, profitRate: o.profitRate === null ? null : Number(o.profitRate) };
}

// GET /annual-offers — public: all active, non-expired offers (clients browse all banks)
router.get("/annual-offers", async (_req, res) => {
  try {
    const now = new Date();
    const rows = await db.select().from(annualOffersTable)
      .where(and(
        eq(annualOffersTable.status, "active"),
        or(isNull(annualOffersTable.validTo), gte(annualOffersTable.validTo, now)),
      ))
      .orderBy(desc(annualOffersTable.createdAt));
    res.json(rows.map(serialize));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /annual-offers/mine — supervisor: all their bank's offers (any status)
router.get("/annual-offers/mine", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  try {
    const rows = await db.select().from(annualOffersTable)
      .where(eq(annualOffersTable.bankName, me.company))
      .orderBy(desc(annualOffersTable.createdAt));
    res.json(rows.map(serialize));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// POST /annual-offers — supervisor creates for their bank
router.post("/annual-offers", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  const { title, terms, profitRate, financingType, validFrom, validTo, features, status } = req.body;
  if (!title || String(title).trim().length < 2) return res.status(400).json({ error: "عنوان العرض مطلوب" });
  const hasRate = profitRate !== undefined && profitRate !== null && profitRate !== "";
  if (hasRate && !Number.isFinite(Number(profitRate))) return res.status(400).json({ error: "نسبة الربح غير صالحة" });
  try {
    const [created] = await db.insert(annualOffersTable).values({
      bankName: me.company,
      supervisorAdvisorId: me.id,
      title: String(title).trim(),
      terms: terms ? String(terms) : null,
      profitRate: hasRate ? String(Number(profitRate)) : null,
      financingType: financingType || "personal",
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      features: Array.isArray(features) ? features : [],
      status: status === "inactive" ? "inactive" : "active",
    }).returning();
    res.status(201).json(serialize(created));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /annual-offers/:id — supervisor edits own bank's offer
router.put("/annual-offers/:id", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    const [existing] = await db.select().from(annualOffersTable).where(eq(annualOffersTable.id, id));
    if (!existing) return res.status(404).json({ error: "العرض غير موجود" });
    if (existing.bankName !== me.company) return res.status(403).json({ error: "لا يمكنك تعديل عروض بنك آخر" });

    const { title, terms, profitRate, financingType, validFrom, validTo, features, status } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (terms !== undefined) updates.terms = terms ? String(terms) : null;
    if (profitRate !== undefined) {
      if (profitRate === null || profitRate === "") updates.profitRate = null;
      else if (!Number.isFinite(Number(profitRate))) return res.status(400).json({ error: "نسبة الربح غير صالحة" });
      else updates.profitRate = String(Number(profitRate));
    }
    if (financingType !== undefined) updates.financingType = financingType || "personal";
    if (validFrom !== undefined) updates.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updates.validTo = validTo ? new Date(validTo) : null;
    if (features !== undefined) updates.features = Array.isArray(features) ? features : [];
    if (status !== undefined) updates.status = ["active", "inactive"].includes(status) ? status : existing.status;

    const [updated] = await db.update(annualOffersTable).set(updates).where(eq(annualOffersTable.id, id)).returning();
    res.json(serialize(updated));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /annual-offers/:id — supervisor deletes own bank's offer
router.delete("/annual-offers/:id", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    const [existing] = await db.select().from(annualOffersTable).where(eq(annualOffersTable.id, id));
    if (!existing) return res.status(404).json({ error: "العرض غير موجود" });
    if (existing.bankName !== me.company) return res.status(403).json({ error: "لا يمكنك حذف عروض بنك آخر" });
    await db.delete(annualOffersTable).where(eq(annualOffersTable.id, id));
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
