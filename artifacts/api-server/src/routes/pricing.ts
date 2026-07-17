import { Router } from "express";
import { db } from "@workspace/db";
import { advisorPricingRulesTable, advisorsTable } from "@workspace/db/schema";
import { and, eq, lte, gte, asc } from "drizzle-orm";
import { authenticateToken, requireRole } from "./auth";

const router = Router();

const VALID_SECTORS = ["government", "semi_government", "private", "retired"];

// GET /pricing/all-banks — returns best rate per bank for a given (sector, salary, financingType)
router.get("/pricing/all-banks", async (req, res) => {
  const { sector, salary, financingType } = req.query;
  if (!sector || !salary) {
    return res.status(400).json({ error: "sector and salary are required" });
  }
  const salaryNum = Number(salary);
  if (isNaN(salaryNum)) return res.status(400).json({ error: "salary must be a number" });

  const conditions = [
    eq(advisorPricingRulesTable.sector, sector as string),
    lte(advisorPricingRulesTable.salaryMin, salaryNum),
    gte(advisorPricingRulesTable.salaryMax, salaryNum),
  ];
  if (financingType) {
    conditions.push(eq(advisorPricingRulesTable.financingType, financingType as string));
  }

  const rules = await db
    .select()
    .from(advisorPricingRulesTable)
    .where(and(...conditions))
    .orderBy(asc(advisorPricingRulesTable.profitRate));

  // Take best rate per bank
  const seen = new Set<string>();
  const bestPerBank: Array<{ bankName: string; profitRate: number; durationMonths: number | null }> = [];
  for (const r of rules) {
    if (seen.has(r.bankName)) continue;
    seen.add(r.bankName);
    bestPerBank.push({
      bankName: r.bankName,
      profitRate: Number(r.profitRate),
      durationMonths: r.durationMonths,
    });
  }
  return res.json(bestPerBank);
});

router.get("/pricing/best", async (req, res) => {
  const { sector, salary, financingType } = req.query;
  if (!sector || !salary) {
    return res.status(400).json({ error: "sector and salary are required" });
  }
  const salaryNum = Number(salary);
  if (isNaN(salaryNum)) return res.status(400).json({ error: "salary must be a number" });

  const conditions = [
    eq(advisorPricingRulesTable.sector, sector as string),
    lte(advisorPricingRulesTable.salaryMin, salaryNum),
    gte(advisorPricingRulesTable.salaryMax, salaryNum),
  ];
  if (financingType) {
    conditions.push(eq(advisorPricingRulesTable.financingType, financingType as string));
  }

  const rules = await db
    .select()
    .from(advisorPricingRulesTable)
    .where(and(...conditions))
    .orderBy(asc(advisorPricingRulesTable.profitRate));

  if (rules.length === 0) {
    return res.json(null);
  }

  const best = rules[0];
  return res.json({
    profitRate: best.profitRate,
    bankName: best.bankName,
    durationMonths: best.durationMonths,
    financingType: best.financingType,
    sector: best.sector,
    salaryMin: best.salaryMin,
    salaryMax: best.salaryMax,
  });
});

// GET /pricing/rules
// Admin → all rules for all banks
// Advisor → all rules for their bank (not just own — for transparency between bank colleagues)
router.get("/pricing/rules", authenticateToken, async (req, res) => {
  const user = (req as any).user;

  if (user?.role === "admin") {
    const rules = await db
      .select({
        rule: advisorPricingRulesTable,
        advisorName: advisorsTable.name,
        advisorEmployeeId: advisorsTable.employeeId,
      })
      .from(advisorPricingRulesTable)
      .leftJoin(advisorsTable, eq(advisorPricingRulesTable.advisorId, advisorsTable.id))
      .orderBy(asc(advisorPricingRulesTable.bankName), asc(advisorPricingRulesTable.sector), asc(advisorPricingRulesTable.salaryMin));

    return res.json(rules.map(r => ({
      ...r.rule,
      ownerAdvisorName: r.advisorName ?? "غير معروف",
      ownerAdvisorEmployeeId: r.advisorEmployeeId ?? "—",
    })));
  }

  // Advisor: get their bank's name, then return all rules for that bank
  const advisorId = user?.advisorId;
  if (!advisorId) return res.status(403).json({ error: "Advisor ID not found" });

  const [myAdvisor] = await db
    .select()
    .from(advisorsTable)
    .where(eq(advisorsTable.id, advisorId));

  if (!myAdvisor) return res.status(404).json({ error: "Advisor not found" });

  const rules = await db
    .select({
      rule: advisorPricingRulesTable,
      advisorName: advisorsTable.name,
      advisorEmployeeId: advisorsTable.employeeId,
    })
    .from(advisorPricingRulesTable)
    .leftJoin(advisorsTable, eq(advisorPricingRulesTable.advisorId, advisorsTable.id))
    .where(eq(advisorPricingRulesTable.bankName, myAdvisor.company))
    .orderBy(asc(advisorPricingRulesTable.sector), asc(advisorPricingRulesTable.salaryMin));

  return res.json(rules.map(r => ({
    ...r.rule,
    isOwn: r.rule.advisorId === advisorId,
    ownerAdvisorName: r.advisorName ?? "غير معروف",
    ownerAdvisorEmployeeId: r.advisorEmployeeId ?? "—",
  })));
});

router.post("/pricing/rules", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { sector, financingType, salaryMin, salaryMax, profitRate, durationMonths, notes } = req.body;

  if (!VALID_SECTORS.includes(sector)) {
    return res.status(400).json({ error: "Invalid sector" });
  }
  const minNum = Number(salaryMin);
  const maxNum = Number(salaryMax);
  const rateNum = Number(profitRate);
  if (isNaN(minNum) || isNaN(maxNum) || isNaN(rateNum)) {
    return res.status(400).json({ error: "salaryMin, salaryMax, profitRate must be numbers" });
  }
  if (maxNum < minNum) {
    return res.status(400).json({ error: "salaryMax must be >= salaryMin" });
  }

  // ── Admin path ──
  if (user?.role === "admin") {
    const bankName = String(req.body.bankName ?? "").trim();
    if (!bankName) return res.status(400).json({ error: "اسم البنك مطلوب" });
    const [created] = await db
      .insert(advisorPricingRulesTable)
      .values({
        advisorId: null,
        sector,
        financingType: financingType || "personal",
        salaryMin: minNum,
        salaryMax: maxNum,
        profitRate: String(rateNum),
        bankName,
        durationMonths: durationMonths ? Number(durationMonths) : null,
        notes: notes || null,
        lastModifiedByAdvisorId: null,
        lastModifiedByName: "الإدارة",
        lastModifiedAt: new Date(),
      })
      .returning();
    return res.status(201).json({ ...created, isOwn: true, ownerAdvisorName: "الإدارة", ownerAdvisorEmployeeId: "—" });
  }

  // ── Advisor path ──
  if (user?.role !== "advisor") {
    return res.status(403).json({ error: "صلاحية غير كافية" });
  }
  const advisorId = user?.advisorId;
  if (!advisorId) return res.status(403).json({ error: "Advisor ID not found" });

  const [myAdvisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, advisorId));
  if (!myAdvisor) return res.status(404).json({ error: "Advisor not found" });

  // bankName is forced from advisor's own company — advisors cannot set rules for other banks
  const bankName = myAdvisor.company;

  const [created] = await db
    .insert(advisorPricingRulesTable)
    .values({
      advisorId,
      sector,
      financingType: financingType || "personal",
      salaryMin: minNum,
      salaryMax: maxNum,
      profitRate: String(rateNum),
      bankName,
      durationMonths: durationMonths ? Number(durationMonths) : null,
      notes: notes || null,
      lastModifiedByAdvisorId: advisorId,
      lastModifiedByName: myAdvisor.name,
      lastModifiedAt: new Date(),
    })
    .returning();

  return res.status(201).json({ ...created, isOwn: true, ownerAdvisorName: myAdvisor.name, ownerAdvisorEmployeeId: myAdvisor.employeeId });
});

// PUT /pricing/rules/:id
// Admin: edit any rule
// Advisor: edit only THEIR OWN rules (same advisorId) + must be same bank
router.put("/pricing/rules/:id", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const ruleId = Number(req.params.id);
  if (isNaN(ruleId)) return res.status(400).json({ error: "Invalid rule ID" });

  const [existing] = await db.select().from(advisorPricingRulesTable).where(eq(advisorPricingRulesTable.id, ruleId));
  if (!existing) return res.status(404).json({ error: "Rule not found" });

  // Access check: admin can edit any; advisor can only edit their own
  if (user?.role === "advisor") {
    if (existing.advisorId !== user?.advisorId) {
      return res.status(403).json({ error: "لا يمكنك تعديل قواعد مستشار آخر" });
    }
  } else if (user?.role !== "admin") {
    return res.status(403).json({ error: "صلاحية غير كافية" });
  }

  const { profitRate, salaryMin, salaryMax, durationMonths, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (profitRate !== undefined) updates.profitRate = String(Number(profitRate));
  if (salaryMin !== undefined) updates.salaryMin = Number(salaryMin);
  if (salaryMax !== undefined) updates.salaryMax = Number(salaryMax);
  if (durationMonths !== undefined) updates.durationMonths = durationMonths ? Number(durationMonths) : null;
  if (notes !== undefined) updates.notes = notes || null;

  if (!Object.keys(updates).length) return res.status(400).json({ error: "No fields to update" });

  // Track modifier
  if (user?.role === "advisor" && user?.advisorId) {
    const [myAdvisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, user.advisorId));
    updates.lastModifiedByAdvisorId = user.advisorId;
    updates.lastModifiedByName = myAdvisor?.name ?? user?.name ?? "مستشار";
    updates.lastModifiedAt = new Date();
  } else if (user?.role === "admin") {
    updates.lastModifiedByName = "الإدارة";
    updates.lastModifiedAt = new Date();
  }

  const [updated] = await db
    .update(advisorPricingRulesTable)
    .set(updates)
    .where(eq(advisorPricingRulesTable.id, ruleId))
    .returning();

  if (!updated) return res.status(404).json({ error: "Rule not found" });
  return res.json(updated);
});

router.delete("/pricing/rules/:id", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const ruleId = Number(req.params.id);
  if (isNaN(ruleId)) return res.status(400).json({ error: "Invalid rule ID" });

  // Admin can delete any rule; advisor only their own
  const condition = user?.role === "admin"
    ? eq(advisorPricingRulesTable.id, ruleId)
    : and(eq(advisorPricingRulesTable.id, ruleId), eq(advisorPricingRulesTable.advisorId, user?.advisorId));

  const [deleted] = await db
    .delete(advisorPricingRulesTable)
    .where(condition)
    .returning();

  if (!deleted) return res.status(404).json({ error: "Rule not found" });
  return res.json({ success: true });
});

export default router;
