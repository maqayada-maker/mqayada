import nodemailer from "nodemailer";
import crypto from "crypto";
import { Resend } from "resend";

const PLATFORM_EMAIL = "maqayada@maqayada.com";
const PLATFORM_FROM = `"منصة مقايضة" <${PLATFORM_EMAIL}>`;

// ── Resend client (preferred) ──────────────────────────────────────────
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// ── SMTP transport (fallback) ──────────────────────────────────────────
function getSmtp() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

// ── Unified send helper ────────────────────────────────────────────────
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResend();
  if (resend) {
    const { error } = await resend.emails.send({
      from: PLATFORM_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) throw new Error(JSON.stringify(error));
    return;
  }

  const smtp = getSmtp();
  if (smtp) {
    await smtp.sendMail({ from: PLATFORM_FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    return;
  }

  // No transport configured — log to console
  console.log(`\n📧 [EMAIL — لم يُضبط RESEND_API_KEY أو SMTP]\nإلى: ${opts.to}\nالموضوع: ${opts.subject}\n${opts.text}\n`);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Email: verify email ────────────────────────────────────────────────
export async function sendEmailVerificationEmail(user: { name: string; email: string; token: string }) {
  const subject = `تأكيد بريدك الإلكتروني — منصة مقايضة`;
  const verifyUrl = `${process.env.APP_URL ?? "https://mqayada.replit.app"}/verify-email?token=${user.token}`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">منصة مقايضة</h1>
      </div>
      <h2 style="color: #0f172a;">أهلاً ${user.name}، أكّد بريدك الإلكتروني</h2>
      <p style="color: #374151; line-height: 1.7;">شكراً لتسجيلك في منصة مقايضة. انقر على الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">تأكيد البريد الإلكتروني</a>
      </div>
      <p style="color: #6b7280; font-size: 13px;">إذا لم يعمل الزر، انسخ هذا الرابط في متصفحك:</p>
      <p style="font-size: 12px; word-break: break-all; color: #2563eb;">${verifyUrl}</p>
      <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">إذا لم تنشئ حساباً على منصة مقايضة، يمكنك تجاهل هذا البريد.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `أهلاً ${user.name}،\n\nانقر على هذا الرابط لتأكيد بريدك الإلكتروني:\n${verifyUrl}\n\nمنصة مقايضة`,
  });
}

// ── Email: advisor registration (to admin) ─────────────────────────────
export async function sendAdvisorRegistrationEmail(advisor: {
  name: string; company: string; email: string; phone: string;
  employeeId: string; appointmentDate: string | null; monthsExperience: number;
}) {
  const subject = `طلب انضمام مستشار جديد — ${advisor.name} (${advisor.company})`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">منصة مقايضة</h1>
      </div>
      <h2 style="color: #0f172a; margin-bottom: 8px;">طلب انضمام مستشار مالي جديد</h2>
      <p style="color: #6b7280; margin-bottom: 24px;">تم استلام طلب انضمام جديد. يرجى مراجعة البيانات وطلب المستندات المطلوبة.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb; width: 40%;">الاسم الكامل</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.name}</td></tr>
        <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">الجهة / البنك</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.company}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">البريد الإلكتروني</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.email}</td></tr>
        <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الجوال</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.phone}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">الرقم الوظيفي</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.employeeId}</td></tr>
        <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">تاريخ التعيين</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${advisor.appointmentDate ?? "—"}</td></tr>
        <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">سنوات الخبرة</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${Math.round(advisor.monthsExperience / 12)} سنة (${advisor.monthsExperience} شهراً)</td></tr>
      </table>
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">📋 المستندات المطلوبة</p>
        <ul style="margin: 8px 0 0 0; color: #78350f; padding-right: 20px;">
          <li>صورة من بطاقة العمل (ID Card)</li>
          <li>كرت العمل / بطاقة الأعمال (Business Card)</li>
        </ul>
      </div>
      <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 16px;">منصة مقايضة — نظام إدارة المستشارين</p>
    </div>
  `;

  await sendEmail({
    to: PLATFORM_EMAIL,
    subject,
    html,
    text: `طلب انضمام مستشار جديد\nالاسم: ${advisor.name}\nالجهة: ${advisor.company}\nالبريد: ${advisor.email}\nالجوال: ${advisor.phone}`,
  });
}

// ── Email: document request (to advisor) ──────────────────────────────
export async function sendAdvisorDocumentRequestEmail(advisor: {
  name: string; email: string; company: string;
}) {
  const subject = `مطلوب: بطاقة العمل وكرت الأعمال — منصة مقايضة`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">منصة مقايضة</h1>
      </div>
      <h2 style="color: #0f172a;">${advisor.name}، أهلاً بك في منصة مقايضة</h2>
      <p style="color: #374151;">شكراً لتقديم طلب انضمامك كمستشار مالي معتمد في <strong>${advisor.company}</strong>.</p>
      <p style="color: #374151;">لإتمام عملية التحقق والموافقة على حسابك، نحتاج منك إرسال المستندات التالية:</p>
      <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <ol style="margin: 0; padding-right: 20px; color: #166534;">
          <li style="margin-bottom: 8px;"><strong>صورة من بطاقة العمل</strong> (Employee ID Card)</li>
          <li><strong>كرت الأعمال</strong> (Business Card) — صورة واضحة من الوجهين</li>
        </ol>
      </div>
      <p style="color: #374151;">أرسل المستندات إلى البريد الإلكتروني:</p>
      <p style="text-align: center; font-size: 18px; font-weight: bold; color: #0f172a; background: #f8fafc; padding: 12px; border-radius: 8px;">${PLATFORM_EMAIL}</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">سيتم مراجعة طلبك خلال 1-3 أيام عمل بعد استلام المستندات.<br/>منصة مقايضة</p>
    </div>
  `;

  await sendEmail({
    to: advisor.email,
    subject,
    html,
    text: `مطلوب إرسال بطاقة العمل وكرت الأعمال إلى ${PLATFORM_EMAIL}`,
  });
}

// ── Shared helpers for event notifications ─────────────────────────────
function appUrl(): string {
  return process.env.APP_URL ?? "https://mqayada.replit.app";
}

const SECTOR_LABELS: Record<string, string> = {
  government: "قطاع حكومي",
  military: "قطاع عسكري",
  private: "قطاع خاص",
  retired: "متقاعد",
};
const FINANCING_TYPE_LABELS: Record<string, string> = {
  personal: "تمويل شخصي",
  real_estate: "تمويل عقاري",
  car: "تمويل سيارة",
  emergency: "تمويل طارئ",
};
export function sectorLabel(code: string): string {
  return SECTOR_LABELS[code] ?? code;
}
export function financingTypeLabel(code: string): string {
  return FINANCING_TYPE_LABELS[code] ?? code;
}

function emailShell(bodyHtml: string): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">منصة مقايضة</h1>
      </div>
      ${bodyHtml}
      <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">هذا البريد أُرسل تلقائياً من منصة مقايضة.</p>
    </div>
  `;
}

// ── Event: new offer received → client ─────────────────────────────────
export async function sendNewOfferToClientEmail(opts: {
  to: string; clientName: string; requestRef: string;
  profitRate: number; monthlyInstallment: number; totalAmount: number; advisorCompany: string;
}) {
  if (!opts.to) return;
  const subject = `🔔 عرض تمويل جديد على طلبك ${opts.requestRef}`;
  const portal = `${appUrl()}/client`;
  const html = emailShell(`
    <h2 style="color: #0f172a;">${opts.clientName}، وصلك عرض جديد!</h2>
    <p style="color: #374151; line-height: 1.7;">قدّم أحد المستشارين عرض تمويل على طلبك <strong>${opts.requestRef}</strong>${opts.advisorCompany ? ` عبر <strong>${opts.advisorCompany}</strong>` : ""}.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb; width: 45%;">نسبة الربح</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${opts.profitRate.toFixed(2)}٪</td></tr>
      <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">القسط الشهري</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${opts.monthlyInstallment.toLocaleString("ar-SA")} ر.س</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">إجمالي المبلغ</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${opts.totalAmount.toLocaleString("ar-SA")} ر.س</td></tr>
    </table>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portal}" style="background: #2563eb; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">عرض ومقارنة العروض</a>
    </div>
  `);
  await sendEmail({
    to: opts.to,
    subject,
    html,
    text: `${opts.clientName}، وصلك عرض جديد على طلبك ${opts.requestRef}.\nنسبة الربح: ${opts.profitRate.toFixed(2)}٪\nالقسط الشهري: ${opts.monthlyInstallment.toLocaleString("ar-SA")} ر.س\nإجمالي المبلغ: ${opts.totalAmount.toLocaleString("ar-SA")} ر.س\n\nادخل للمنصة لمقارنة العروض: ${portal}`,
  });
}

// ── Event: bank/admin approval → client ────────────────────────────────
export async function sendBankApprovalToClientEmail(opts: {
  to: string; clientName: string; requestRef: string; advisorName: string; advisorCompany: string;
}) {
  if (!opts.to) return;
  const subject = `✅ تم اعتماد عرضك للطلب ${opts.requestRef}`;
  const portal = `${appUrl()}/client`;
  const html = emailShell(`
    <h2 style="color: #0f766e;">مبارك يا ${opts.clientName}!</h2>
    <p style="color: #374151; line-height: 1.7;">تم اعتماد العرض الذي اخترته للطلب <strong>${opts.requestRef}</strong>${opts.advisorCompany ? ` من <strong>${opts.advisorCompany}</strong>` : ""}.</p>
    <p style="color: #374151; line-height: 1.7;">سيتواصل معك المستشار <strong>${opts.advisorName}</strong> لإكمال إجراءات التمويل. يمكنك متابعة حالة طلبك من بوابتك.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portal}" style="background: #0f766e; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">متابعة الطلب</a>
    </div>
  `);
  await sendEmail({
    to: opts.to,
    subject,
    html,
    text: `مبارك ${opts.clientName}! تم اعتماد عرضك للطلب ${opts.requestRef}. سيتواصل معك المستشار ${opts.advisorName}. تابع طلبك: ${portal}`,
  });
}

// ── Event: new matching request → advisor ──────────────────────────────
export async function sendMatchingRequestToAdvisorEmail(opts: {
  to: string; advisorName: string; requestRef: string;
  sector: string; financingType: string; salary: number; bankName: string;
}) {
  if (!opts.to) return;
  const subject = `📥 طلب تمويل جديد يطابق تسعيرك ${opts.requestRef}`;
  const portal = `${appUrl()}/advisor`;
  const html = emailShell(`
    <h2 style="color: #0f172a;">${opts.advisorName}، طلب جديد بانتظار عرضك</h2>
    <p style="color: #374151; line-height: 1.7;">وصل طلب تمويل جديد <strong>${opts.requestRef}</strong> يطابق إحدى شرائح التسعير لديك. سارع بتقديم عرضك قبل المنافسين.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb; width: 45%;">القطاع</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${sectorLabel(opts.sector)}</td></tr>
      <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">نوع التمويل</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${financingTypeLabel(opts.financingType)}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">الراتب</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${opts.salary.toLocaleString("ar-SA")} ر.س</td></tr>
      <tr><td style="padding: 10px 16px; font-weight: bold; border: 1px solid #e5e7eb;">البنك الحالي</td><td style="padding: 10px 16px; border: 1px solid #e5e7eb;">${opts.bankName || "—"}</td></tr>
    </table>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${portal}" style="background: #2563eb; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">تقديم عرض الآن</a>
    </div>
  `);
  await sendEmail({
    to: opts.to,
    subject,
    html,
    text: `${opts.advisorName}، طلب جديد ${opts.requestRef} يطابق تسعيرك.\nالقطاع: ${sectorLabel(opts.sector)}\nنوع التمويل: ${financingTypeLabel(opts.financingType)}\nالراتب: ${opts.salary.toLocaleString("ar-SA")} ر.س\n\nقدّم عرضك: ${portal}`,
  });
}
