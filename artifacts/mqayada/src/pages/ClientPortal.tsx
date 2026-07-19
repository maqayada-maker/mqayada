import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  PlusCircle, ChevronDown, ChevronUp, Trophy, Percent,
  Calendar, Clock, CheckCircle2, Building, Phone, MessageCircle,
  FileText, TrendingDown, Sparkles, AlertCircle, Timer, Zap,
  AlertTriangle, X, Send, ShieldAlert, RefreshCcw, XCircle
} from "lucide-react";
import { FINANCING_PURPOSES, FINANCING_TYPES, SECTORS } from "@/lib/constants";
import { formatRequestRef } from "@/lib/requestRef";
import { markDealSeen } from "@/lib/dealsSeen";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("mqayada_token") ?? "";

/* ── Rate limit quota hook ── */
interface RateLimitStatus { requestsInWindow: number; maxRequests: number; nextAvailableAt: string | null; canSubmit: boolean; }
function useRateLimit() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch(`${BASE}/api/requests/my/rate-limit`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setStatus(await res.json());
    } catch { /* silent */ }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { status, refetch: fetch };
}

/* ── Countdown small inline ── */
function InlineCountdown({ targetIso, onExpired }: { targetIso: string; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const calc = () => Math.max(0, new Date(targetIso).getTime() - Date.now());
    setRemaining(calc());
    const id = setInterval(() => { const r = calc(); setRemaining(r); if (r === 0) { clearInterval(id); onExpired(); } }, 1000);
    return () => clearInterval(id);
  }, [targetIso, onExpired]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return <span className="font-black tabular-nums">{String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>;
}

interface MyRequest {
  id: number;
  fullName: string;
  employer: string;
  sector: string;
  financingPurpose: string;
  financingType: string;
  salary: number;
  currentDebt: number;
  remainingMonths: number;
  bankName: string;
  notes: string | null;
  status: string;
  offersCount: number;
  createdAt: string;
}

interface Offer {
  id: number;
  requestId: number;
  advisorId: number;
  profitRate: number;
  principal: number | null;
  profitAmount: number | null;
  monthlyInstallment: number;
  totalAmount: number;
  durationMonths: number;
  notes: string | null;
  status: string;
  rejectionReason: string | null;
  contactStatus: "contacted" | "agreed" | "not_agreed" | null;
  officialApprovalAt: string | null;
  clientRating: number | null;
  features: string[] | null;
  advisorName: string;
  advisorCompany: string;
  advisorPhone: string | null;
}

const OFFER_FEATURE_LABELS: Record<string, { icon: string; label: string }> = {
  free_card_first_year: { icon: "💳", label: "بطاقة ائتمانية مجانية السنة الأولى" },
  free_card_lifetime: { icon: "💎", label: "بطاقة ائتمانية مجانية مدى الحياة" },
  no_admin_fees: { icon: "🆓", label: "بدون رسوم إدارية" },
  installment_deferral: { icon: "⏸️", label: "تأجيل الأقساط متاح" },
  early_payoff_discount: { icon: "💰", label: "خصم على السداد المبكر" },
  free_takaful: { icon: "🛡️", label: "تأمين تكافلي مجاني" },
};

function useMyRequests() {
  return useQuery<MyRequest[]>({
    queryKey: ["/api/requests/my"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/requests/my`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useRequestOffers(requestId: number, enabled: boolean) {
  return useQuery<Offer[]>({
    queryKey: ["/api/requests", requestId, "offers"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/requests/${requestId}/offers`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    enabled,
  });
}

function useAcceptOffer(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: number) => {
      const res = await fetch(`${BASE}/api/offers/${offerId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/requests/my"] });
      qc.invalidateQueries({ queryKey: ["/api/requests", requestId, "offers"] });
    },
  });
}

interface AiAdvice {
  recommendedOfferId: number;
  headline: string;
  summary: string;
  ranking: { offerId: number; label: string; note: string }[];
  cautions: string[];
}

function useAiAdvice(requestId: number) {
  return useMutation<AiAdvice>({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/requests/${requestId}/ai-advice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "تعذّر توليد التوصية");
      }
      return res.json();
    },
  });
}

/* ── AI financial assistant recommendation panel ── */
function AiAdvicePanel({ advice, offers }: { advice: AiAdvice; offers: Offer[] }) {
  const recommended = offers.find(o => o.id === advice.recommendedOfferId);
  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-l from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-extrabold text-violet-900 leading-tight">توصية المساعد المالي الذكي</h4>
          <p className="text-[11px] text-violet-500">تحليل استرشادي بالذكاء الاصطناعي</p>
        </div>
      </div>

      {advice.headline && (
        <p className="font-bold text-foreground mb-2">{advice.headline}</p>
      )}

      {recommended && (
        <div className="rounded-xl bg-white border border-violet-200 p-3 mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">العرض الموصى به</p>
            <p className="font-bold text-violet-900">{recommended.advisorCompany || recommended.advisorName}</p>
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-primary">{recommended.profitRate}٪</span>
            <p className="text-[11px] text-muted-foreground">{formatCurrency(recommended.monthlyInstallment)} / شهر</p>
          </div>
        </div>
      )}

      {advice.summary && (
        <p className="text-sm leading-relaxed text-foreground/90 mb-3">{advice.summary}</p>
      )}

      {advice.ranking.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {advice.ranking.map((r, i) => {
            const o = offers.find(x => x.id === r.offerId);
            return (
              <div key={r.offerId} className="flex items-start gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-foreground/90">
                  <span className="font-bold">{r.label || o?.advisorCompany || `العرض ${r.offerId}`}</span>
                  {r.note ? <span className="text-muted-foreground"> — {r.note}</span> : null}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {advice.cautions.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1.5">
          {advice.cautions.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
        هذه توصية استرشادية مبنية على بيانات العروض، وليست نصيحة مالية ملزمة. القرار النهائي يعود لك.
      </p>
    </div>
  );
}

/* ── Client rating panel — appears after advisor marks "تم التواصل" ── */
function ClientRatingPanel({ offer }: { offer: Offer }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/offers/${offer.id}/rate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "content-type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "تعذّر إرسال التقييم");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/requests", offer.requestId, "offers"] });
    },
    onError: (e: any) => setError(e?.message ?? "تعذّر إرسال التقييم"),
  });

  if (offer.clientRating) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
        <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> شكراً لتقييمك
        </p>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(n => (
            <span key={n} className={`text-2xl leading-none ${n <= offer.clientRating! ? "text-amber-500" : "text-muted-foreground/30"}`}>★</span>
          ))}
          <span className="text-sm font-bold text-amber-700 ms-2">({offer.clientRating}/5)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-4 mt-4">
      <p className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-500" /> قيّم تجربتك مع المستشار
      </p>
      <p className="text-xs text-muted-foreground mb-3">يساعد تقييمك العملاء الآخرين في الاختيار</p>

      <div className="flex items-center gap-1 mb-3" dir="ltr">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-3xl leading-none transition-transform hover:scale-110"
            aria-label={`${n} stars`}
          >
            <span className={n <= (hover || rating) ? "text-amber-500" : "text-muted-foreground/30"}>★</span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="اكتب ملاحظة عن تجربتك (اختياري)"
        rows={2}
        maxLength={300}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <Button
        size="sm"
        className="w-full"
        disabled={rating === 0 || submit.isPending}
        isLoading={submit.isPending}
        onClick={() => { setError(null); submit.mutate(); }}
      >
        إرسال التقييم
      </Button>
    </div>
  );
}

/* ── Reuse-data confirm dialog ── */
function ReuseDataDialog({ request, onClose }: { request: MyRequest; onClose: () => void }) {
  const proceed = () => {
    const resubmitData = {
      fullName: request.fullName,
      employer: request.employer,
      sector: request.sector,
      financingPurpose: request.financingPurpose,
      financingType: request.financingType,
      salary: request.salary,
      currentDebt: request.currentDebt,
      remainingMonths: request.remainingMonths,
      bankName: request.bankName,
    };
    localStorage.setItem("mqayada_resubmit", JSON.stringify(resubmitData));
    window.location.href = `${BASE}/apply`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <Card className="max-w-md w-full shadow-2xl border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-extrabold">إعادة طلب تمويل</h3>
          </div>
          <p className="text-sm text-foreground mb-2">هل ترغب بإدخال نفس بيانات طلبك السابق؟</p>
          <p className="text-xs text-muted-foreground mb-5">سننقلك لصفحة الطلب مع تعبئة البيانات تلقائياً — يمكنك تعديل أي حقل قبل الإرسال.</p>
          <div className="flex gap-3">
            <Button onClick={proceed} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" /> نعم، استخدم نفس البيانات
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">إدخال يدوي</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Offer confirmation dialog ── */
function OfferConfirmDialog({
  offer,
  onConfirm,
  onCancel,
  isPending,
}: {
  offer: Offer;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <Card className="max-w-md w-full shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">تأكيد اختيار العرض</h3>
                <p className="text-xs text-muted-foreground">هذه الخطوة نهائية — تأكد من البيانات</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-muted/50 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">المستشار</span>
              <span className="font-bold">{offer.advisorName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">البنك</span>
              <span className="font-bold">{offer.advisorCompany}</span>
            </div>
            <hr className="border-border/60" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">نسبة الربح السنوية</span>
              <span className="text-2xl font-black text-primary">{offer.profitRate}٪</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">القسط الشهري</span>
              <span className="font-bold">{formatCurrency(offer.monthlyInstallment)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">إجمالي التمويل</span>
              <span className="font-bold">{formatCurrency(offer.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">مدة السداد</span>
              <span className="font-bold">{offer.durationMonths} شهر</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-3 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>بعد الاختيار، يُعتمد العرض فوراً وتصل بياناتك للمستشار ليتواصل معك. لن تتمكن من تغيير العرض بعد ذلك.</span>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 mb-5 text-xs text-red-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">تنبيه أمني — لا تشارك أي بيانات حساسة:</p>
              <ul className="list-disc pr-4 space-y-0.5">
                <li>رقم الهوية الوطنية</li>
                <li>رمز التحقق (OTP) الذي يصلك من البنك</li>
                <li>كلمة سر الخدمات المصرفية أو رقم البطاقة</li>
              </ul>
              <p className="pt-1">المستشار يحتاج فقط للتواصل معك لإكمال الإجراءات الرسمية عبر القنوات الموثقة.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onConfirm}
              isLoading={isPending}
              className="flex-1 gap-2 font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأكيد الاختيار وإرسال
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isPending} className="flex-1">
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Client complaint modal ── */
function ComplaintModal({
  requests,
  onClose,
}: {
  requests: MyRequest[];
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [requestId, setRequestId] = useState<number | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/reports/client`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, requestId: requestId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل إرسال البلاغ");
      return data;
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: any) => setError(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <Card className="max-w-lg w-full shadow-2xl border-t-4 border-t-blue-500 animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold mb-2">تم إرسال بلاغك بنجاح</h3>
              <p className="text-muted-foreground text-sm mb-6">ستتولى إدارة المنصة مراجعة مشكلتك والرد في أقرب وقت ممكن.</p>
              <Button onClick={onClose} className="w-full">إغلاق</Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground">إرسال بلاغ / مشكلة</h3>
                    <p className="text-xs text-muted-foreground">ستصل مباشرة لإدارة المنصة</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold block mb-2">الطلب المتعلق بالمشكلة (اختياري)</label>
                  <select
                    value={requestId}
                    onChange={e => setRequestId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                  >
                    <option value="">— لا يتعلق بطلب معين —</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{formatRequestRef({ id: r.id, financingPurpose: r.financingPurpose, financingType: r.financingType, sector: r.sector })} — {r.employer}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="موضوع البلاغ"
                  placeholder="مثال: لم أتلقَّ ردّاً على طلبي، مشكلة في العروض..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />

                <div>
                  <label className="text-sm font-bold block mb-2">وصف المشكلة بالتفصيل</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    placeholder="اشرح المشكلة بوضوح حتى تستطيع الإدارة مساعدتك..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <Button
                  onClick={() => mutate()}
                  isLoading={isPending}
                  disabled={subject.length < 5 || description.length < 20}
                  className="flex-1 gap-2 font-bold"
                >
                  <Send className="w-4 h-4" />
                  إرسال البلاغ
                </Button>
                <Button variant="outline" onClick={onClose} disabled={isPending} className="flex-1">إلغاء</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  active: { label: "يستقبل عروض", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Sparkles },
  awaiting_admin: { label: "تم اختيار العرض", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  approved: { label: "تم الاعتماد", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  closed: { label: "مغلق", color: "bg-muted text-muted-foreground border-border", icon: FileText },
  expired: { label: "انتهت المهلة (٢٤ ساعة)", color: "bg-red-50 text-red-600 border-red-200", icon: AlertCircle },
};

const SECTOR_LABELS: Record<string, string> = {
  government: "حكومي", semi_government: "شبه حكومي", private: "خاص", retired: "متقاعد",
};

function getPurposeLabel(v: string) {
  return FINANCING_PURPOSES.find(f => f.value === v)?.label ?? v;
}
function getTypeLabel(v: string) {
  return FINANCING_TYPES.find(f => f.value === v)?.label ?? v;
}

function RequestTimeline({ request, offers }: { request: MyRequest, offers: Offer[] }) {
  const isExpired = request.status === "expired" || request.status === "closed";
  const approvedOffer = offers.find(o => o.status === "approved" || o.status === "client_accepted");
  
  const hasOffers = request.offersCount > 0 || request.status === "active";
  const isAccepted = request.status === "approved" || request.status === "awaiting_admin" || !!approvedOffer;
  const isBankApproved = !!approvedOffer?.officialApprovalAt;

  const stages = [
    { label: "تم الإرسال", completed: true, active: !hasOffers && !isExpired, icon: FileText },
    { label: "وصلت عروض", completed: hasOffers || isAccepted, active: hasOffers && !isAccepted && !isExpired, icon: Sparkles },
    { label: "تم القبول", completed: isAccepted || isBankApproved, active: isAccepted && !isBankApproved && !isExpired, icon: CheckCircle2 },
    { label: "اعتماد البنك", completed: isBankApproved, active: isBankApproved && !isExpired, icon: Building }
  ];

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="font-bold text-sm">
          {request.status === "expired" ? "انتهت المهلة (٢٤ ساعة) دون استجابة" : "الطلب مغلق"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 w-full overflow-x-auto">
      <div className="flex items-center min-w-[500px]">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          const statusColor = stage.completed 
            ? "bg-primary text-white border-primary" 
            : stage.active
              ? "bg-primary/10 text-primary border-primary ring-4 ring-primary/20"
              : "bg-muted text-muted-foreground border-border";
              
          const lineColor = stage.completed && !isLast
            ? "bg-primary"
            : "bg-border";

          const Icon = stage.icon;

          return (
            <div key={i} className={`flex ${!isLast ? "flex-1" : ""} items-center relative`}>
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${statusColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${stage.active ? "text-primary" : stage.completed ? "text-foreground" : "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${lineColor}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildAdvisorWhatsAppText(request: MyRequest, offer: Offer) {
  const ref = formatRequestRef({
    id: request.id,
    financingPurpose: request.financingPurpose,
    financingType: request.financingType,
    sector: request.sector,
  });
  return [
    `السلام عليكم أ. ${offer.advisorName} 👋`,
    `أنا ${request.fullName}، اخترت عرضكم المقدّم عبر منصة مقايضة وأرغب بإكمال إجراءات التمويل.`,
    ``,
    `📋 بيانات الطلب (${ref}):`,
    `• نوع التمويل: ${getTypeLabel(request.financingType)}`,
    `• الغرض: ${getPurposeLabel(request.financingPurpose)}`,
    `• البنك الحالي: ${request.bankName}`,
    `• الراتب: ${formatCurrency(request.salary)}`,
    `• المديونية الحالية: ${formatCurrency(request.currentDebt)}`,
    ``,
    `💼 تفاصيل العرض المختار:`,
    `• نسبة الربح: ${offer.profitRate}٪`,
    `• القسط الشهري: ${formatCurrency(offer.monthlyInstallment)}`,
    `• إجمالي التمويل: ${formatCurrency(offer.totalAmount)}`,
    `• مدة السداد: ${offer.durationMonths} شهر`,
    ``,
    `⚠️ تنبيه أمني: لن أشارك أي بيانات حساسة (رقم الهوية، رمز التحقق OTP، كلمات سر الخدمات المصرفية أو أرقام البطاقات). التواصل لتنسيق الإجراءات الرسمية فقط عبر القنوات الموثقة.`,
  ].join("\n");
}

/* ── Contact screen — appears right after the client selects an offer ── */
function ContactModal({ request, offer, onClose }: { request: MyRequest; offer: Offer; onClose: () => void }) {
  if (!offer.advisorPhone) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <Card className="max-w-md w-full shadow-2xl border-t-4 border-t-emerald-500 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">تم اختيار العرض بنجاح</h3>
                <p className="text-xs text-muted-foreground">تواصل الآن مع المستشار لإكمال الإجراءات</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">{offer.advisorName}</p>
              <p className="text-sm text-muted-foreground">{offer.advisorCompany}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${offer.advisorPhone}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              اتصال مباشر
            </a>
            <a
              href={`https://wa.me/966${offer.advisorPhone.replace(/^0/, "")}?text=${encodeURIComponent(buildAdvisorWhatsAppText(request, offer))}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              واتساب
            </a>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">لا تشارك مع المستشار أي بيانات حساسة:</p>
              <p>رقم الهوية، رمز التحقق (OTP)، كلمة سر الخدمات المصرفية، أو أرقام البطاقات. التواصل لتنسيق الإجراءات الرسمية فقط.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
          >
            إغلاق
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function OffersPanel({ request, onAccepted }: { request: MyRequest; onAccepted?: (request: MyRequest, offer: Offer) => void }) {
  const { data: offers, isLoading } = useRequestOffers(request.id, true);
  const { mutate: acceptOffer, isPending: accepting } = useAcceptOffer(request.id);
  const aiAdvice = useAiAdvice(request.id);
  const [confirmOffer, setConfirmOffer] = useState<Offer | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: "profitRate" | "monthlyInstallment" | "totalAmount", direction: "asc" | "desc" }>({
    key: "profitRate",
    direction: "asc"
  });

  const allOffers = offers ?? [];
  const activeOffers = allOffers.filter(o => o.status === "pending").sort((a, b) => a.profitRate - b.profitRate);

  const sortedTableOffers = [...activeOffers].sort((a, b) => {
    const mult = sortConfig.direction === "asc" ? 1 : -1;
    return (a[sortConfig.key] - b[sortConfig.key]) * mult;
  });

  const handleSort = (key: "profitRate" | "monthlyInstallment" | "totalAmount") => {
    setSortConfig(curr => ({
      key,
      direction: curr.key === key && curr.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  // Multi-indicator analysis: find offer with highest net financing (principal)
  const offerWithHighestPrincipal = activeOffers.length > 1
    ? activeOffers.reduce((max, o) => ((o.principal ?? 0) > (max.principal ?? 0) ? o : max), activeOffers[0])
    : null;
  const bestRateOffer = activeOffers[0];
  const secondBestOffer = activeOffers[1];
  const highestPrincipalIsBetter =
    offerWithHighestPrincipal &&
    bestRateOffer &&
    offerWithHighestPrincipal.id !== bestRateOffer.id &&
    (offerWithHighestPrincipal.principal ?? 0) > (bestRateOffer.principal ?? 0);
  const rateDiff = secondBestOffer ? secondBestOffer.profitRate - bestRateOffer.profitRate : 0;
  const principalDiff = secondBestOffer
    ? (bestRateOffer.principal ?? 0) - (secondBestOffer.principal ?? 0)
    : 0;
  const rejectedByAdmin = allOffers.filter(o => o.status === "rejected");
  const sorted = activeOffers;
  const bestId = sorted[0]?.id;
  const isActive = request.status === "active" || request.status === "pending";
  const approvedOffer = allOffers.find(o => o.status === "approved");
  const clientChosenOffer = allOffers.find(o => o.status === "client_accepted");

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
      </div>
    );
  }

  // — Approved: show advisor contact card prominently
  if (approvedOffer) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-emerald-800">تم اعتماد طلبك — تواصل مع المستشار</h4>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5 text-center">
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-muted-foreground mb-1">نسبة الربح</p>
              <p className="text-xl font-black text-primary">{approvedOffer.profitRate}٪</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-muted-foreground mb-1">القسط الشهري</p>
              <p className="font-bold text-sm">{formatCurrency(approvedOffer.monthlyInstallment)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-muted-foreground mb-1">المدة</p>
              <p className="font-bold text-sm">{approvedOffer.durationMonths} شهر</p>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{approvedOffer.advisorName}</p>
                <p className="text-sm text-muted-foreground">{approvedOffer.advisorCompany}</p>
              </div>
            </div>
            {approvedOffer.advisorPhone && (
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${approvedOffer.advisorPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  اتصال مباشر
                </a>
                <a
                  href={`https://wa.me/966${approvedOffer.advisorPhone.replace(/^0/, "")}?text=${encodeURIComponent(buildAdvisorWhatsAppText(request, approvedOffer))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </a>
              </div>
            )}
          </div>

          {/* Sensitive-data warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-4 flex items-start gap-2 text-xs text-red-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">لا تشارك مع المستشار أي بيانات حساسة:</p>
              <p>رقم الهوية، رمز التحقق (OTP)، كلمة سر الخدمات المصرفية، أو أرقام البطاقات. التواصل لتنسيق الإجراءات الرسمية فقط.</p>
            </div>
          </div>

          {/* Official bank-side approval timestamp */}
          {approvedOffer.officialApprovalAt && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mt-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-violet-700 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-violet-800">تم اعتماد الموافقة الرسمية من البنك</p>
                <p className="text-violet-600">
                  {new Date(approvedOffer.officialApprovalAt).toLocaleString("ar-SA", { dateStyle: "long", timeStyle: "short" })}
                </p>
              </div>
            </div>
          )}

          {/* Client rating panel — only after advisor confirms contact */}
          {approvedOffer.contactStatus && (
            <ClientRatingPanel offer={approvedOffer} />
          )}
        </div>
      </div>
    );
  }

  // — Legacy awaiting_admin state (old data only) — new flow approves directly
  if (clientChosenOffer || request.status === "awaiting_admin") {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-emerald-800">تم اختيار العرض — تواصل مع المستشار</h4>
          </div>
          {clientChosenOffer && (
            <div className="bg-white rounded-xl border border-emerald-100 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">المستشار</p>
                  <p className="font-bold">{clientChosenOffer.advisorName}</p>
                  <p className="text-xs text-muted-foreground">{clientChosenOffer.advisorCompany}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نسبة الربح</p>
                  <p className="font-black text-lg text-primary">{clientChosenOffer.profitRate}٪</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">القسط الشهري</p>
                  <p className="font-bold">{formatCurrency(clientChosenOffer.monthlyInstallment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الإجمالي</p>
                  <p className="font-bold">{formatCurrency(clientChosenOffer.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-emerald-700 mt-3">سيتواصل معك المستشار مباشرة لإتمام الإجراءات.</p>
        </div>
      </div>
    );
  }

  // — No offers yet (and none rejected)
  if (sorted.length === 0 && rejectedByAdmin.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Clock className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <p className="font-bold text-foreground mb-1">لا توجد عروض بعد</p>
        <p className="text-sm text-muted-foreground">يراجع المستشارون طلبك حالياً — تصلك العروض خلال ٢٤–٧٢ ساعة</p>
      </div>
    );
  }

  // — Active: show offers for comparison & selection
  return (
    <>
      {/* Confirmation dialog overlay */}
      {confirmOffer && (
        <OfferConfirmDialog
          offer={confirmOffer}
          isPending={accepting}
          onConfirm={() => {
            acceptOffer(confirmOffer.id, {
              onSuccess: (data) => { const accepted = confirmOffer; setConfirmOffer(null); onAccepted?.(request, data as Offer ?? accepted); },
              onError: () => setConfirmOffer(null),
            });
          }}
          onCancel={() => setConfirmOffer(null)}
        />
      )}

      <div className="p-4 sm:p-6 space-y-4">
        {/* Timeline */}
        <RequestTimeline request={request} offers={allOffers} />

        {sortedTableOffers.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {sortedTableOffers.length} عرض متاح — قارن واختر الأفضل لك
              </h4>
              <button
                onClick={() => aiAdvice.mutate()}
                disabled={aiAdvice.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Sparkles className="w-4 h-4" />
                {aiAdvice.isPending ? "جارٍ التحليل..." : "المساعد المالي الذكي"}
              </button>
            </div>

            {aiAdvice.isError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 mt-3 flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{(aiAdvice.error as Error)?.message ?? "تعذّر توليد التوصية، حاول مرة أخرى"}</span>
              </div>
            )}
            {aiAdvice.data && <AiAdvicePanel advice={aiAdvice.data} offers={sortedTableOffers} />}

            {/* Comparison Table / Sortable Grid */}
            <div className="bg-white border border-border rounded-xl overflow-hidden mt-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-bold text-muted-foreground whitespace-nowrap">المستشار / البنك</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground cursor-pointer hover:bg-muted/80 whitespace-nowrap" onClick={() => handleSort("profitRate")}>
                        <div className="flex items-center gap-1">نسبة الربح {getSortIcon("profitRate")}</div>
                      </th>
                      <th className="px-4 py-3 font-bold text-muted-foreground cursor-pointer hover:bg-muted/80 whitespace-nowrap" onClick={() => handleSort("monthlyInstallment")}>
                        <div className="flex items-center gap-1">القسط الشهري {getSortIcon("monthlyInstallment")}</div>
                      </th>
                      <th className="px-4 py-3 font-bold text-muted-foreground cursor-pointer hover:bg-muted/80 whitespace-nowrap" onClick={() => handleSort("totalAmount")}>
                        <div className="flex items-center gap-1">الإجمالي {getSortIcon("totalAmount")}</div>
                      </th>
                      <th className="px-4 py-3 font-bold text-muted-foreground whitespace-nowrap">المدة</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground whitespace-nowrap">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border">
                    {sortedTableOffers.map((offer, idx) => {
                      const isBestRate = offer.profitRate === Math.min(...sortedTableOffers.map(o => o.profitRate));
                      const isBestInstallment = offer.monthlyInstallment === Math.min(...sortedTableOffers.map(o => o.monthlyInstallment));
                      
                      return (
                        <tr key={offer.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold">{offer.advisorName}</div>
                            <div className="text-xs text-muted-foreground">{offer.advisorCompany}</div>
                            {offer.features && offer.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {offer.features.map(f => {
                                  const meta = OFFER_FEATURE_LABELS[f];
                                  return meta ? <span key={f} className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-100">{meta.label}</span> : null;
                                })}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-black text-lg ${isBestRate ? "text-primary" : "text-foreground"}`}>{offer.profitRate}٪</span>
                            {isBestRate && sortedTableOffers.length > 1 && <span className="mr-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full inline-block">الأفضل</span>}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            <span className={isBestInstallment ? "text-primary" : ""}>{formatCurrency(offer.monthlyInstallment)}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(offer.totalAmount)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{offer.durationMonths} شهر</td>
                          <td className="px-4 py-3">
                            {isActive && (
                              <Button
                                onClick={() => setConfirmOffer(offer)}
                                disabled={accepting}
                                variant={isBestRate ? "default" : "outline"}
                                size="sm"
                                className="font-bold"
                              >
                                اختيار
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List View for detailed cards */}
            <div className="mt-8 space-y-4">
              <h5 className="font-bold text-sm text-muted-foreground">تفاصيل العروض</h5>
              {sortedTableOffers.map((offer, rank) => {
                const isBest = offer.id === bestId && sortedTableOffers.length > 1;
              const isHighestPrincipal = offerWithHighestPrincipal?.id === offer.id && highestPrincipalIsBetter;
              const saving = request.currentDebt - offer.totalAmount;

              return (
                <div
                  key={offer.id}
                  className={`relative rounded-2xl border transition-all ${
                    isBest
                      ? "border-primary ring-2 ring-primary/15 bg-primary/[0.02]"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-3 right-5 flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm">
                      <Trophy className="w-3 h-3" />
                      أقل نسبة ربح
                    </div>
                  )}
                  {isHighestPrincipal && (
                    <div className="absolute -top-3 left-5 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      أعلى صافي تمويل
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        rank === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {rank + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Top row: advisor + profit rate */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">المستشار / البنك</p>
                            <p className="font-bold truncate">{offer.advisorName}</p>
                            <p className="text-xs text-muted-foreground truncate">{offer.advisorCompany}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">نسبة الربح السنوية</p>
                            <div className="flex items-center gap-1">
                              <Percent className="w-3 h-3 text-primary" />
                              <span className="font-black text-lg text-primary">{offer.profitRate}٪</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">القسط الشهري</p>
                            <p className="font-bold">{formatCurrency(offer.monthlyInstallment)}</p>
                            <p className="text-xs text-muted-foreground">{offer.durationMonths} شهر</p>
                          </div>
                        </div>
                        {/* Detail row */}
                        <div className="grid grid-cols-3 gap-2 bg-muted/40 rounded-xl p-2.5 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">أصل التمويل</p>
                            <p className="font-semibold text-xs">{offer.principal ? formatCurrency(offer.principal) : "—"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">مبلغ الربح</p>
                            <p className="font-semibold text-xs">{offer.profitAmount ? formatCurrency(offer.profitAmount) : "—"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">الإجمالي</p>
                            <p className="font-semibold text-xs">{formatCurrency(offer.totalAmount)}</p>
                            {saving > 0 && (
                              <p className="text-xs text-emerald-600 font-semibold">وفّر {formatCurrency(saving)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Choose button — opens confirmation dialog */}
                      {isActive && (
                        <Button
                          onClick={() => setConfirmOffer(offer)}
                          disabled={accepting}
                          variant={isBest ? "default" : "outline"}
                          className="w-full sm:w-32 font-bold flex-shrink-0"
                          size="sm"
                        >
                          اختيار العرض
                        </Button>
                      )}
                    </div>

                    {offer.features && offer.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
                        {offer.features.map(f => {
                          const meta = OFFER_FEATURE_LABELS[f];
                          if (!meta) return null;
                          return (
                            <span key={f} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded-lg text-[11px] font-bold">
                              <span>{meta.icon}</span>{meta.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {offer.notes && (
                      <p className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">ملاحظة: </span>{offer.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}

        {/* Rejected offers — shown below active offers */}
        {rejectedByAdmin.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              عروض رُفضت من إدارة المنصة ({rejectedByAdmin.length})
            </h5>
            {rejectedByAdmin.map(offer => (
              <div key={offer.id} className="rounded-xl border border-red-200 bg-red-50/40 p-4 opacity-80">
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">المستشار / البنك</p>
                      <p className="font-bold">{offer.advisorName}</p>
                      <p className="text-xs text-muted-foreground">{offer.advisorCompany}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">نسبة الربح</p>
                      <span className="font-black text-base text-red-700">{offer.profitRate}٪</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">القسط الشهري</p>
                      <p className="font-semibold">{formatCurrency(offer.monthlyInstallment)}</p>
                      <p className="text-xs text-muted-foreground">{offer.durationMonths} شهر</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold whitespace-nowrap flex-shrink-0">عرض ملغي</span>
                </div>
                {offer.rejectionReason && (
                  <div className="mt-3 pt-3 border-t border-red-200 flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><span className="font-bold">سبب الرفض: </span>{offer.rejectionReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function RequestCard({ request, defaultExpanded = false, onAccepted }: { request: MyRequest; defaultExpanded?: boolean; onAccepted?: (request: MyRequest, offer: Offer) => void }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showReuse, setShowReuse] = useState(false);
  const status = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const ageMs = Date.now() - new Date(request.createdAt).getTime();
  const isOver24h = ageMs >= 24 * 60 * 60 * 1000;
  const canReuse = isOver24h && request.status !== "expired"
    && ["approved", "closed", "active", "awaiting_admin"].includes(request.status);

  const canExpand = request.offersCount > 0
    || request.status === "awaiting_admin"
    || request.status === "approved"
    || request.status === "active";

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      request.status === "approved" ? "border-emerald-300 shadow-emerald-50 shadow-md" :
      request.status === "awaiting_admin" ? "border-violet-200" : ""
    }`}>
      <button
        className="w-full text-right"
        onClick={() => canExpand && setExpanded(e => !e)}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              request.status === "approved" ? "bg-emerald-100" :
              request.status === "awaiting_admin" ? "bg-violet-100" :
              request.status === "active" ? "bg-blue-100" : "bg-muted"
            }`}>
              <FileText className={`w-5 h-5 ${
                request.status === "approved" ? "text-emerald-600" :
                request.status === "awaiting_admin" ? "text-violet-600" :
                request.status === "active" ? "text-blue-600" : "text-muted-foreground"
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-extrabold text-foreground">{formatRequestRef({ id: request.id, financingPurpose: request.financingPurpose, financingType: request.financingType, sector: request.sector })}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {request.employer}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {formatCurrency(request.currentDebt)}
                </span>
                <span>{getPurposeLabel(request.financingPurpose)} — {getTypeLabel(request.financingType)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(request.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {request.offersCount > 0 && (
                <div className="text-center hidden sm:block">
                  <p className="text-xl font-black text-primary">{request.offersCount}</p>
                  <p className="text-xs text-muted-foreground">عرض</p>
                </div>
              )}
              {canExpand && (
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  expanded ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                }`}>
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {/* Expired request: re-submit banner */}
      {request.status === "expired" && (
        <div className="border-t border-red-100 bg-red-50/60 px-5 py-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 mb-0.5">لا يوجد رد على طلبك</p>
              <p className="text-xs text-red-600 leading-relaxed">
                لم يُستجَب لطلبك خلال ٢٤ ساعة. يمكنك إعادة رفعه مجدداً بنفس البيانات.
              </p>
            </div>
          </div>
          <Link href="/apply">
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 w-full sm:w-auto gap-2"
              onClick={() => {
                const resubmitData = {
                  fullName: request.fullName,
                  employer: request.employer,
                  sector: request.sector,
                  financingPurpose: request.financingPurpose,
                  financingType: request.financingType,
                  salary: request.salary,
                  currentDebt: request.currentDebt,
                  remainingMonths: request.remainingMonths,
                  bankName: request.bankName,
                };
                localStorage.setItem("mqayada_resubmit", JSON.stringify(resubmitData));
              }}
            >
              <RefreshCcw className="w-4 h-4" />
              إعادة رفع الطلب بنفس البيانات
            </Button>
          </Link>
        </div>
      )}

      {/* Past request (>24h) — offer to resubmit with same data */}
      {canReuse && (
        <div className="border-t border-border/60 bg-primary/5 px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            مضى أكثر من ٢٤ ساعة على هذا الطلب — يمكنك إعادة رفعه بنفس البيانات.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setShowReuse(true); }}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            إعادة الطلب
          </Button>
        </div>
      )}

      {showReuse && <ReuseDataDialog request={request} onClose={() => setShowReuse(false)} />}

      {expanded && (
        <div className="border-t border-border/60 bg-muted/20">
          <OffersPanel request={request} onAccepted={onAccepted} />
        </div>
      )}
    </Card>
  );
}

/* ── Reusable client profile ── */
interface ClientProfile {
  salary: number | null;
  sector: string | null;
  employer: string | null;
  totalObligations: number | null;
}

function ProfileCard() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<{ salary: string; sector: string; employer: string; totalObligations: string }>({
    salary: "", sector: "", employer: "", totalObligations: "",
  });

  const { data: profile, isLoading } = useQuery<ClientProfile | null>({
    queryKey: ["/api/client-profile"],
    queryFn: async () => {
      const res = await window.fetch(`${BASE}/api/client-profile`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        salary: profile.salary != null ? String(profile.salary) : "",
        sector: profile.sector ?? "",
        employer: profile.employer ?? "",
        totalObligations: profile.totalObligations != null ? String(profile.totalObligations) : "",
      });
    }
  }, [profile]);

  const queryClient = useQueryClient();
  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await window.fetch(`${BASE}/api/client-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          salary: form.salary || null,
          sector: form.sector || null,
          employer: form.employer || null,
          totalObligations: form.totalObligations || null,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setOpen(false);
    },
  });

  const isEmpty = !isLoading && (!profile || (profile.salary == null && !profile.sector && !profile.employer && profile.totalObligations == null));

  if (isLoading) return null;

  return (
    <div className="mb-6">
      {isEmpty && !open && (
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">أكمل ملفك الشخصي</p>
            <p className="text-xs text-muted-foreground">احفظ بياناتك المالية مرة واحدة ليُملأ نموذج الطلب تلقائياً في كل مرة.</p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="flex-shrink-0">إكمال الملف</Button>
        </div>
      )}

      <Card className="border-border/60">
        <CardContent className="p-5">
          <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">ملفي الشخصي</p>
                <p className="text-xs text-muted-foreground">
                  {isEmpty ? "غير مكتمل" : "بياناتك المالية المحفوظة — تُستخدم لملء طلباتك"}
                </p>
              </div>
            </div>
            {saved && <span className="text-xs font-bold text-emerald-600">تم الحفظ ✓</span>}
            {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {open && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="الراتب الشهري (ريال)"
                  type="number"
                  placeholder="15000"
                  value={form.salary}
                  onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))}
                />
                <Input
                  label="إجمالي الالتزامات الحالية (اختياري)"
                  type="number"
                  placeholder="0"
                  value={form.totalObligations}
                  onChange={(e) => setForm(f => ({ ...f, totalObligations: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="جهة العمل"
                  placeholder="وزارة الصحة، شركة أرامكو..."
                  value={form.employer}
                  onChange={(e) => setForm(f => ({ ...f, employer: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-2">القطاع الوظيفي</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SECTORS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sector: s.value }))}
                      className={`rounded-xl border-2 p-2.5 text-sm font-bold transition-all ${
                        form.sector === s.value ? `${s.color} ring-2 ring-offset-1 ring-current` : "border-border hover:border-primary/40"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button size="sm" onClick={() => save()} disabled={isPending}>
                  {isPending ? "جارٍ الحفظ..." : "حفظ الملف"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Best price (latest bank rates) tab ── */
interface BestPriceAd {
  id: number;
  product: string;
  bankName: string;
  profitRate: number;
  sponsorshipAmount: number;
  createdAt: string;
}

function BestPriceTab() {
  const { data: ads, isLoading, error } = useQuery<BestPriceAd[]>({
    queryKey: ["best-price-ads"],
    queryFn: async () => {
      const res = await window.fetch(`${BASE}/api/best-price-ads`);
      if (!res.ok) throw new Error("فشل تحميل الأسعار");
      return res.json();
    },
  });

  useEffect(() => { markDealSeen("best_price"); }, []);

  const lastUpdated = ads?.length
    ? new Date(Math.max(...ads.map(a => new Date(a.createdAt).getTime())))
    : null;
  const bestRate = ads?.length ? Math.min(...ads.map(a => a.profitRate)) : null;
  const sorted = ads ? [...ads].slice().sort((a, b) => a.profitRate - b.profitRate) : [];

  return (
    <div className="space-y-5">
      {lastUpdated && (
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          آخر تحديث للأسعار: {lastUpdated.toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric", calendar: "gregory" })}
        </p>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-900 leading-relaxed">
        <p className="font-extrabold mb-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> تنويه
        </p>
        <p>
          هذه الأسعار استرشادية مأخوذة من آخر تحديثات أسعار البنوك، وتُعرض لغرض <strong>التوعية المالية</strong>{" "}
          لحين الحصول على الترخيص من الجهات المختصة، وبعدها سيتم إيصالك مباشرة إلى المستشار الذي يقدّم لك{" "}
          <strong>أفضل عرض متاح ومحدّث</strong>.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      )}

      {error != null && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center text-red-700">تعذّر تحميل الأسعار — أعد المحاولة لاحقاً</CardContent>
        </Card>
      )}

      {!isLoading && error == null && sorted.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Percent className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-bold mb-2">لا توجد أسعار منشورة حالياً</h3>
            <p className="text-muted-foreground text-sm">سيصلك إشعار فور تحديث أسعار البنوك على المنصة</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map(ad => {
          const isBest = ad.profitRate === bestRate;
          return (
            <Card key={ad.id} className={isBest ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : ""}>
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isBest ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                  {isBest ? <Trophy className="w-6 h-6" /> : <Building className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{ad.bankName}</p>
                    {isBest && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">أفضل سعر حالياً</Badge>
                    )}
                    {ad.sponsorshipAmount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> عرض مُموّل
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{ad.product}</p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className={`text-2xl font-black ${isBest ? "text-emerald-600" : "text-primary"}`}>{ad.profitRate}٪</p>
                  <p className="text-[11px] text-muted-foreground">نسبة الربح السنوية</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientPortal() {
  const { data: requests, isLoading, error } = useMyRequests();
  const { status: rateLimit, refetch: refetchRateLimit } = useRateLimit();
  const [showComplaint, setShowComplaint] = useState(false);
  const [contactModal, setContactModal] = useState<{ request: MyRequest; offer: Offer } | null>(null);
  const [tab, setTab] = useState<"requests" | "best">(() =>
    new URLSearchParams(window.location.search).get("tab") === "best" ? "best" : "requests"
  );
  const search = useSearch();
  useEffect(() => {
    if (new URLSearchParams(search).get("tab") === "best") setTab("best");
  }, [search]);
  const switchTab = (t: "requests" | "best") => {
    setTab(t);
    const url = new URL(window.location.href);
    if (t === "best") url.searchParams.set("tab", "best");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url.toString());
  };

  const activeRequests = requests?.filter(r => ["pending", "active"].includes(r.status)) ?? [];
  const completedRequests = requests?.filter(r => ["approved", "awaiting_admin", "closed", "expired"].includes(r.status)) ?? [];

  const firstWithOffers = activeRequests.find(r => r.offersCount > 0);

  const quotaUsed = rateLimit?.requestsInWindow ?? 0;
  const quotaMax = rateLimit?.maxRequests ?? 2;
  const atLimit = rateLimit ? !rateLimit.canSubmit : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10" dir="rtl">

      {/* Complaint modal */}
      {showComplaint && (
        <ComplaintModal
          requests={requests ?? []}
          onClose={() => setShowComplaint(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">
            {tab === "best" ? "أفضل عرض سعر" : "طلباتي"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {tab === "best" ? "حسب آخر تحديث لأسعار البنوك" : "تابع طلباتك وعروض التمويل المستلمة"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowComplaint(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">بلاغ / مشكلة</span>
            </button>
            <Link href="/apply">
              <Button className="gap-2 font-bold" disabled={atLimit}>
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">رفع طلب جديد</span>
                <span className="sm:hidden">جديد</span>
              </Button>
            </Link>
          </div>
          {rateLimit && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              atLimit
                ? "bg-red-50 text-red-700 border-red-200"
                : quotaUsed === 1
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <Zap className="w-3 h-3" />
              {quotaUsed}/{quotaMax} طلبات (٢٤ ساعة)
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 bg-muted/60 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => switchTab("requests")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            tab === "requests" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          طلباتي
        </button>
        <button
          onClick={() => switchTab("best")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${
            tab === "best" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Percent className="w-4 h-4" />
          أفضل عرض سعر
        </button>
      </div>

      {tab === "best" && <BestPriceTab />}

      {tab === "requests" && (<>
      {/* Reusable client profile */}
      <ProfileCard />

      {/* Rate limit countdown banner */}
      {atLimit && rateLimit?.nextAvailableAt && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Timer className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-800 text-sm">وصلت للحد الأقصى — طلب جديد بعد:</p>
            <p className="text-amber-700 text-lg">
              <InlineCountdown targetIso={rateLimit.nextAvailableAt} onExpired={refetchRateLimit} />
            </p>
          </div>
          <Link href="/apply">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0">
              الانتظار
            </Button>
          </Link>
        </div>
      )}

      {/* One request remaining warning */}
      {!atLimit && quotaUsed === 1 && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-blue-700">لديك طلب واحد متبقٍّ في الـ٢٤ ساعة القادمة</span>
        </div>
      )}

      {/* Loading / Error states */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center text-red-700">
            تعذّر تحميل طلباتك — تأكد من تسجيل الدخول وأعد المحاولة
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && requests?.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary/50" />
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد طلبات بعد</h2>
            <p className="text-muted-foreground mb-6 text-sm">ارفع طلب تمويل وانتظر عروض المستشارين</p>
            <Link href="/apply">
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                رفع أول طلب
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-foreground">الطلبات النشطة</h2>
          {activeRequests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              defaultExpanded={r.id === firstWithOffers?.id}
              onAccepted={(req, offer) => setContactModal({ request: req, offer })}
            />
          ))}
        </div>
      )}

      {/* Completed requests */}
      {completedRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground text-muted-foreground/80">الطلبات المنتهية</h2>
          {completedRequests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              onAccepted={(req, offer) => setContactModal({ request: req, offer })}
            />
          ))}
        </div>
      )}
      </>)}

      {contactModal && (
        <ContactModal
          request={contactModal.request}
          offer={contactModal.offer}
          onClose={() => setContactModal(null)}
        />
      )}
    </div>
  );
}
