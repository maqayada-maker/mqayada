import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { financingRequestsTable, offersTable, advisorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";
import { openai, AI_ENABLED } from "../lib/ai.js";

const router: IRouter = Router();

function parseToken(req: any): { userId: number; role: string; advisorId?: number } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET) as any;
  } catch {
    return null;
  }
}

const FEATURE_LABELS: Record<string, string> = {
  free_card_first_year: "بطاقة ائتمانية مجانية السنة الأولى",
  free_card_lifetime: "بطاقة ائتمانية مجانية مدى الحياة",
  no_admin_fees: "بدون رسوم إدارية",
  installment_deferral: "تأجيل الأقساط متاح",
  early_payoff_discount: "خصم على السداد المبكر",
  free_takaful: "تأمين تكافلي مجاني",
};

const PREFERRED_FEATURE_LABELS: Record<string, string> = {
  lowest_rate: "أقل نسبة ربح",
  lowest_installment: "أقل قسط شهري",
  highest_amount: "أعلى مبلغ تمويل",
  fastest: "أسرع إجراء",
};

/* ── POST /requests/:id/ai-advice — AI financial assistant: compares offers, recommends best ── */
router.post("/requests/:id/ai-advice", async (req, res) => {
  const payload = parseToken(req);
  if (!payload) return res.status(401).json({ error: "غير مصرح" });

  if (!AI_ENABLED || !openai) {
    return res.status(503).json({ error: "المساعد الذكي غير مُفعّل حالياً" });
  }

  try {
    const requestId = parseInt(req.params.id);
    if (Number.isNaN(requestId)) return res.status(400).json({ error: "معرّف غير صحيح" });

    // Client-facing assistant: only the request owner may use it
    if (payload.role !== "client") {
      return res.status(403).json({ error: "هذه الخدمة متاحة لصاحب الطلب فقط" });
    }

    const [request] = await db
      .select()
      .from(financingRequestsTable)
      .where(eq(financingRequestsTable.id, requestId));
    if (!request) return res.status(404).json({ error: "الطلب غير موجود" });

    if (request.userId !== payload.userId) {
      return res.status(403).json({ error: "لا يمكنك الوصول لعروض طلب شخص آخر" });
    }

    const offersRaw = await db
      .select({
        id: offersTable.id,
        profitRate: offersTable.profitRate,
        principal: offersTable.principal,
        profitAmount: offersTable.profitAmount,
        monthlyInstallment: offersTable.monthlyInstallment,
        totalAmount: offersTable.totalAmount,
        durationMonths: offersTable.durationMonths,
        notes: offersTable.notes,
        status: offersTable.status,
        features: offersTable.features,
        advisorName: advisorsTable.name,
        advisorCompany: advisorsTable.company,
        advisorStatus: advisorsTable.status,
      })
      .from(offersTable)
      .leftJoin(advisorsTable, eq(offersTable.advisorId, advisorsTable.id))
      .where(eq(offersTable.requestId, requestId));

    const offers = offersRaw
      .filter((o) => o.status === "pending" && (o.advisorStatus === "approved" || o.advisorStatus === null))
      .map((o) => ({
        id: o.id,
        profitRate: Number(o.profitRate),
        principal: o.principal != null ? Number(o.principal) : null,
        profitAmount: o.profitAmount != null ? Number(o.profitAmount) : null,
        monthlyInstallment: Number(o.monthlyInstallment),
        totalAmount: Number(o.totalAmount),
        durationMonths: o.durationMonths,
        notes: o.notes ?? "",
        features: (o.features ?? []).map((f) => FEATURE_LABELS[f] ?? f),
        advisorCompany: o.advisorCompany ?? "جهة تمويل",
      }));

    if (offers.length === 0) {
      return res.status(400).json({ error: "لا توجد عروض متاحة للتحليل بعد" });
    }

    const validIds = offers.map((o) => o.id);
    const preferredLabel = request.preferredFeature
      ? PREFERRED_FEATURE_LABELS[request.preferredFeature] ?? request.preferredFeature
      : null;

    const clientContext = [
      `نوع التمويل المطلوب: ${request.financingType}`,
      `الغرض: ${request.financingPurpose}`,
      `الراتب الشهري: ${Number(request.salary)} ريال`,
      `إجمالي المديونية الحالية: ${Number(request.currentDebt)} ريال`,
      `الأشهر المتبقية على المديونية: ${request.remainingMonths}`,
      request.bankName ? `البنك الحالي: ${request.bankName}` : null,
      preferredLabel ? `الأولوية التي يهتم بها العميل: ${preferredLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const offersContext = offers
      .map((o, i) => {
        const feats = o.features.length ? ` | المزايا: ${o.features.join("، ")}` : "";
        const note = o.notes ? ` | ملاحظات المستشار: ${o.notes}` : "";
        const principal = o.principal != null ? `${o.principal} ريال` : "غير محدد";
        return `العرض ${i + 1} (المعرّف ${o.id}) من ${o.advisorCompany}: نسبة ربح ${o.profitRate}٪، قسط شهري ${o.monthlyInstallment} ريال، إجمالي السداد ${o.totalAmount} ريال، صافي التمويل ${principal}، المدة ${o.durationMonths} شهر${feats}${note}`;
      })
      .join("\n");

    const systemPrompt =
      "أنت مستشار مالي محايد لمنصة \"مقايضة\" السعودية لإعادة تمويل ومقايضة المديونيات. " +
      "مهمتك تحليل العروض المقدمة للعميل والتوصية بالأنسب له بناءً على بياناته وأولوياته. " +
      "كن موضوعياً وصادقاً، واشرح بلغة عربية بسيطة وواضحة. لا تختلق أي معلومات غير موجودة في البيانات. " +
      "وازن بين نسبة الربح والقسط الشهري وإجمالي السداد وصافي التمويل والمزايا والمدة. " +
      "إن كان للعميل أولوية محددة، أعطها وزناً أكبر. " +
      "أعد فقط كائن JSON صالح بالحقول التالية: " +
      "{ \"recommendedOfferId\": رقم معرّف العرض الموصى به, " +
      "\"headline\": جملة قصيرة جداً بالتوصية, " +
      "\"summary\": فقرة من جملتين إلى ثلاث تشرح سبب الترشيح, " +
      "\"ranking\": مصفوفة بكل العروض مرتبة من الأفضل [{ \"offerId\": رقم, \"label\": اسم مختصر, \"note\": سبب موجز }], " +
      "\"cautions\": مصفوفة نصائح أو تنبيهات مهمة للعميل (يمكن أن تكون فارغة) }. " +
      `يجب أن يكون recommendedOfferId و offerId من ضمن هذه المعرّفات فقط: ${validIds.join(", ")}.`;

    const userPrompt = `بيانات العميل:\n${clientContext}\n\nالعروض المتاحة:\n${offersContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return res.status(502).json({ error: "تعذّر توليد التوصية" });

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: "تعذّر تحليل رد المساعد الذكي" });
    }

    // Guardrail: ensure recommended id is a real offer
    let recommendedOfferId = Number(parsed.recommendedOfferId);
    if (!validIds.includes(recommendedOfferId)) {
      recommendedOfferId = offers.slice().sort((a, b) => a.profitRate - b.profitRate)[0].id;
    }

    const ranking = Array.isArray(parsed.ranking)
      ? parsed.ranking
          .filter((r: any) => validIds.includes(Number(r?.offerId)))
          .map((r: any) => ({
            offerId: Number(r.offerId),
            label: String(r.label ?? ""),
            note: String(r.note ?? ""),
          }))
      : [];

    const cautions = Array.isArray(parsed.cautions)
      ? parsed.cautions.map((c: any) => String(c)).filter(Boolean).slice(0, 6)
      : [];

    return res.json({
      recommendedOfferId,
      headline: String(parsed.headline ?? "").slice(0, 300),
      summary: String(parsed.summary ?? "").slice(0, 1200),
      ranking: ranking.map((r: { offerId: number; label: string; note: string }) => ({
        offerId: r.offerId,
        label: r.label.slice(0, 120),
        note: r.note.slice(0, 400),
      })),
      cautions: cautions.map((c: string) => c.slice(0, 400)),
    });
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    if (status === 429) {
      return res.status(429).json({
        error: "تم تجاوز الحصة الحالية لحساب OpenAI — يرجى إضافة رصيد/تفعيل الفوترة في حساب OpenAI ثم المحاولة مجدداً.",
      });
    }
    if (status === 401 || status === 403) {
      return res.status(503).json({ error: "مفتاح OpenAI غير صالح أو غير مفعّل — يرجى تحديث المفتاح." });
    }
    console.error("[ai-advice] error:", err?.message ?? err);
    return res.status(500).json({ error: "حدث خطأ أثناء توليد التوصية" });
  }
});

export default router;
