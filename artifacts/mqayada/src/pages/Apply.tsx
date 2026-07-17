import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateRequest } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { SAUDI_BANKS, FINANCING_PURPOSES, FINANCING_TYPES, SECTORS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2, ArrowLeft, Building, Loader2, Sparkles, Info,
  ChevronDown, Timer, Clock, RefreshCcw, ShieldCheck,
  User, Phone, Briefcase, CreditCard, Send
} from "lucide-react";

/* ─── Rate limit hook ─── */
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("mqayada_token") ?? ""}` });

interface RateLimitStatus {
  requestsInWindow: number;
  maxRequests: number;
  nextAvailableAt: string | null;
  canSubmit: boolean;
}

function useRateLimit() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch(`${BASE_URL}/api/requests/my/rate-limit`, { headers: authHeader() });
      if (res.ok) setStatus(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { status, loading, refetch: fetch };
}

/* ─── Countdown timer ─── */
function CountdownTimer({ targetIso, onExpired }: { targetIso: string; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const calc = () => Math.max(0, new Date(targetIso).getTime() - Date.now());
    setRemaining(calc());
    const id = setInterval(() => {
      const r = calc(); setRemaining(r);
      if (r === 0) { clearInterval(id); onExpired(); }
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso, onExpired]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      {[{ label: "ساعة", value: h }, { label: "دقيقة", value: m }, { label: "ثانية", value: s }].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <span className="text-3xl font-black text-primary tabular-nums">{String(value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-muted-foreground mt-2 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

const FINANCING_SUBTYPES = FINANCING_TYPES.filter(f =>
  ["personal", "real_estate", "car"].includes(f.value)
);

const applySchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  sector: z.enum(["government", "semi_government", "private", "retired"], { message: "يجب اختيار القطاع" }),
  financingPurpose: z.enum(["new_financing", "refinancing", "debt_transfer"], { message: "يجب اختيار غرض التمويل" }),
  financingType: z.enum(["personal", "real_estate", "car"], { message: "يجب اختيار نوع التمويل" }),
  employer: z.string().min(2, "يجب إدخال جهة العمل"),
  salary: z.coerce.number().min(1000, "الراتب يجب أن يكون منطقياً"),
  currentDebt: z.coerce.number().min(0, "مبلغ المديونية غير صحيح"),
  remainingMonths: z.coerce.number().min(0, "الأشهر غير صحيحة"),
  bankName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.financingPurpose === "debt_transfer" && (!data.bankName || data.bankName.length < 1)) {
    ctx.addIssue({ code: "custom", path: ["bankName"], message: "يجب اختيار البنك الحالي عند نقل المديونية" });
  }
});

type ApplyFormValues = z.infer<typeof applySchema>;

interface BestRate {
  profitRate: string;
  bankName: string;
  durationMonths: number | null;
  financingType?: string;
}

interface BankRate {
  bankName: string;
  profitRate: number;
  durationMonths: number | null;
}

/* ─── Section header ─── */
function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="font-extrabold text-foreground text-lg leading-tight">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Apply() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [successId, setSuccessId] = useState<number | null>(null);
  const [bestRate, setBestRate] = useState<BestRate | null>(null);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [noRateFound, setNoRateFound] = useState(false);
  const [rateLimitNextAt, setRateLimitNextAt] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [entryMode, setEntryMode] = useState<"new" | "transfer" | null>(null);
  const [restoredFromPrevious, setRestoredFromPrevious] = useState(false);
  const [previewData, setPreviewData] = useState<ApplyFormValues | null>(null);
  const [allBankRates, setAllBankRates] = useState<BankRate[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  type PreferredFeature = "fees_waiver" | "free_credit_card" | "cashback_or_miles";
  const [preferredFeature, setPreferredFeature] = useState<PreferredFeature | null>(null);
  const [featureError, setFeatureError] = useState(false);

  const scrollTop = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch { window.scrollTo(0, 0); }
      });
    });
  };

  const { status: rateLimit, loading: rateLimitLoading, refetch: refetchRateLimit } = useRateLimit();

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors }
  } = useForm<ApplyFormValues>({ resolver: zodResolver(applySchema) });

  /* Pre-fill from auth user */
  useEffect(() => {
    if (user?.name) setValue("fullName", user.name);
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Pre-fill from saved client profile */
  useEffect(() => {
    (async () => {
      try {
        const profile = await customFetch<{ salary: number | null; sector: string | null; employer: string | null } | null>("/api/client-profile");
        if (!profile) return;
        if (profile.salary != null) setValue("salary", profile.salary);
        if (profile.sector) setValue("sector", profile.sector as any);
        if (profile.employer) setValue("employer", profile.employer);
      } catch { /* ignore */ }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Pre-fill from re-submit expired request */
  useEffect(() => {
    const saved = localStorage.getItem("mqayada_resubmit");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.fullName) setValue("fullName", data.fullName);
      if (data.employer) setValue("employer", data.employer);
      if (data.sector) setValue("sector", data.sector as any);
      if (data.financingPurpose) {
        setValue("financingPurpose", data.financingPurpose as any);
        setEntryMode(data.financingPurpose === "debt_transfer" ? "transfer" : "new");
      }
      if (data.financingType) setValue("financingType", data.financingType as any);
      if (data.salary) setValue("salary", data.salary);
      if (data.currentDebt) setValue("currentDebt", data.currentDebt);
      if (data.remainingMonths) setValue("remainingMonths", data.remainingMonths);
      if (data.bankName) setValue("bankName", data.bankName);
      localStorage.removeItem("mqayada_resubmit");
      setRestoredFromPrevious(true);
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const watchSector = watch("sector");
  const watchSalary = watch("salary");
  const watchFinancingType = watch("financingType");
  const watchFinancingPurpose = watch("financingPurpose");

  /* Live best rate */
  useEffect(() => {
    if (!watchSector || !watchSalary || Number(watchSalary) < 1000) {
      setBestRate(null); setNoRateFound(false); return;
    }
    const timer = setTimeout(async () => {
      setFetchingRate(true); setNoRateFound(false);
      try {
        const params = new URLSearchParams({ sector: watchSector, salary: String(watchSalary) });
        if (watchFinancingType) params.set("financingType", watchFinancingType);
        const data = await customFetch<BestRate | null>(`/api/pricing/best?${params}`);
        if (data) { setBestRate(data); } else { setBestRate(null); setNoRateFound(true); }
      } catch { setBestRate(null); } finally { setFetchingRate(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [watchSector, watchSalary, watchFinancingType]);

  const { mutate: createRequest, isPending } = useCreateRequest();

  const onSubmit = async (data: ApplyFormValues) => {
    if (!confirmed) return;
    setLoadingPreview(true);
    try {
      const params = new URLSearchParams({
        sector: data.sector,
        salary: String(data.salary),
        financingType: data.financingType,
      });
      const rates = await customFetch<BankRate[]>(`/api/pricing/all-banks?${params}`);
      setAllBankRates(Array.isArray(rates) ? rates : []);
      setPreviewData(data);
      scrollTop();
    } catch {
      setAllBankRates([]);
      setPreviewData(data);
      scrollTop();
    } finally {
      setLoadingPreview(false);
    }
  };

  const onConfirmSend = () => {
    if (!previewData) return;
    if (!preferredFeature) {
      setFeatureError(true);
      scrollTop();
      return;
    }
    setFeatureError(false);
    createRequest(
      { data: { ...previewData, preferredFeature } },
      {
        onSuccess: (result) => { setSuccessId(result.id); scrollTop(); },
        onError: (err: any) => {
          const nextAt = err?.nextAvailableAt ?? null;
          if (nextAt) setRateLimitNextAt(nextAt);
        },
      }
    );
  };

  /* ── Rate limit screen ── */
  const blockedNextAt = rateLimitNextAt ?? (rateLimit && !rateLimit.canSubmit ? rateLimit.nextAvailableAt : null);
  if (!rateLimitLoading && blockedNextAt) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full border-t-8 border-t-amber-400 shadow-2xl">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
              <Timer size={48} />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">وصلت للحد الأقصى اليوم</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              يمكنك تقديم <strong>طلبين كحد أقصى</strong> كل ٢٤ ساعة. يمكنك تقديم طلب جديد بعد:
            </p>
            <CountdownTimer targetIso={blockedNextAt} onExpired={refetchRateLimit} />
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-right mb-6 space-y-2">
              {["تحقق من طلباتك الحالية وعروضها", "المستشارون يعملون على طلباتك الآن", "ستُعلَم فور وصول عروض جديدة"].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" /><span>{t}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href="/client" className="flex-1">
                <Button size="lg" className="w-full gap-2">طلباتي وعروضي <ArrowLeft className="w-4 h-4" /></Button>
              </Link>
              <Button variant="outline" size="lg" onClick={refetchRateLimit} className="gap-2 px-4">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Success screen ── */
  if (successId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full border-t-8 border-t-emerald-500 shadow-2xl">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">تم رفع طلبك بنجاح!</h2>
            <p className="text-muted-foreground mb-2">رقم طلبك هو:</p>
            <p className="text-4xl font-black text-primary mb-6">#{successId}</p>
            {bestRate && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <p className="font-bold text-primary mb-1 text-sm">أفضل سعر تأهّلت له:</p>
                <p className="text-3xl font-black text-primary">{Number(bestRate.profitRate).toFixed(2)}٪</p>
                <p className="text-muted-foreground text-sm">{bestRate.bankName}</p>
              </div>
            )}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-right mb-8 space-y-2">
              {[
                "تم إبلاغ المستشارين المعتمدين بطلبك",
                "ستصلك العروض خلال ٢٤ ساعة عمل",
                "هويتك محمية طوال مرحلة العروض",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>{t}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => setLocation("/client")} size="lg" className="w-full gap-2">
              تابع عروضك في بوابتك <ArrowLeft className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Preview Screen: show all banks rates before final send ── */
  if (previewData && !successId) {
    const sortedRates = [...allBankRates].sort((a, b) => a.profitRate - b.profitRate);
    const bestBankRate = sortedRates[0];
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" dir="rtl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-foreground mb-1">معاينة قبل الإرسال</h1>
          <p className="text-muted-foreground text-sm">هذه أسعار البنوك المتاحة لملفك. راجعها ثم أرسل طلبك للمستشارين.</p>
        </div>

        {bestBankRate && (
          <Card className="mb-5 border-2 border-primary/30 bg-gradient-to-l from-primary/5 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">أفضل سعر متاح</span>
              </div>
              <div className="flex items-end gap-5">
                <div>
                  <p className="text-5xl font-black text-primary leading-none">{bestBankRate.profitRate.toFixed(2)}٪</p>
                  <p className="text-xs text-muted-foreground mt-1">نسبة ربح سنوية</p>
                </div>
                <div className="pb-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" /><span className="font-bold">{bestBankRate.bankName}</span></div>
                  {bestBankRate.durationMonths && <p className="text-sm text-muted-foreground">مدة السداد: {bestBankRate.durationMonths} شهر</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border/60">
              <h3 className="font-bold text-foreground">أسعار جميع البنوك المتاحة</h3>
              <p className="text-xs text-muted-foreground mt-0.5">مرتبة من الأقل (الأفضل) إلى الأعلى</p>
            </div>
            {sortedRates.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                لا توجد أسعار محددة مسبقاً لهذه الشريحة. سيتنافس المستشارون لتقديم أفضل عرض.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {sortedRates.map((r, i) => (
                  <div key={r.bankName} className={`flex items-center justify-between px-5 py-3 ${i === 0 ? "bg-primary/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{r.bankName}</p>
                        {r.durationMonths && <p className="text-xs text-muted-foreground">{r.durationMonths} شهر</p>}
                      </div>
                      {i === 0 && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">الأفضل</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className={`text-2xl font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>{r.profitRate.toFixed(2)}٪</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 mb-6 space-y-1.5">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 flex-shrink-0" /> هذه أسعار استرشادية. المستشارون قد يقدمون أفضل منها بعد مراجعة ملفك.</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 flex-shrink-0" /> عند إرسال الطلب يصل لجميع المستشارين المعتمدين فوراً.</div>
        </div>

        {/* ── Preferred extra feature question ── */}
        <Card className={`mb-6 ${featureError ? "border-2 border-red-300" : "border-primary/30"}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base leading-tight">
                  مع تمويلك الجديد، ما هي الميزة الإضافية التي تفضل أن تكون مرفقة مع العرض؟
                </h3>
                <p className="text-xs text-muted-foreground mt-1">اختر خياراً واحداً فقط — سيُبلَّغ المستشارون بتفضيلك.</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {([
                { value: "fees_waiver", label: "إعفاء كامل من الرسوم الإدارية", icon: "💰" },
                { value: "free_credit_card", label: "بطاقة ائتمانية مجانية مدى الحياة", icon: "💳" },
                { value: "cashback_or_miles", label: "برنامج استرداد نقدي (كاش باك) أو أميال طيران على مشترياتك", icon: "✈️" },
              ] as { value: PreferredFeature; label: string; icon: string }[]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    preferredFeature === opt.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredFeature"
                    value={opt.value}
                    checked={preferredFeature === opt.value}
                    onChange={() => { setPreferredFeature(opt.value); setFeatureError(false); }}
                    className="w-4 h-4 accent-primary flex-shrink-0"
                  />
                  <span className="text-xl flex-shrink-0">{opt.icon}</span>
                  <span className="text-sm font-semibold text-foreground leading-snug">{opt.label}</span>
                </label>
              ))}
            </div>
            {featureError && (
              <p className="text-xs text-red-600 mt-3 font-semibold">يجب اختيار ميزة إضافية واحدة قبل الإرسال.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={onConfirmSend}
            size="lg"
            className="flex-1 gap-3 text-base py-6"
            isLoading={isPending}
          >
            <Send className="w-5 h-5" />
            تأكيد وإرسال الطلب للمستشارين
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => { setPreviewData(null); setAllBankRates([]); scrollTop(); }}
            disabled={isPending}
            className="px-6"
          >
            رجوع للتعديل
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" dir="rtl">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-1">رفع طلب تمويل</h1>
        <p className="text-muted-foreground text-sm">أكمل بياناتك وسيتم الرد عليك من قِبل المستشارين خلال <strong>٢٤ ساعة عمل</strong></p>
      </div>

      {/* Restored banner */}
      {restoredFromPrevious && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-blue-800">
          <RefreshCcw className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">تم استعادة بيانات طلبك السابق</p>
            <p className="text-xs text-blue-600 mt-0.5">راجع البيانات وعدّلها إن لزم الأمر قبل الإرسال.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ── Entry choice: نوع الطلب ── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={Briefcase} title="ما نوع طلبك؟" sub="اختر المسار المناسب لطلبك" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setEntryMode("new");
                  setValue("financingPurpose", undefined as any);
                  setValue("bankName", "");
                }}
                className={`rounded-2xl border-2 p-5 text-right transition-all duration-200 ${
                  entryMode === "new" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-3xl mb-2">✨</div>
                <div className="font-bold">تمويل جديد</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">احصل على تمويل جديد أو حسّن شروط تمويلك الحالي.</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryMode("transfer");
                  setValue("financingPurpose", "debt_transfer" as any, { shouldValidate: true });
                }}
                className={`rounded-2xl border-2 p-5 text-right transition-all duration-200 ${
                  entryMode === "transfer" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-3xl mb-2">🔁</div>
                <div className="font-bold">نقل مديونية</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">انقل مديونيتك الحالية إلى بنك آخر بشروط أفضل.</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {entryMode && (<>

        {/* ── Section 1: بيانات شخصية ── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={User} title="البيانات الشخصية" sub="هويتك محمية — لن تُشارَك مع المستشارين" />
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="الاسم الكامل"
                placeholder="محمد عبدالله"
                {...register("fullName")}
                error={errors.fullName?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: غرض التمويل ── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={Briefcase} title="غرض التمويل ونوعه" />

            {/* Purpose */}
            <div className="mb-6">
              <label className="text-sm font-bold text-foreground block mb-3">ما الذي تحتاجه؟</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FINANCING_PURPOSES.filter(fp => entryMode === "transfer" ? fp.value === "debt_transfer" : fp.value !== "debt_transfer").map(fp => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => {
                      setValue("financingPurpose", fp.value as any, { shouldValidate: true });
                      setValue("financingType", undefined as any);
                    }}
                    className={`rounded-2xl border-2 p-4 text-right transition-all duration-200 ${
                      watchFinancingPurpose === fp.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-2xl mb-2">{fp.icon}</div>
                    <div className="font-bold text-sm">{fp.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">{fp.desc}</div>
                  </button>
                ))}
              </div>
              {errors.financingPurpose && <p className="text-xs text-red-500 mt-2">{errors.financingPurpose.message}</p>}
            </div>

            {/* Type — only after purpose */}
            {watchFinancingPurpose && (
              <div>
                <label className="text-sm font-bold text-foreground block mb-3">نوع التمويل</label>
                <div className="grid grid-cols-3 gap-3">
                  {FINANCING_SUBTYPES.map(ft => (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => setValue("financingType", ft.value as any, { shouldValidate: true })}
                      className={`rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                        watchFinancingType === ft.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="text-3xl mb-2">{ft.icon}</div>
                      <div className="text-sm font-bold">{ft.label}</div>
                    </button>
                  ))}
                </div>
                {errors.financingType && <p className="text-xs text-red-500 mt-2">{errors.financingType.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 3: بيانات العمل والراتب ── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={Building} title="بيانات العمل والراتب" sub="تُستخدم لتحديد أفضل نسبة ربح تستحقها" />

            {/* Sector */}
            <div className="mb-5">
              <label className="text-sm font-bold text-foreground block mb-3">القطاع الوظيفي</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SECTORS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setValue("sector", s.value as any, { shouldValidate: true })}
                    className={`rounded-xl border-2 p-3 text-sm font-bold transition-all duration-200 ${
                      watchSector === s.value
                        ? `${s.color} ring-2 ring-offset-1 ring-current`
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.sector && <p className="text-xs text-red-500 mt-2">{errors.sector.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="sm:col-span-2">
                <Input label="جهة العمل" placeholder="وزارة الصحة، شركة أرامكو..." {...register("employer")} error={errors.employer?.message} />
              </div>
              <Input label="الراتب الشهري (ريال)" type="number" step="0.01" inputMode="decimal" placeholder="15000" {...register("salary")} error={errors.salary?.message} />
            </div>

            {/* Education tooltip — salary impact */}
            <div className="flex items-start gap-2.5 bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 mb-4 leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
              <div>
                <p className="font-bold mb-0.5">معلومة مالية</p>
                <p>كلما ارتفع راتبك مع جهة عمل مستقرة، انخفضت نسبة الربح المعروضة. أدخل صافي الراتب بعد الاستقطاعات الأساسية للحصول على تقدير أدق.</p>
              </div>
            </div>

            {/* Live rate */}
            {fetchingRate && (
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                جاري البحث عن أفضل سعر متاح...
              </div>
            )}
            {!fetchingRate && bestRate && (
              <div className="bg-gradient-to-l from-primary/5 to-emerald-50 border-2 border-primary/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">أفضل سعر متاح لملفك الآن</span>
                </div>
                <div className="flex items-end gap-5">
                  <div>
                    <p className="text-5xl font-black text-primary leading-none">{Number(bestRate.profitRate).toFixed(2)}٪</p>
                    <p className="text-xs text-muted-foreground mt-1">نسبة ربح سنوية</p>
                  </div>
                  <div className="pb-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" /><span className="font-bold">{bestRate.bankName}</span></div>
                    {bestRate.durationMonths && <p className="text-sm text-muted-foreground">مدة السداد: {bestRate.durationMonths} شهر</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 border-t border-border/50 pt-3">
                  هذا السعر مبني على بيانات القطاع والراتب ونوع التمويل. العرض النهائي يصدر بعد مراجعة المستشار.
                </p>
              </div>
            )}
            {!fetchingRate && noRateFound && watchSector && Number(watchSalary) >= 1000 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                لا توجد أسعار مُعرَّفة لهذا القطاع ونطاق الراتب حالياً. سيتنافس المستشارون على تقديم أفضل عرض لك.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 4: التزاماتك المالية ── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={CreditCard} title="التزاماتك المالية الحالية" sub="بيانات قرضك أو تمويلك لدى البنك الحالي" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="مبلغ المديونية الحالي (ريال)"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="150000"
                {...register("currentDebt")}
                error={errors.currentDebt?.message}
              />
              <Input
                label="عدد الأشهر المتبقية"
                type="number"
                placeholder="48"
                {...register("remainingMonths")}
                error={errors.remainingMonths?.message}
              />

              {/* Education tooltip — DBR */}
              <div className="sm:col-span-2 flex items-start gap-2.5 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-bold mb-0.5">نسبة الالتزام (DBR)</p>
                  <p>تحدّد البنوك في السعودية حدّاً أقصى لنسبة القسط من الراتب (عادةً 33٪–65٪ حسب الفئة). كلما قلّ التزامك الحالي، زادت فرصتك في الحصول على عرض أفضل وقسط أقل.</p>
                </div>
              </div>

              {/* Bank select — only when transferring an existing debt */}
              {watchFinancingPurpose === "debt_transfer" && (
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-foreground block">البنك الممول الحالي</label>
                  <div className="relative">
                    <select
                      {...register("bankName")}
                      className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">— اختر البنك —</option>
                      {SAUDI_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* ── Section 5: الإقرار والإرسال ── */}
        <Card className="border-primary/30 bg-primary/2 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <SectionHeader icon={ShieldCheck} title="الإقرار والإرسال" />

            {/* Privacy note */}
            <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground mb-6 space-y-1.5">
              {[
                "هويتك مجهولة أمام المستشارين طوال مرحلة العروض",
                "بياناتك محمية ولا تُشارَك دون موافقتك",
                "تقديم الطلب مجاني تماماً بدون أي رسوم",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Confirmation checkbox */}
            <label className={`flex items-start gap-3 cursor-pointer select-none p-4 rounded-xl border-2 transition-all duration-200 mb-6 ${
              confirmed ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-primary flex-shrink-0 cursor-pointer rounded"
              />
              <span className="text-sm font-semibold text-foreground leading-snug">
                أُقر بأن جميع المعلومات المُدخلة أعلاه صحيحة ودقيقة، وأوافق على مشاركتها مع المستشارين الماليين المعتمدين على المنصة للحصول على عروض التمويل.
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-3 text-base py-6"
              disabled={!confirmed || loadingPreview}
              isLoading={loadingPreview}
            >
              <Send className="w-5 h-5" />
              متابعة — معاينة الأسعار قبل الإرسال
            </Button>

            {!confirmed && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                يجب الموافقة على الإقرار أعلاه لتتمكن من الإرسال
              </p>
            )}
          </CardContent>
        </Card>

        </>)}

      </form>
    </div>
  );
}
