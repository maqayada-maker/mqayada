import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable, advisorsTable, supervisorInvitesTable, adminNotificationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendAdvisorRegistrationEmail,
  sendAdvisorDocumentRequestEmail,
  sendEmailVerificationEmail,
  generateVerificationToken,
} from "../utils/email.js";

const router: IRouter = Router();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it in Replit Secrets before starting the server.");
}
const JWT_SECRET: string = process.env.JWT_SECRET;

function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" });
    }

    const allowedRoles = ["client", "advisor"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: "دور غير مسموح به" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "البريد الإلكتروني مسجّل مسبقاً" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role ?? "client";

    if (userRole === "advisor") {
      const employeeId = req.body.employeeId ?? "";
      const appointmentDate = req.body.appointmentDate ?? null;
      const monthsExperience = Number(req.body.monthsExperience ?? 0);

      // Invite-link registration: tie the new advisor to a supervisor and force their bank
      const inviteToken: string | undefined = req.body.inviteToken;
      let supervisorAdvisorId: number | null = null;
      let inviteCompany: string | null = null;
      if (inviteToken) {
        const [invite] = await db.select().from(supervisorInvitesTable).where(eq(supervisorInvitesTable.token, inviteToken));
        if (invite && invite.status === "active") {
          supervisorAdvisorId = invite.supervisorAdvisorId;
          inviteCompany = invite.company;
        }
      }

      const company = inviteCompany ?? req.body.company ?? "";
      if (!company || !employeeId) {
        return res.status(400).json({ error: "اسم الجهة والرقم الوظيفي مطلوبان للمستشار" });
      }
      const [advisor] = await db
        .insert(advisorsTable)
        .values({
          name, company, phone: phone ?? "", email, employeeId, appointmentDate,
          monthsExperience: isNaN(monthsExperience) ? 0 : monthsExperience,
          status: "pending",
          supervisorAdvisorId: supervisorAdvisorId ?? undefined,
          joinedViaSupervisorId: supervisorAdvisorId ?? undefined,
        })
        .returning();

      await db
        .insert(usersTable)
        .values({ name, email, phone: phone ?? null, passwordHash, role: userRole, advisorId: advisor.id, emailVerified: false })
        .returning();

      // Notify admin when an advisor joins through a supervisor invite link
      if (supervisorAdvisorId) {
        const [supervisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, supervisorAdvisorId));
        await db.insert(adminNotificationsTable).values({
          type: "advisor_via_supervisor",
          message: `انضم المستشار "${name}" عبر رابط دعوة المشرف "${supervisor?.name ?? "—"}" في بنك ${company}`,
          relatedId: advisor.id,
        }).catch((err) => console.error("admin notification error:", err));
      }

      Promise.all([
        sendAdvisorRegistrationEmail({ name, company, email: email ?? "", phone: phone ?? "", employeeId, appointmentDate, monthsExperience: isNaN(monthsExperience) ? 0 : monthsExperience }),
        sendAdvisorDocumentRequestEmail({ name, email: email ?? "", company }),
      ]).catch(err => console.error("Email send error:", err));

      return res.status(201).json({
        pending: true,
        message: "تم تقديم طلب التسجيل بنجاح. سيتم مراجعة بياناتك من قِبل إدارة المنصة وسيصلك إشعار عند الموافقة. تحقق من بريدك الإلكتروني لمعرفة المستندات المطلوبة.",
      });
    }

    // Client registration: generate verification token
    const verificationToken = generateVerificationToken();

    const [user] = await db
      .insert(usersTable)
      .values({ name, email, phone: phone ?? null, passwordHash, role: userRole, emailVerified: false, emailVerificationToken: verificationToken })
      .returning();

    // Send verification email (fire-and-forget)
    sendEmailVerificationEmail({ name, email, token: verificationToken })
      .catch(err => console.error("Verification email error:", err));

    const token = signToken({ userId: user.id, role: user.role, name: user.name, advisorId: null });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, advisorId: null, emailVerified: false },
      emailVerificationSent: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    let advisorCompany: string | undefined;
    if (user.advisorId) {
      const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, user.advisorId));
      if (user.role === "advisor") {
        if (advisor?.status === "pending") {
          return res.status(403).json({
            error: "حسابك قيد المراجعة من قِبل إدارة المنصة. سيتم إشعارك عند الموافقة.",
            pending: true,
          });
        }
        if (advisor?.status === "rejected") {
          return res.status(403).json({
            error: "تم رفض طلب انضمامك.",
            rejected: true,
            rejectedAt: advisor.rejectedAt ? advisor.rejectedAt.toISOString() : null,
          });
        }
        if (advisor?.status === "revoked") {
          return res.status(403).json({
            error: "تم إلغاء عضويتك في المنصة. يرجى التواصل مع الإدارة.",
            revoked: true,
          });
        }
      }
      advisorCompany = advisor?.company;
    }

    const token = signToken({ userId: user.id, role: user.role, name: user.name, advisorId: user.advisorId });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        advisorId: user.advisorId,
        company: advisorCompany,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/auth/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مصرح" });
    }
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string; name: string; advisorId: number | null };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    let meCompany: string | undefined;
    if (user.advisorId) {
      const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, user.advisorId));
      meCompany = advisor?.company;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      advisorId: user.advisorId,
      company: meCompany,
      emailVerified: user.emailVerified,
    });
  } catch {
    res.status(401).json({ error: "رمز الجلسة غير صالح" });
  }
});

// Verify email via token
router.get("/auth/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "رمز التحقق مطلوب" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.emailVerificationToken, token));

    if (!user) {
      return res.status(404).json({ error: "رمز التحقق غير صالح أو منتهي الصلاحية" });
    }

    if (user.emailVerified) {
      return res.json({ alreadyVerified: true, message: "البريد الإلكتروني مؤكّد مسبقاً" });
    }

    await db
      .update(usersTable)
      .set({ emailVerified: true, emailVerificationToken: null })
      .where(eq(usersTable.id, user.id));

    res.json({ success: true, message: "تم تأكيد بريدك الإلكتروني بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Resend verification email
router.post("/auth/resend-verification", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مصرح" });
    }
    const jwtToken = authHeader.slice(7);
    const payload = jwt.verify(jwtToken, JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (user.emailVerified) return res.json({ message: "البريد مؤكّد مسبقاً" });

    const newToken = generateVerificationToken();
    await db.update(usersTable).set({ emailVerificationToken: newToken }).where(eq(usersTable.id, user.id));
    sendEmailVerificationEmail({ name: user.name, email: user.email, token: newToken })
      .catch(err => console.error("Resend verification error:", err));

    res.json({ message: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني" });
  } catch {
    res.status(401).json({ error: "رمز الجلسة غير صالح" });
  }
});

// Change password (requires auth)
router.post("/auth/change-password", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مصرح" });
    }
    const jwtToken = authHeader.slice(7);
    const payload = jwt.verify(jwtToken, JWT_SECRET) as { userId: number };

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "كلمة المرور الحالية والجديدة مطلوبتان" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch {
    res.status(401).json({ error: "رمز الجلسة غير صالح" });
  }
});

const REAPPLY_COOLDOWN_MS = 15 * 60 * 1000;

router.post("/auth/reapply", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || user.role !== "advisor" || !user.advisorId) {
      return res.status(404).json({ error: "الحساب غير موجود" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, user.advisorId));
    if (!advisor || advisor.status !== "rejected") {
      return res.status(400).json({ error: "الحساب غير مرفوض" });
    }

    const now = Date.now();
    const rejectedAt = advisor.rejectedAt ? advisor.rejectedAt.getTime() : 0;
    const elapsed = now - rejectedAt;
    if (elapsed < REAPPLY_COOLDOWN_MS) {
      const remaining = Math.ceil((REAPPLY_COOLDOWN_MS - elapsed) / 1000);
      return res.status(429).json({ error: "لا يزال الوقت المطلوب لم ينتهِ", remaining });
    }

    await db
      .update(advisorsTable)
      .set({ status: "pending", rejectedAt: null })
      .where(eq(advisorsTable.id, advisor.id));

    return res.json({
      pending: true,
      message: "تم تقديم طلبك من جديد. سيتم مراجعته من قِبل إدارة المنصة.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string; name: string; advisorId: number | null };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "رمز الجلسة غير صالح" });
  }
}

export function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "غير مصرح" });
    if (req.user.role !== role) return res.status(403).json({ error: "صلاحية غير كافية" });
    next();
  };
}

export { JWT_SECRET };
export default router;
