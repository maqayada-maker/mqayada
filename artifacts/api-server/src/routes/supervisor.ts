import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  advisorsTable, usersTable, supervisorInvitesTable, advisorTargetsTable, offersTable,
} from "@workspace/db/schema";
import { eq, and, sql, isNotNull } from "drizzle-orm";
import { randomBytes } from "crypto";
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

function requireAdmin(req: Request, res: Response): boolean {
  const p = parseToken(req);
  if (!p) { res.status(401).json({ error: "غير مصرح" }); return false; }
  if (p.role !== "admin") { res.status(403).json({ error: "مخصص للمدير فقط" }); return false; }
  return true;
}

async function requireSupervisor(req: Request, res: Response): Promise<{ id: number; company: string; name: string } | null> {
  const p = parseToken(req);
  if (!p) { res.status(401).json({ error: "غير مصرح" }); return null; }
  if (p.role !== "supervisor" || !p.advisorId) { res.status(403).json({ error: "مخصص لمشرف المستشارين فقط" }); return null; }
  const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, p.advisorId));
  if (!me) { res.status(404).json({ error: "المشرف غير موجود" }); return null; }
  if (!me.isSupervisor) { res.status(403).json({ error: "تم إلغاء صلاحية الإشراف" }); return null; }
  return { id: me.id, company: me.company, name: me.name };
}

/* Compute activity metric value for an advisor */
async function getMetric(advisorId: number, metric: string): Promise<number> {
  if (metric === "agreed") {
    const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(offersTable)
      .where(and(eq(offersTable.advisorId, advisorId), eq(offersTable.contactStatus, "agreed")));
    return Number(c);
  }
  if (metric === "rating") {
    const [{ avg }] = await db.select({ avg: sql<number>`coalesce(avg(${offersTable.clientRating}), 0)` }).from(offersTable)
      .where(and(eq(offersTable.advisorId, advisorId), isNotNull(offersTable.clientRating)));
    return Number(Number(avg).toFixed(2));
  }
  // default: offers submitted
  const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(offersTable)
    .where(eq(offersTable.advisorId, advisorId));
  return Number(c);
}

/* ════════════════ ADMIN: supervisor designation ════════════════ */

// GET /admin/supervisors — list current supervisors (one per bank)
router.get("/admin/supervisors", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db.select().from(advisorsTable)
      .where(and(eq(advisorsTable.isSupervisor, true), eq(advisorsTable.status, "approved")))
      .orderBy(advisorsTable.company);
    res.json(rows.map(a => ({ id: a.id, name: a.name, company: a.company, email: a.email, phone: a.phone, employeeId: a.employeeId })));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/supervisors — designate an advisor as the bank's supervisor (replaces existing)
router.post("/admin/supervisors", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const advisorId = Number(req.body.advisorId);
  if (!advisorId || isNaN(advisorId)) return res.status(400).json({ error: "معرّف المستشار مطلوب" });
  try {
    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, advisorId));
    if (!advisor) return res.status(404).json({ error: "المستشار غير موجود" });
    if (advisor.status !== "approved") return res.status(400).json({ error: "يجب أن يكون المستشار معتمداً" });

    // Demote any existing supervisor in the same bank
    const existing = await db.select().from(advisorsTable)
      .where(and(eq(advisorsTable.company, advisor.company), eq(advisorsTable.isSupervisor, true)));
    for (const ex of existing) {
      if (ex.id === advisorId) continue;
      await db.update(advisorsTable).set({ isSupervisor: false }).where(eq(advisorsTable.id, ex.id));
      await db.update(usersTable).set({ role: "advisor" }).where(eq(usersTable.advisorId, ex.id));
    }

    // Promote the chosen advisor
    await db.update(advisorsTable).set({ isSupervisor: true }).where(eq(advisorsTable.id, advisorId));
    await db.update(usersTable).set({ role: "supervisor" }).where(eq(usersTable.advisorId, advisorId));

    res.json({ ok: true, id: advisorId, company: advisor.company });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /admin/supervisors/:advisorId — remove supervisor role
router.delete("/admin/supervisors/:advisorId", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const advisorId = Number(req.params.advisorId);
  if (isNaN(advisorId)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    await db.update(advisorsTable).set({ isSupervisor: false }).where(eq(advisorsTable.id, advisorId));
    await db.update(usersTable).set({ role: "advisor" }).where(eq(usersTable.advisorId, advisorId));
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

/* ════════════════ SUPERVISOR: self/team/invite/delegate ════════════════ */

// GET /supervisor/me — supervisor profile + invite + delegate info
router.get("/supervisor/me", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  try {
    const [full] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, me.id));
    let delegate = null;
    if (full?.vacationDelegateAdvisorId) {
      const [d] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, full.vacationDelegateAdvisorId));
      if (d) delegate = { id: d.id, name: d.name };
    }
    res.json({ id: me.id, name: me.name, company: me.company, vacationDelegate: delegate });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supervisor/team — bank advisors with target completion
router.get("/supervisor/team", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  try {
    const team = await db.select().from(advisorsTable)
      .where(and(eq(advisorsTable.company, me.company), eq(advisorsTable.status, "approved")))
      .orderBy(advisorsTable.name);

    const result = [];
    for (const a of team) {
      const targets = await db.select().from(advisorTargetsTable).where(eq(advisorTargetsTable.advisorId, a.id));
      const targetSummaries = [];
      for (const t of targets) {
        const current = await getMetric(a.id, t.metric);
        const pct = t.targetValue > 0 ? Math.min(100, Math.round((current / t.targetValue) * 100)) : 0;
        targetSummaries.push({ id: t.id, label: t.label, metric: t.metric, period: t.period, targetValue: t.targetValue, current, pct });
      }
      const avgPct = targetSummaries.length > 0
        ? Math.round(targetSummaries.reduce((s, t) => s + t.pct, 0) / targetSummaries.length)
        : null;
      result.push({
        id: a.id, name: a.name, employeeId: a.employeeId, offersCount: a.offersCount,
        successRate: Number(a.successRate), availability: a.availability,
        isSupervisor: a.isSupervisor, isMe: a.id === me.id,
        joinedViaSupervisor: a.joinedViaSupervisorId === me.id,
        targets: targetSummaries, completionPct: avgPct,
      });
    }
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supervisor/invite — get (or lazily create) the active invite link
router.get("/supervisor/invite", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  try {
    let [invite] = await db.select().from(supervisorInvitesTable)
      .where(and(eq(supervisorInvitesTable.supervisorAdvisorId, me.id), eq(supervisorInvitesTable.status, "active")));
    if (!invite) {
      const token = randomBytes(16).toString("hex");
      [invite] = await db.insert(supervisorInvitesTable)
        .values({ token, supervisorAdvisorId: me.id, company: me.company, status: "active" })
        .returning();
    }
    res.json({ token: invite.token, company: invite.company });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// POST /supervisor/invite/regenerate — revoke old + create new
router.post("/supervisor/invite/regenerate", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  try {
    await db.update(supervisorInvitesTable).set({ status: "revoked" })
      .where(and(eq(supervisorInvitesTable.supervisorAdvisorId, me.id), eq(supervisorInvitesTable.status, "active")));
    const token = randomBytes(16).toString("hex");
    const [invite] = await db.insert(supervisorInvitesTable)
      .values({ token, supervisorAdvisorId: me.id, company: me.company, status: "active" })
      .returning();
    res.json({ token: invite.token, company: invite.company });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// POST /supervisor/vacation-delegate — set/clear delegate
router.post("/supervisor/vacation-delegate", async (req, res) => {
  const me = await requireSupervisor(req, res);
  if (!me) return;
  const delegateAdvisorId = req.body.delegateAdvisorId === null ? null : Number(req.body.delegateAdvisorId);
  try {
    if (delegateAdvisorId !== null) {
      if (isNaN(delegateAdvisorId)) return res.status(400).json({ error: "معرّف غير صالح" });
      if (delegateAdvisorId === me.id) return res.status(400).json({ error: "لا يمكنك تعيين نفسك نائباً" });
      const [d] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, delegateAdvisorId));
      if (!d || d.company !== me.company || d.status !== "approved") {
        return res.status(400).json({ error: "يجب اختيار مستشار معتمد من نفس البنك" });
      }
    }
    await db.update(advisorsTable).set({ vacationDelegateAdvisorId: delegateAdvisorId }).where(eq(advisorsTable.id, me.id));
    res.json({ ok: true, delegateAdvisorId });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// GET /invite-info/:token — public: validate an invite link and return its bank
router.get("/invite-info/:token", async (req, res) => {
  try {
    const [invite] = await db.select().from(supervisorInvitesTable)
      .where(eq(supervisorInvitesTable.token, req.params.token));
    if (!invite || invite.status !== "active") {
      return res.json({ valid: false });
    }
    const [supervisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, invite.supervisorAdvisorId));
    res.json({ valid: true, company: invite.company, supervisorName: supervisor?.name ?? null });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

/* ════════════════ TARGETS (supervisor/admin set, advisor view) ════════════════ */

// GET /advisor/targets — current advisor's own targets with completion
router.get("/advisor/targets", async (req, res) => {
  const p = parseToken(req);
  if (!p || p.role !== "advisor" || !p.advisorId) return res.status(403).json({ error: "مخصص للمستشارين فقط" });
  try {
    const targets = await db.select().from(advisorTargetsTable)
      .where(eq(advisorTargetsTable.advisorId, p.advisorId))
      .orderBy(advisorTargetsTable.createdAt);
    const out = [];
    for (const t of targets) {
      const current = await getMetric(p.advisorId, t.metric);
      const pct = t.targetValue > 0 ? Math.min(100, Math.round((current / t.targetValue) * 100)) : 0;
      out.push({ ...t, current, pct });
    }
    const overall = out.length > 0 ? Math.round(out.reduce((s, t) => s + t.pct, 0) / out.length) : null;
    res.json({ targets: out, overallPct: overall });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// POST /targets — supervisor (own bank) or admin sets a target
router.post("/targets", async (req, res) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  const { advisorId, label, metric, targetValue, period } = req.body;
  const aId = Number(advisorId);
  const tv = Number(targetValue);
  if (!aId || isNaN(aId) || !label || isNaN(tv)) {
    return res.status(400).json({ error: "البيانات غير مكتملة" });
  }
  try {
    const [target] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, aId));
    if (!target) return res.status(404).json({ error: "المستشار غير موجود" });

    if (p.role === "supervisor") {
      if (!p.advisorId) return res.status(403).json({ error: "صلاحية غير كافية" });
      const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, p.advisorId));
      if (!me || !me.isSupervisor) return res.status(403).json({ error: "تم إلغاء صلاحية الإشراف" });
      if (me.company !== target.company) return res.status(403).json({ error: "يمكنك تحديد مستهدفات فريق بنكك فقط" });
    } else if (p.role !== "admin") {
      return res.status(403).json({ error: "صلاحية غير كافية" });
    }

    const [created] = await db.insert(advisorTargetsTable).values({
      advisorId: aId,
      label: String(label).trim(),
      metric: ["offers", "agreed", "rating"].includes(metric) ? metric : "offers",
      targetValue: tv,
      period: ["monthly", "quarterly", "yearly"].includes(period) ? period : "monthly",
      setByAdvisorId: p.advisorId ?? null,
      setByName: p.name ?? (p.role === "admin" ? "الإدارة" : "المشرف"),
    }).returning();
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /targets/:id — supervisor (own bank) or admin
router.delete("/targets/:id", async (req, res) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  try {
    const [t] = await db.select().from(advisorTargetsTable).where(eq(advisorTargetsTable.id, id));
    if (!t) return res.status(404).json({ error: "المستهدف غير موجود" });

    if (p.role === "supervisor") {
      if (!p.advisorId) return res.status(403).json({ error: "صلاحية غير كافية" });
      const [me] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, p.advisorId));
      if (!me || !me.isSupervisor) return res.status(403).json({ error: "تم إلغاء صلاحية الإشراف" });
      const [target] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, t.advisorId));
      if (!target || me.company !== target.company) return res.status(403).json({ error: "صلاحية غير كافية" });
    } else if (p.role !== "admin") {
      return res.status(403).json({ error: "صلاحية غير كافية" });
    }

    await db.delete(advisorTargetsTable).where(eq(advisorTargetsTable.id, id));
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
