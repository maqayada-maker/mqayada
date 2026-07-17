import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "منصة مقايضة <maqayada@maqayada.com>";

export async function sendOfferAcceptedEmail(opts: {
  to: string;
  advisorName: string;
  requestRef: string;
  profitRate: number;
  monthlyInstallment: number;
  totalAmount: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping email send");
    return { ok: false, error: "missing_api_key" };
  }
  if (!opts.to) return { ok: false, error: "no_recipient" };

  const subject = `🎉 تم اختيار عرضك للطلب ${opts.requestRef}`;
  const html = `
<!doctype html>
<html dir="rtl" lang="ar">
<body style="font-family:Tahoma,Arial,sans-serif;background:#f6f9fc;padding:24px;color:#0f172a;">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 12px;color:#0f766e;">مبارك يا ${opts.advisorName}!</h2>
    <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">
      اختار العميل عرضك للطلب <strong>${opts.requestRef}</strong> ضمن منصة مقايضة.
      الرجاء التواصل مع العميل خلال أقرب وقت لإكمال الإجراءات.
    </p>
    <table style="width:100%;border-collapse:collapse;background:#f0fdfa;border-radius:12px;overflow:hidden;margin-bottom:18px;">
      <tr><td style="padding:10px 14px;font-size:13px;color:#475569;">نسبة الربح</td><td style="padding:10px 14px;font-weight:bold;text-align:left;">${opts.profitRate.toFixed(2)}٪</td></tr>
      <tr><td style="padding:10px 14px;font-size:13px;color:#475569;">القسط الشهري</td><td style="padding:10px 14px;font-weight:bold;text-align:left;">${opts.monthlyInstallment.toLocaleString("ar-SA")} ر.س</td></tr>
      <tr><td style="padding:10px 14px;font-size:13px;color:#475569;">إجمالي المبلغ</td><td style="padding:10px 14px;font-weight:bold;text-align:left;">${opts.totalAmount.toLocaleString("ar-SA")} ر.س</td></tr>
    </table>
    <p style="font-size:13px;color:#64748b;margin:0;">
      ادخل لبوابة المستشار لمتابعة العرض وتسجيل نتيجة التواصل.
    </p>
  </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({ from: FROM, to: opts.to, subject, html });
    if (result.error) {
      console.error("[email] resend error:", result.error);
      return { ok: false, error: String(result.error.message ?? result.error) };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("[email] send failed:", err);
    return { ok: false, error: err?.message ?? "send_failed" };
  }
}
