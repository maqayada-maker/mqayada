import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { clientReportsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const router: IRouter = Router();

function parseToken(req: any): { userId: number; role: string; name?: string } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as any;
  } catch { return null; }
}

/* ── POST /reports/client — client submits a report/complaint ── */
router.post("/reports/client", async (req: Request, res: Response) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "يجب تسجيل الدخول" });
  if (payload.role !== "client") return res.status(403).json({ error: "مخصص للعملاء فقط" });

  const { subject, description, requestId } = req.body;
  if (!subject || String(subject).trim().length < 5) {
    return res.status(400).json({ error: "عنوان البلاغ مطلوب (5 أحرف على الأقل)" });
  }
  if (!description || String(description).trim().length < 20) {
    return res.status(400).json({ error: "تفاصيل البلاغ مطلوبة (20 حرفاً على الأقل)" });
  }

  try {
    // Get client name from users table
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, payload.userId));
    const clientName = user?.name ?? "عميل";

    const [report] = await db
      .insert(clientReportsTable)
      .values({
        clientUserId: payload.userId,
        clientName,
        requestId: requestId ? Number(requestId) : null,
        subject: String(subject).trim(),
        description: String(description).trim(),
        status: "pending",
      })
      .returning();

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /reports/client — admin views all client reports ── */
router.get("/reports/client", async (req: Request, res: Response) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "admin") {
    return res.status(403).json({ error: "مخصص للمدير فقط" });
  }
  try {
    const reports = await db
      .select()
      .from(clientReportsTable)
      .orderBy(desc(clientReportsTable.createdAt));
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── PATCH /reports/client/:id — admin resolves or dismisses a report ── */
router.patch("/reports/client/:id", async (req: Request, res: Response) => {
  const payload = parseToken(req);
  if (!payload || payload.role !== "admin") {
    return res.status(403).json({ error: "مخصص للمدير فقط" });
  }
  const reportId = parseInt(String(req.params.id));
  const { status, adminNote } = req.body;

  if (!["resolved", "dismissed"].includes(status)) {
    return res.status(400).json({ error: "status must be 'resolved' or 'dismissed'" });
  }
  try {
    const [updated] = await db
      .update(clientReportsTable)
      .set({ status, adminNote: adminNote || null, resolvedAt: new Date() })
      .where(eq(clientReportsTable.id, reportId))
      .returning();

    if (!updated) return res.status(404).json({ error: "Report not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
