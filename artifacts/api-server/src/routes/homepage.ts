import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { officialSponsorsTable, bestPriceAdsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "غير مصرح" }); return false; }
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { role: string };
    if (payload.role !== "admin") { res.status(403).json({ error: "مخصص للمدير فقط" }); return false; }
    return true;
  } catch { res.status(401).json({ error: "رمز الجلسة غير صالح" }); return false; }
}

const serAd = (a: typeof bestPriceAdsTable.$inferSelect) => ({
  ...a, profitRate: Number(a.profitRate), sponsorshipAmount: Number(a.sponsorshipAmount),
});

/* ════════════════ OFFICIAL SPONSORS ════════════════ */

// GET /sponsors — public active sponsors
router.get("/sponsors", async (_req, res) => {
  try {
    const rows = await db.select().from(officialSponsorsTable)
      .where(eq(officialSponsorsTable.active, true))
      .orderBy(asc(officialSponsorsTable.sortOrder), asc(officialSponsorsTable.id));
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/sponsors — admin lists all
router.get("/admin/sponsors", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db.select().from(officialSponsorsTable)
      .orderBy(asc(officialSponsorsTable.sortOrder), asc(officialSponsorsTable.id));
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/admin/sponsors", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { name, logoUrl, website, active, sortOrder } = req.body;
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: "اسم الراعي مطلوب" });
  try {
    const [created] = await db.insert(officialSponsorsTable).values({
      name: String(name).trim(),
      logoUrl: logoUrl || null,
      website: website || null,
      active: active === undefined ? true : !!active,
      sortOrder: Number(sortOrder) || 0,
    }).returning();
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.put("/admin/sponsors/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  const { name, logoUrl, website, active, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (logoUrl !== undefined) updates.logoUrl = logoUrl || null;
  if (website !== undefined) updates.website = website || null;
  if (active !== undefined) updates.active = !!active;
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder) || 0;
  try {
    const [updated] = await db.update(officialSponsorsTable).set(updates).where(eq(officialSponsorsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "الراعي غير موجود" });
    res.json(updated);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/admin/sponsors/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    const [deleted] = await db.delete(officialSponsorsTable).where(eq(officialSponsorsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "الراعي غير موجود" });
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

/* ════════════════ BEST-PRICE ADS ════════════════ */

// GET /best-price-ads — public active ads
router.get("/best-price-ads", async (_req, res) => {
  try {
    const rows = await db.select().from(bestPriceAdsTable)
      .where(eq(bestPriceAdsTable.active, true))
      .orderBy(asc(bestPriceAdsTable.sortOrder), asc(bestPriceAdsTable.id));
    res.json(rows.map(serAd));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/best-price-ads — admin lists all
router.get("/admin/best-price-ads", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db.select().from(bestPriceAdsTable)
      .orderBy(asc(bestPriceAdsTable.sortOrder), asc(bestPriceAdsTable.id));
    res.json(rows.map(serAd));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/admin/best-price-ads", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { product, bankName, profitRate, sponsorshipAmount, active, sortOrder } = req.body;
  if (!product || !bankName) return res.status(400).json({ error: "اسم المنتج والبنك مطلوبان" });
  if (isNaN(Number(profitRate))) return res.status(400).json({ error: "نسبة الربح مطلوبة" });
  try {
    const [created] = await db.insert(bestPriceAdsTable).values({
      product: String(product).trim(),
      bankName: String(bankName).trim(),
      profitRate: String(Number(profitRate)),
      sponsorshipAmount: String(Number(sponsorshipAmount) || 0),
      active: active === undefined ? true : !!active,
      sortOrder: Number(sortOrder) || 0,
    }).returning();
    res.status(201).json(serAd(created));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.put("/admin/best-price-ads/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  const { product, bankName, profitRate, sponsorshipAmount, active, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (product !== undefined) updates.product = String(product).trim();
  if (bankName !== undefined) updates.bankName = String(bankName).trim();
  if (profitRate !== undefined) {
    if (!Number.isFinite(Number(profitRate))) return res.status(400).json({ error: "نسبة الربح غير صالحة" });
    updates.profitRate = String(Number(profitRate));
  }
  if (sponsorshipAmount !== undefined) updates.sponsorshipAmount = String(Number(sponsorshipAmount) || 0);
  if (active !== undefined) updates.active = !!active;
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder) || 0;
  try {
    const [updated] = await db.update(bestPriceAdsTable).set(updates).where(eq(bestPriceAdsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "الإعلان غير موجود" });
    res.json(serAd(updated));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/admin/best-price-ads/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    const [deleted] = await db.delete(bestPriceAdsTable).where(eq(bestPriceAdsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "الإعلان غير موجود" });
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
