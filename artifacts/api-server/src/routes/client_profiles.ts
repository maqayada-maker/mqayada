import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { clientProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router: IRouter = Router();

type TokenPayload = { userId: number; role: string };
function parseToken(req: Request): TokenPayload | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as TokenPayload;
  } catch { return null; }
}

function serialize(p: typeof clientProfilesTable.$inferSelect) {
  return {
    ...p,
    salary: p.salary === null ? null : Number(p.salary),
    totalObligations: p.totalObligations === null ? null : Number(p.totalObligations),
  };
}

// GET /client-profile — current client's profile (null if none yet)
router.get("/client-profile", async (req, res) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  try {
    const [profile] = await db.select().from(clientProfilesTable).where(eq(clientProfilesTable.userId, p.userId));
    res.json(profile ? serialize(profile) : null);
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /client-profile — upsert the current client's profile
router.put("/client-profile", async (req, res) => {
  const p = parseToken(req);
  if (!p) return res.status(401).json({ error: "غير مصرح" });
  const { salary, sector, employer, totalObligations } = req.body;
  const toNum = (v: unknown): number | null => (v === undefined || v === null || v === "" ? null : Number(v));
  const salaryNum = toNum(salary);
  const obligationsNum = toNum(totalObligations);
  if (salaryNum !== null && (!Number.isFinite(salaryNum) || salaryNum < 0)) return res.status(400).json({ error: "الراتب غير صالح" });
  if (obligationsNum !== null && (!Number.isFinite(obligationsNum) || obligationsNum < 0)) return res.status(400).json({ error: "إجمالي الالتزامات غير صالح" });
  try {
    const values = {
      userId: p.userId,
      salary: salaryNum === null ? null : String(salaryNum),
      sector: sector || null,
      employer: employer || null,
      totalObligations: obligationsNum === null ? null : String(obligationsNum),
      updatedAt: new Date(),
    };
    const [existing] = await db.select().from(clientProfilesTable).where(eq(clientProfilesTable.userId, p.userId));
    let saved;
    if (existing) {
      [saved] = await db.update(clientProfilesTable).set(values).where(eq(clientProfilesTable.userId, p.userId)).returning();
    } else {
      [saved] = await db.insert(clientProfilesTable).values(values).returning();
    }
    res.json(serialize(saved));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
