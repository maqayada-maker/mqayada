import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useListRequests, useSubmitOffer, customFetch, type FinancingRequest } from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { FINANCING_TYPES, SAUDI_BANKS, SECTORS, SECTOR_BADGE, FINANCING_TYPE_BADGE, OFFER_FEATURES } from "@/lib/constants";
import { formatRequestRef } from "@/lib/requestRef";
import {
  Briefcase, Building, Wallet, Calendar, TrendingUp,
  CheckCircle2, ArrowLeft, LayoutList, TableProperties,
  Plus, Trash2, Loader2, Info,
  BarChart2, Send, ThumbsUp, Clock, ThumbsDown,
  Users, Flag, Edit2, Lock, UserCheck,
  PhoneCall, FileCheck, ListChecks, XCircle, Sparkles,
  Trophy, Award, Power, Star, Copy, Repeat, Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Types ─── */
interface PricingRule {
  id: number;
  advisorId: number;
  sector: string;
  financingType: string;
  salaryMin: number;
  salaryMax: number;
  profitRate: string;
  bankName: string;
  durationMonths: number | null;
  notes: string | null;
  isOwn?: boolean;
  ownerAdvisorName?: string;
  ownerAdvisorEmployeeId?: string;
  lastModifiedByName?: string;
  lastModifiedAt?: string;
}

interface AdvisorTarget {
  id: number;
  label: string;
  metric: "offers" | "agreed" | "rating";
  period: string;
  targetValue: number;
  current: number;
  pct: number;
}

interface AdvisorOffer {
  offerId: number;
  requestId: number;
  profitRate: number;
  principal: string | null;
  profitAmount: string | null;
  monthlyInstallment: number;
  totalAmount: number;
  durationMonths: number;
  notes: string | null;
  offerStatus: "pending" | "client_accepted" | "approved" | "rejected";
  offerCreatedAt: string;
  contactStatus: "contacted" | "agreed" | "not_agreed" | null;
  officialApprovalAt: string | null;
  clientRating: number | null;
  clientRatingComment: string | null;
  employer: string | null;
  sector: string | null;
  financingType: string | null;
  financingPurpose: string | null;
  salary: number;
  currentDebt: number;
  remainingMonths: number | null;
  bankName: string | null;
  requestStatus: string | null;
  clientName: string | null;
  clientPhone: string | null;
}

interface BankColleague {
  id: number;
  name: string;
  company: string;
  employeeId: string;
  monthsExperience: number;
  offersCount: number;
  successRate: number;
  isMe: boolean;
}

/* ─── Offer Schema ─── */
const offerSchema = z.object({
  profitRate: z.coerce.number().min(0).max(20, "نسبة الربح مرتفعة جداً"),
  principal: z.coerce.number().min(1000, "أصل التمويل غير صحيح"),
  profitAmount: z.coerce.number().min(0, "مبلغ الربح غير صحيح"),
  durationMonths: z.coerce.number().min(1, "المدة بالأشهر غير صحيحة"),
  notes: z.string().optional(),
  features: z.array(z.string()).optional(),
});
type OfferFormValues = z.infer<typeof offerSchema>;

/* ─── Pricing Rule Schema ─── */
const bandSchema = z.object({
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(1),
  profitRate: z.coerce.number().min(0.01).max(30),
  durationMonths: z.coerce.number().min(1).optional(),
});

const ruleSchema = z.object({
  sector: z.enum(["government", "semi_government", "private", "retired"]),
  financingType: z.enum(["personal", "real_estate", "car", "debt_purchase"]),
  bankName: z.string().min(1, "يجب اختيار البنك"),
  bands: z.array(bandSchema).min(1),
});
type RuleFormValues = z.infer<typeof ruleSchema>;
type SingleRulePayload = { sector: string; financingType: string; bankName: string; salaryMin: number; salaryMax: number; profitRate: number; durationMonths?: number };

/* ─── ContactStatusControls — advisor marks contact + result ── */
function ContactStatusControls({ offer }: { offer: AdvisorOffer }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const markContacted = useMutation({
    mutationFn: async () => {
      const res = await customFetch<{ ok: boolean }>(`/api/offers/${offer.offerId}/contact-status`, { method: "POST" });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/offers/my"] }),
    onError: (e: any) => setError(e?.message ?? "تعذّر التحديث"),
  });

  const setResult = useMutation({
    mutationFn: async (result: "agreed" | "not_agreed") => {
      const res = await customFetch<{ ok: boolean }>(`/api/offers/${offer.offerId}/contact-result`, {
        method: "POST",
        body: JSON.stringify({ result }),
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/offers/my"] }),
    onError: (e: any) => setError(e?.message ?? "تعذّر التحديث"),
  });

  const officialApproval = useMutation({
    mutationFn: async () => customFetch<{ ok: boolean; officialApprovalAt: string }>(
      `/api/offers/${offer.offerId}/official-approval`,
      { method: "POST" }
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/offers/my"] }),
    onError: (e: any) => setError(e?.message ?? "تعذّر التحديث"),
  });

  if (offer.contactStatus === "agreed") {
    return (
      <div className="space-y-2">
        <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
          <p className="text-sm font-bold text-emerald-800">تم الاتفاق مع العميل ✓</p>
        </div>
        {offer.officialApprovalAt ? (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 text-violet-700 mx-auto mb-1" />
            <p className="text-xs font-bold text-violet-800">تم اعتماد الموافقة الرسمية</p>
            <p className="text-[10px] text-violet-600 mt-0.5">
              {new Date(offer.officialApprovalAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
            isLoading={officialApproval.isPending}
            onClick={() => { setError(null); officialApproval.mutate(); }}
          >
            <Award className="w-4 h-4" /> تسجيل الموافقة الرسمية للبنك
          </Button>
        )}
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>
    );
  }
  if (offer.contactStatus === "not_agreed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
        <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
        <p className="text-sm font-bold text-red-700">لم يتم الاتفاق</p>
      </div>
    );
  }
  if (offer.contactStatus === "contacted") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-center text-muted-foreground font-semibold">نتيجة التواصل:</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
            isLoading={setResult.isPending && setResult.variables === "agreed"}
            disabled={setResult.isPending}
            onClick={() => { setError(null); setResult.mutate("agreed"); }}
          >
            <CheckCircle2 className="w-4 h-4" /> تم الاتفاق
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
            isLoading={setResult.isPending && setResult.variables === "not_agreed"}
            disabled={setResult.isPending}
            onClick={() => { setError(null); setResult.mutate("not_agreed"); }}
          >
            <XCircle className="w-4 h-4" /> لم يتم الاتفاق
          </Button>
        </div>
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <Button
        size="sm"
        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
        isLoading={markContacted.isPending}
        onClick={() => { setError(null); markContacted.mutate(); }}
      >
        <PhoneCall className="w-4 h-4" /> تم التواصل مع العميل
      </Button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────── */
export default function AdvisorPortal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ADVISOR_ID = user?.advisorId ?? 1;
  const [activeTab, setActiveTab] = useState<"new" | "sent" | "approved" | "performance" | "pricing" | "colleagues">("new");
  const [performanceSubTab, setPerformanceSubTab] = useState<"stats" | "leaderboard" | "targets">("stats");
  const [selectedRequest, setSelectedRequest] = useState<FinancingRequest | null>(null);
  const [filterSector, setFilterSector] = useState<string>("");
  const [filterFinancingType, setFilterFinancingType] = useState<string>("");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [reportingColleague, setReportingColleague] = useState<BankColleague | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  /* ── Requests: fetch both pending and active (backend filters for advisor role) ── */
  const { data: requests, isLoading } = useListRequests();

  /* ── My submitted offers ── */
  const { data: myOffers, isLoading: loadingMyOffers } = useQuery<AdvisorOffer[]>({
    queryKey: ["/api/offers/my"],
    queryFn: () => customFetch<AdvisorOffer[]>("/api/offers/my"),
    enabled: ["new", "sent", "approved"].includes(activeTab),
  });
  const myOfferRequestIds = new Set((myOffers ?? []).map(o => o.requestId));
  const allNewRequests = (requests ?? []).filter(r => !myOfferRequestIds.has(r.id));
  const newRequests = allNewRequests.filter(r => {
    const reqAny = r as any;
    if (filterSector && reqAny.sector !== filterSector) return false;
    const reqType = reqAny.financingType === "debt_transfer" ? "debt_purchase" : reqAny.financingType;
    if (filterFinancingType && reqType !== filterFinancingType) return false;
    return true;
  });
  const sentOffers = (myOffers ?? []).filter(o => o.offerStatus !== "approved");
  const approvedOffers = (myOffers ?? []).filter(o => o.offerStatus === "approved");
  const { mutate: submitOffer, isPending: submittingOffer } = useSubmitOffer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/offers/my"] });
        setSelectedRequest(null); offerForm.reset();
        setCalcEnabled(false); setSelectedFeatures([]);
        setCalcDeductionRate("33.33"); setCalcMonths(""); setCalcProfitRate("");
      },
    },
  });

  const offerForm = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });
  const { principal, profitAmount, durationMonths: offerDuration } = offerForm.watch();

  const totalAmount = (Number(principal) || 0) + (Number(profitAmount) || 0);
  const monthlyInstallment = offerDuration > 0 && totalAmount > 0
    ? +(totalAmount / offerDuration).toFixed(2) : 0;

  const onSubmitOffer = (data: OfferFormValues) => {
    if (!selectedRequest) return;
    submitOffer({
      id: selectedRequest.id,
      data: {
        advisorId: ADVISOR_ID,
        profitRate: data.profitRate,
        principal: data.principal,
        profitAmount: data.profitAmount,
        totalAmount,
        monthlyInstallment,
        durationMonths: data.durationMonths,
        notes: data.notes,
        features: selectedFeatures,
      } as any,
    });
  };

  /* ── Advisor Stats ── */
  const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
  const { data: advisorStats, isLoading: loadingStats } = useQuery<{
    totalSent: number; clientAccepted: number; approved: number; awaitingAdmin: number; rejected: number;
  }>({
    queryKey: ["/api/stats/advisor"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/stats/advisor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("mqayada_token") ?? ""}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });

  /* ── Advisor Analytics ── */
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery<{
    totalOffers: number;
    approvedOffers: number;
    agreedDeals: number;
    conversionRate: number;
    avgResponseTimeHours: number | null;
    expectedRevenue: number;
    wonVolume: number;
    pipelineValue: number;
    avgRating: number | null;
    ratingsCount: number;
  }>({
    queryKey: ["/api/advisors/me/analytics"],
    queryFn: () => customFetch("/api/advisors/me/analytics"),
    enabled: activeTab === "performance" && performanceSubTab === "stats",
  });

  /* ── Pricing Rules ── */
  const { data: pricingRules, isLoading: loadingRules } = useQuery<PricingRule[]>({
    queryKey: ["/api/pricing/rules"],
    queryFn: () => customFetch<PricingRule[]>("/api/pricing/rules"),
  });

  /* ── My Targets ── */
  const { data: targetsData, isLoading: loadingTargets } = useQuery<{ targets: AdvisorTarget[]; overallPct: number | null }>({
    queryKey: ["/api/advisor/targets"],
    queryFn: () => customFetch<{ targets: AdvisorTarget[]; overallPct: number | null }>("/api/advisor/targets"),
    enabled: activeTab === "performance" && performanceSubTab === "targets",
  });

  const ruleForm = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { bands: [{ salaryMin: 0, salaryMax: 0, profitRate: 0 }] },
  });
  const watchRuleSector = ruleForm.watch("sector");
  const watchRuleFinancingType = ruleForm.watch("financingType");
  const watchBankName = ruleForm.watch("bankName");

  const { fields: bandFields, append: appendBand, remove: removeBand } = useFieldArray({
    control: ruleForm.control,
    name: "bands",
  });

  useEffect(() => {
    if (showRuleModal && user?.company) {
      ruleForm.setValue("bankName", user.company);
    }
  }, [showRuleModal]);

  const { mutateAsync: createRuleAsync, isPending: creatingRule } = useMutation({
    mutationFn: (data: SingleRulePayload) =>
      customFetch<PricingRule>("/api/pricing/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/rules"] });
    },
  });

  const onSubmitRules = async (data: RuleFormValues) => {
    for (const band of data.bands) {
      await createRuleAsync({
        sector: data.sector,
        financingType: data.financingType,
        bankName: data.bankName,
        salaryMin: band.salaryMin,
        salaryMax: band.salaryMax,
        profitRate: band.profitRate,
        durationMonths: band.durationMonths,
      });
    }
    setShowRuleModal(false);
    ruleForm.reset({ bands: [{ salaryMin: 0, salaryMax: 0, profitRate: 0 }] });
  };

  const { mutate: deleteRule } = useMutation({
    mutationFn: (id: number) => customFetch(`/api/pricing/rules/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/pricing/rules"] }),
  });

  const { mutate: updateRule, isPending: updatingRule } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ profitRate: number; salaryMin: number; salaryMax: number; durationMonths: number; notes: string }> }) =>
      customFetch(`/api/pricing/rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/rules"] });
      setEditingRule(null);
    },
  });

  /* ── Advisor profile (availability) ── */
  const { data: meProfile } = useQuery<{
    availability: boolean; name: string; company: string;
    pendingCompany: string | null; bankChangeStatus: string | null;
  }>({
    queryKey: ["/api/advisors/me"],
    queryFn: () => customFetch("/api/advisors/me"),
  });
  const { mutate: toggleAvailability, isPending: togglingAvailability } = useMutation({
    mutationFn: (availability: boolean) =>
      customFetch<{ ok: boolean; availability: boolean }>("/api/advisors/me/availability", {
        method: "PATCH",
        body: JSON.stringify({ availability }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/advisors/me"] }),
  });

  /* ── Bank Change Request ── */
  const [showBankChange, setShowBankChange] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const { mutate: requestBankChange, isPending: requestingBankChange } = useMutation({
    mutationFn: (newCompany: string) =>
      customFetch<{ ok: boolean }>("/api/advisors/me/bank-change", {
        method: "PATCH",
        body: JSON.stringify({ newCompany }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advisors/me"] });
      setShowBankChange(false);
      setNewBankName("");
    },
    onError: (e: any) => alert(e?.message || "تعذّر إرسال الطلب"),
  });

  /* ── Offer modal: calculator + features state ── */
  const [calcEnabled, setCalcEnabled] = useState(false);
  const [calcDeductionRate, setCalcDeductionRate] = useState("33.33");
  const [calcMonths, setCalcMonths] = useState("");
  const [calcProfitRate, setCalcProfitRate] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const toggleFeature = (v: string) => setSelectedFeatures(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  /* ── Leaderboard ── */
  type LeaderboardRow = {
    advisorId: number; name: string; company: string; monthsExperience: number;
    avgRating: number; ratingCount: number; agreedCount: number; trustedAdvisor: boolean;
  };
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<LeaderboardRow[]>({
    queryKey: ["/api/advisors/leaderboard"],
    queryFn: () => customFetch("/api/advisors/leaderboard"),
    enabled: activeTab === "performance" && performanceSubTab === "leaderboard",
  });

  /* ── Bank Colleagues ── */
  const { data: colleagues, isLoading: loadingColleagues } = useQuery<BankColleague[]>({
    queryKey: ["/api/advisors/my-bank"],
    queryFn: () => customFetch("/api/advisors/my-bank"),
    enabled: activeTab === "colleagues",
  });

  /* ── Group rules by sector+financingType ── */
  const groupedRules = (pricingRules ?? []).reduce<Record<string, PricingRule[]>>((acc, r) => {
    const key = `${r.sector}::${r.financingType}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const totalRequests = requests?.length ?? 0;

  const getRulePreview = () => {
    const { bankName, bands } = ruleForm.getValues();
    const sectorObj = SECTORS.find(s => s.value === watchRuleSector);
    const ftObj = FINANCING_TYPES.find(f => f.value === watchRuleFinancingType);
    if (!sectorObj || !ftObj || !bankName || !bands?.length) return null;
    const validBands = bands.filter(b => b.salaryMin >= 0 && b.salaryMax > 0 && b.profitRate > 0);
    if (!validBands.length) return null;
    return { sectorLabel: sectorObj.label, ftLabel: `${ftObj.icon} ${ftObj.label}`, validBands, bankName };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-3 py-1 rounded-full mb-3">مستشار معتمد</p>
          <h1 className="text-4xl font-extrabold mb-1">مرحباً، {user?.name ?? "المستشار"}</h1>
          <p className="text-muted-foreground">إدارة طلبات العملاء وجداول الأسعار</p>
        </div>

        {/* Availability toggle */}
        {meProfile && (
          <div className={`mb-6 flex items-center justify-between gap-4 rounded-2xl px-5 py-4 border-2 ${meProfile.availability ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meProfile.availability ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm">
                  {meProfile.availability ? "حالتك: متاح لاستقبال طلبات جديدة" : "حالتك: متوقف مؤقتاً"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {meProfile.availability
                    ? "العملاء يرون عروضك ضمن المنصة."
                    : "أوقفت الاستقبال — لن تظهر لك طلبات جديدة. يمكنك إعادة التفعيل في أي وقت."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={meProfile.availability ? "outline" : "default"}
              isLoading={togglingAvailability}
              onClick={() => toggleAvailability(!meProfile.availability)}
              className="font-bold"
            >
              {meProfile.availability ? "إيقاف مؤقت" : "تفعيل الاستقبال"}
            </Button>
          </div>
        )}

        {/* Bank change request banner */}
        {meProfile && (
          <div className="mb-6 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold">بنكك الحالي: {meProfile.company}</p>
                  {meProfile.bankChangeStatus === "pending" && meProfile.pendingCompany ? (
                    <p className="text-xs text-amber-700 font-bold">
                      ⏳ طلب نقل قيد المراجعة من الإدارة — البنك الجديد: <strong>{meProfile.pendingCompany}</strong>
                    </p>
                  ) : meProfile.bankChangeStatus === "rejected" ? (
                    <p className="text-xs text-red-600">تم رفض طلب نقل البنك السابق. يمكنك تقديم طلب جديد.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">إذا انتقلت لبنك آخر، قدّم طلب تحديث ليتم اعتماده من الإدارة.</p>
                  )}
                </div>
              </div>
              {meProfile.bankChangeStatus !== "pending" && (
                <Button size="sm" variant="outline" onClick={() => setShowBankChange(true)} className="gap-2">
                  <Repeat className="w-4 h-4" /> طلب تغيير البنك
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "طلبات جديدة", value: newRequests.length, icon: Briefcase, color: "text-primary", bg: "bg-primary/10", tab: "new" },
            { label: "عروضي المُرسَلة", value: myOffers?.length ?? 0, icon: Send, color: "text-violet-600", bg: "bg-violet-50", tab: "sent" },
            { label: "موافق عليها", value: approvedOffers.length, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", tab: "approved" },
          ].map((stat, i) => (
            <Card key={i} onClick={() => setActiveTab(stat.tab as any)} className="border-border/50 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all">
              <CardContent className="p-4 sm:p-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {[
            { key: "new", label: "طلبات جديدة", icon: ListChecks, badge: newRequests.length },
            { key: "sent", label: "تم الرد عليها", icon: Send, badge: sentOffers.length },
            { key: "approved", label: "موافق عليها", icon: FileCheck, badge: approvedOffers.length },
            { key: "performance", label: "أدائي", icon: BarChart2 },
            { key: "pricing", label: "جدول الأسعار", icon: TableProperties },
            { key: "colleagues", label: "زملائي في البنك", icon: Users },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-primary border border-b-white border-border -mb-px" : "text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge ? <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">{tab.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tabs: new / sent / approved (now top-level) ─── */}
      {(activeTab === "new" || activeTab === "sent" || activeTab === "approved") && (
        <div className="space-y-5">

          {/* ── طلبات جديدة ── */}
          {activeTab === "new" && (
            <>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 items-center bg-muted/40 rounded-xl px-4 py-3 border border-border/50">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">تصفية:</span>
              <select
                value={filterSector}
                onChange={e => setFilterSector(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
              >
                <option value="">كل القطاعات</option>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select
                value={filterFinancingType}
                onChange={e => setFilterFinancingType(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
              >
                <option value="">كل أنواع التمويل</option>
                {FINANCING_TYPES.filter(f => f.value !== "debt_transfer").map(f => <option key={f.value} value={f.value}>{f.icon} {f.label}</option>)}
              </select>
              {(filterSector || filterFinancingType) && (
                <button
                  onClick={() => { setFilterSector(""); setFilterFinancingType(""); }}
                  className="text-xs text-destructive hover:underline font-bold"
                >
                  مسح الفلتر
                </button>
              )}
              <span className="text-xs text-muted-foreground mr-auto">
                {newRequests.length} / {allNewRequests.length} طلب
              </span>
            </div>

            {(isLoading || loadingMyOffers) ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Card key={i} className="h-56 animate-pulse bg-muted" />)}
              </div>
            ) : !newRequests.length ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="p-16 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">لا توجد طلبات جديدة</h3>
                  <p className="text-muted-foreground text-sm">لقد قدّمت عروضاً على جميع الطلبات المتاحة حالياً، أو لا توجد طلبات بعد.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newRequests.map((req) => {
                  const debtRatio = req.salary > 0 && req.remainingMonths > 0
                    ? Math.round((req.currentDebt / (req.salary * req.remainingMonths)) * 100) : 0;
                  const reqAny = req as any;
                  const sectorLabel = SECTORS.find(s => s.value === reqAny.sector)?.label;
                  const ftObj = FINANCING_TYPES.find(f => f.value === reqAny.financingType);
                  return (
                    <Card key={req.id} className="flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-border/50">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="font-bold">{formatRequestRef({ id: req.id, financingPurpose: req.financingPurpose, financingType: req.financingType, sector: req.sector })}</Badge>
                          <div className="flex flex-col items-end gap-1">
                            {ftObj && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FINANCING_TYPE_BADGE[reqAny.financingType] ?? "bg-muted text-muted-foreground"}`}>
                                {ftObj.icon} {ftObj.label}
                              </span>
                            )}
                            {sectorLabel && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SECTOR_BADGE[reqAny.sector] ?? "bg-muted text-muted-foreground"}`}>
                                {sectorLabel}
                              </span>
                            )}
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{req.offersCount} عروض</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-base mb-4 truncate">{req.employer}</h3>
                        <div className="space-y-2.5 mb-5 flex-1">
                          {[
                            { icon: Wallet, label: "الراتب", value: formatCurrency(req.salary) },
                            { icon: Building, label: "المديونية", value: formatCurrency(req.currentDebt) },
                            { icon: Calendar, label: "المتبقي", value: `${req.remainingMonths} شهر` },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon className="w-4 h-4 text-primary" /><span>{label}</span>
                              </div>
                              <strong>{value}</strong>
                            </div>
                          ))}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="w-4 h-4 text-primary" /><span>نسبة المديونية</span>
                            </div>
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${debtRatio > 70 ? "bg-red-50 text-red-600" : debtRatio > 40 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                              {debtRatio}٪
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => { setSelectedRequest(req); offerForm.reset(); }} className="w-full gap-2 group-hover:shadow-lg transition-shadow">
                          تقديم عرض <Send className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
            }
            </>
          )}

          {/* ── Sub-tab: عروضي المُرسَلة ── */}
          {activeTab === "sent" && (
            loadingMyOffers ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
              </div>
            ) : !sentOffers.length ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="p-16 text-center">
                  <Send className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">لم ترسل أي عروض بعد</h3>
                  <p className="text-muted-foreground text-sm mb-6">ابدأ بتقديم عروض على الطلبات الجديدة لتظهر هنا.</p>
                  <Button onClick={() => setActiveTab("new")} variant="outline" className="gap-2">
                    <ListChecks className="w-4 h-4" /> الطلبات الجديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sentOffers.map((offer) => {
                  const sectorLabel = SECTORS.find(s => s.value === offer.sector)?.label;
                  const ftObj = FINANCING_TYPES.find(f => f.value === offer.financingType);
                  const statusConfig = {
                    pending: { label: "بانتظار اختيار العميل", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
                    client_accepted: { label: "العميل قبل عرضك — تواصل الآن", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
                    rejected: { label: "مرفوض", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
                    approved: { label: "العميل قبل عرضك — تواصل الآن", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
                    closed: { label: "اختار العميل عرضاً آخر", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
                  }[offer.offerStatus] ?? { label: offer.offerStatus, color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };

                  return (
                    <Card key={offer.offerId} className="flex flex-col border-border/50">
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="font-bold">{formatRequestRef({ id: offer.requestId, financingPurpose: offer.financingPurpose, financingType: offer.financingType, sector: offer.sector })}</Badge>
                          <div className="flex flex-col items-end gap-1">
                            {ftObj && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FINANCING_TYPE_BADGE[offer.financingType ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                                {ftObj.icon} {ftObj.label}
                              </span>
                            )}
                            {sectorLabel && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SECTOR_BADGE[offer.sector ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                                {sectorLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-sm mb-3 truncate">{offer.employer ?? "—"}</h3>

                        {/* Offer details */}
                        <div className="bg-primary/5 rounded-xl p-3 mb-3 space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">نسبة الربح</span>
                            <strong className="text-primary">{offer.profitRate.toFixed(2)}٪</strong>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">القسط الشهري</span>
                            <strong>{formatCurrency(offer.monthlyInstallment)}</strong>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">المدة</span>
                            <strong>{offer.durationMonths} شهر</strong>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border ${statusConfig.color} mt-auto`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig.dot} flex-shrink-0`} />
                          {statusConfig.label}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          )}

          {/* ── Sub-tab: الموافق عليها ── */}
          {activeTab === "approved" && (
            loadingMyOffers ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map(i => <Card key={i} className="h-56 animate-pulse bg-muted" />)}
              </div>
            ) : !approvedOffers.length ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="p-16 text-center">
                  <FileCheck className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">لا توجد عروض موافق عليها بعد</h3>
                  <p className="text-muted-foreground text-sm">عند اعتماد الإدارة لعرضك ستظهر هنا بيانات العميل لإتمام إجراءات التمويل.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {approvedOffers.map((offer) => {
                  const sectorLabel = SECTORS.find(s => s.value === offer.sector)?.label;
                  const ftObj = FINANCING_TYPES.find(f => f.value === offer.financingType);
                  return (
                    <Card key={offer.offerId} className="flex flex-col border-t-4 border-t-emerald-500 border-border/50">
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{formatRequestRef({ id: offer.requestId, financingPurpose: offer.financingPurpose, financingType: offer.financingType, sector: offer.sector })}</p>
                              <p className="text-xs font-bold text-emerald-700">العميل اختار عرضك</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {ftObj && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FINANCING_TYPE_BADGE[offer.financingType ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                                {ftObj.icon} {ftObj.label}
                              </span>
                            )}
                            {sectorLabel && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SECTOR_BADGE[offer.sector ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                                {sectorLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-sm mb-3">{offer.employer ?? "—"}</h3>

                        {/* Offer summary */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">نسبة الربح</span>
                            <strong className="text-emerald-700">{offer.profitRate.toFixed(2)}٪</strong>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">إجمالي التمويل</span>
                            <strong>{formatCurrency(offer.totalAmount)}</strong>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">القسط الشهري</span>
                            <strong>{formatCurrency(offer.monthlyInstallment)}</strong>
                          </div>
                        </div>

                        {/* Client contact — revealed after approval */}
                        <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 mb-4">
                          <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5" /> بيانات العميل — لإتمام إجراءات التمويل
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">الاسم</span>
                              <strong>{offer.clientName ?? "—"}</strong>
                            </div>
                            {offer.clientPhone && (
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">الجوال</span>
                                <a href={`tel:${offer.clientPhone}`} className="font-bold text-primary flex items-center gap-1 hover:underline">
                                  <PhoneCall className="w-3.5 h-3.5" />{offer.clientPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mb-3">سيتواصل معك العميل لإتمام التمويل</p>

                        <ContactStatusControls offer={offer} />

                        {offer.clientRating && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> تقييم العميل لخدمتك
                            </p>
                            <div className="flex items-center gap-1 mb-1">
                              {[1,2,3,4,5].map(n => (
                                <span key={n} className={`text-lg leading-none ${n <= (offer.clientRating ?? 0) ? "text-amber-500" : "text-muted-foreground/30"}`}>★</span>
                              ))}
                              <span className="text-xs font-bold text-amber-700 ms-1">({offer.clientRating}/5)</span>
                            </div>
                            {offer.clientRatingComment && (
                              <p className="text-xs text-amber-900 italic">"{offer.clientRatingComment}"</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          )}

        </div>
      )}

      {/* ─── Tab: Performance (stats / leaderboard / targets) ─── */}
      {activeTab === "performance" && (
        <div className="space-y-5">
          {/* Performance sub-tab switcher */}
          <div className="flex gap-1.5 bg-muted/60 rounded-xl p-1.5">
            {([
              { key: "stats", label: "إحصائياتي", icon: BarChart2 },
              { key: "leaderboard", label: "لوحة المتصدرين", icon: Trophy },
              { key: "targets", label: "المستهدفات", icon: Target },
            ] as const).map(sub => (
              <button key={sub.key} onClick={() => setPerformanceSubTab(sub.key)}
                className={`flex items-center gap-2 flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-all justify-center whitespace-nowrap ${performanceSubTab === sub.key ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <sub.icon className="w-4 h-4 flex-shrink-0" />
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

          {/* ── المستهدفات ── */}
          {performanceSubTab === "targets" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-l from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold">المستهدفات</h3>
                <p className="text-sm text-muted-foreground">الأهداف التي حدّدها مشرف المستشارين في بنكك ونسبة إنجازك لها</p>
              </div>
            </div>
            {targetsData?.overallPct != null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-bold text-foreground">الإنجاز الإجمالي</span>
                  <span className="font-black text-primary">{targetsData.overallPct}٪</span>
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${targetsData.overallPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {loadingTargets ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !targetsData?.targets.length ? (
            <Card className="border-dashed border-2 border-border/60">
              <CardContent className="py-12 text-center">
                <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">لا توجد مستهدفات محدّدة</p>
                <p className="text-sm text-muted-foreground">لم يحدّد مشرف المستشارين أي مستهدفات لك بعد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {targetsData.targets.map(t => {
                const metricLabel = t.metric === "offers" ? "عرض مُقدَّم" : t.metric === "agreed" ? "اتفاق مع عميل" : "متوسط التقييم";
                const periodLabel = t.period === "monthly" ? "شهري" : t.period === "quarterly" ? "ربع سنوي" : t.period === "yearly" ? "سنوي" : t.period;
                const done = t.pct >= 100;
                return (
                  <Card key={t.id} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-foreground">{t.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{metricLabel} · {periodLabel}</p>
                        </div>
                        <Badge className={done ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                          {done ? "مكتمل" : "قيد التقدّم"}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-2xl font-black text-primary">{t.current}</span>
                        <span className="text-sm text-muted-foreground">/ {t.targetValue}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${t.pct}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 text-left">{t.pct}٪</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── إحصائياتي ── */}
      {performanceSubTab === "stats" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-l from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold">أداؤك على المنصة</h3>
                <p className="text-sm text-muted-foreground">إحصائيات عروضك المقدَّمة للعملاء</p>
              </div>
            </div>
          </div>

          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-5 h-24 animate-pulse bg-muted" /></Card>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "إجمالي العروض المُرسَلة",
                  value: advisorStats?.totalSent ?? 0,
                  icon: Send,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  border: "border-t-primary",
                  sub: "منذ انضمامك للمنصة",
                },
                {
                  label: "وافق عليها العملاء",
                  value: advisorStats?.clientAccepted ?? 0,
                  icon: ThumbsUp,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  border: "border-t-emerald-500",
                  sub: `منها ${advisorStats?.approved ?? 0} مكتملة`,
                },
                {
                  label: "بانتظار التواصل",
                  value: advisorStats?.awaitingAdmin ?? 0,
                  icon: Clock,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                  border: "border-t-violet-500",
                  sub: "العميل اختار عرضك وسيتواصل معك",
                },
                {
                  label: "عروض ملغية",
                  value: advisorStats?.rejected ?? 0,
                  icon: ThumbsDown,
                  color: "text-red-500",
                  bg: "bg-red-50",
                  border: "border-t-red-400",
                  sub: "أُلغيت بعد اختيار العميل لعرض آخر",
                },
              ].map(card => (
                <Card key={card.label} className={`border-t-4 ${card.border}`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </div>
                    <h3 className={`text-3xl font-black mb-1 ${card.color}`}>{card.value}</h3>
                    <p className="text-xs font-bold text-foreground mb-1">{card.label}</p>
                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Acceptance rate bar */}
          {advisorStats && advisorStats.totalSent > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">نسبة القبول</h3>
                <div className="space-y-4">
                  {[
                    { label: "موافقة العملاء", count: advisorStats.clientAccepted, color: "bg-emerald-500" },
                    { label: "مرفوضة", count: advisorStats.rejected, color: "bg-red-400" },
                    {
                      label: "قيد الانتظار (لم يختر العميل بعد)",
                      count: advisorStats.totalSent - advisorStats.clientAccepted - advisorStats.rejected,
                      color: "bg-muted-foreground/30",
                    },
                  ].map(row => {
                    const pct = Math.round((row.count / advisorStats.totalSent) * 100);
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-bold">{row.count} ({pct}٪)</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Analytics */}
          <div className="mt-8 mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> التحليلات المالية والأداء
            </h3>
          </div>

          {loadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}><CardContent className="p-5 h-24 animate-pulse bg-muted" /></Card>
              ))}
            </div>
          ) : analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* الإيراد المتوقع */}
              <Card className="border-t-4 border-t-emerald-500">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600 mb-1" dir="ltr">
                    {formatCurrency(analyticsData.expectedRevenue)}
                  </h3>
                  <p className="text-sm font-bold text-foreground">الإيراد المتوقع</p>
                  <p className="text-xs text-muted-foreground mt-1">مجموع الأرباح للصفقات المكتسبة</p>
                </CardContent>
              </Card>

              {/* قيمة الصفقات المكتسبة */}
              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-1" dir="ltr">
                    {formatCurrency(analyticsData.wonVolume)}
                  </h3>
                  <p className="text-sm font-bold text-foreground">قيمة الصفقات المكتسبة</p>
                  <p className="text-xs text-muted-foreground mt-1">إجمالي مبالغ التمويل للعملاء</p>
                </CardContent>
              </Card>

              {/* خط الأنابيب */}
              <Card className="border-t-4 border-t-amber-500">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-amber-600 mb-1" dir="ltr">
                    {formatCurrency(analyticsData.pipelineValue)}
                  </h3>
                  <p className="text-sm font-bold text-foreground">الفرص قيد الانتظار</p>
                  <p className="text-xs text-muted-foreground mt-1">عروض بانتظار قرار العميل</p>
                </CardContent>
              </Card>

              {/* معدل التحويل */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-violet-600 mb-1" dir="ltr">
                    {analyticsData.conversionRate.toLocaleString("ar-SA", { maximumFractionDigits: 1 })}٪
                  </h3>
                  <p className="text-sm font-bold text-foreground">معدل التحويل</p>
                  <p className="text-xs text-muted-foreground mt-1">من إجمالي {analyticsData.totalOffers} عرض مُقدّم</p>
                </CardContent>
              </Card>

              {/* متوسط زمن الاستجابة */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-sky-600 mb-1">
                    {(() => {
                      const hours = analyticsData.avgResponseTimeHours;
                      if (hours === null) return "لا توجد بيانات كافية";
                      if (hours < 1) return `${Math.round(hours * 60)} دقيقة`;
                      if (hours < 24) return `${hours.toLocaleString("ar-SA", { maximumFractionDigits: 1 })} ساعة`;
                      const d = Math.floor(hours / 24);
                      const h = hours % 24;
                      return h === 0 ? `${d} يوم` : `${d} يوم ${Math.round(h)} ساعة`;
                    })()}
                  </h3>
                  <p className="text-sm font-bold text-foreground">متوسط زمن الاستجابة</p>
                  <p className="text-xs text-muted-foreground mt-1">الوقت المستغرق لتقديم عرضك الأول</p>
                </CardContent>
              </Card>

              {/* الصفقات المتفق عليها والتقييم */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-rose-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-rose-600">
                      {analyticsData.agreedDeals}
                    </h3>
                    <span className="text-sm text-foreground font-bold">صفقة</span>
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">تم الاتفاق معهم</p>
                  {analyticsData.avgRating !== null ? (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold">{analyticsData.avgRating.toLocaleString("ar-SA", { maximumFractionDigits: 1 })}</span>
                      <span className="text-[10px] text-muted-foreground">({analyticsData.ratingsCount} تقييم)</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-2">لم يقيّمك أي عميل بعد</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── لوحة المتصدرين ── */}
      {performanceSubTab === "leaderboard" && (
        <div className="space-y-6">
          <Card className="border-amber-200 bg-gradient-to-l from-amber-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Trophy className="w-7 h-7 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-extrabold text-lg mb-1">لوحة المتصدرين — أفضل المستشارين تقييماً</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ترتيب يعتمد على متوسط تقييمات العملاء وعدد التقييمات.
                    من يحصل على <strong>10 تقييمات أو أكثر</strong> بمتوسط <strong>4 نجوم فأعلى</strong> ينال شارة
                    <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                      <Award className="w-3 h-3" /> مستشار موثوق
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingLeaderboard ? (
            <div className="grid gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : (leaderboard ?? []).length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">لا توجد تقييمات بعد</p>
                <p className="text-sm text-muted-foreground">ستظهر أوائل المستشارين هنا فور تلقي تقييمات من العملاء.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border/60">
                {(leaderboard ?? []).map((row, i) => {
                  const isMe = row.advisorId === user?.advisorId;
                  return (
                    <div key={row.advisorId} className={`flex items-center gap-4 p-4 sm:p-5 ${isMe ? "bg-primary/5" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                        i === 0 ? "bg-amber-400 text-white" :
                        i === 1 ? "bg-zinc-300 text-zinc-800" :
                        i === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold truncate">{row.name}</p>
                          {row.trustedAdvisor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
                              <Award className="w-3 h-3" /> مستشار موثوق
                            </span>
                          )}
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">أنت</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{row.company} • خبرة {row.monthsExperience} شهر</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="font-black text-base">{row.avgRating.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{row.ratingCount} تقييم</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="font-black text-base text-emerald-600">{row.agreedCount}</p>
                          <p className="text-[10px] text-muted-foreground">صفقة</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
        </div>
      )}

      {/* ─── Tab: Pricing ─── */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-l from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">كيف يعمل جدول الأسعار؟</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  حدّد أسعارك حسب القطاع + نوع التمويل + نطاق الراتب. عند ملء العميل لطلبه، يُعرض عليه تلقائياً <strong>أفضل سعر ربح</strong> من بين جميع المستشارين — مع اسم البنك فقط.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-primary" />
              قواعد الأسعار ({pricingRules?.length ?? 0})
            </h2>
            <Button onClick={() => { setShowRuleModal(true); ruleForm.reset(); }} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة قاعدة
            </Button>
          </div>

          {loadingRules ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> جاري التحميل...
            </div>
          ) : !(pricingRules ?? []).length ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="p-12 text-center">
                <TableProperties className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">لا توجد قواعد أسعار بعد</h3>
                <p className="text-muted-foreground text-sm mb-6">ابدأ ببناء جدول أسعارك التنافسية</p>
                <Button onClick={() => setShowRuleModal(true)} className="gap-2"><Plus className="w-4 h-4" />أضف القاعدة الأولى</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRules).map(([key, rules]) => {
                const [sectorVal, ftVal] = key.split("::");
                const sectorObj = SECTORS.find(s => s.value === sectorVal);
                const ftObj = FINANCING_TYPES.find(f => f.value === ftVal);
                return (
                  <Card key={key} className="overflow-hidden border-border/50">
                    <div className="px-5 py-3 flex items-center gap-3 bg-muted/40 border-b border-border">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SECTOR_BADGE[sectorVal] ?? "bg-muted text-muted-foreground"}`}>{sectorObj?.label}</span>
                      {ftObj && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${FINANCING_TYPE_BADGE[ftVal] ?? "bg-muted text-muted-foreground"}`}>{ftObj.icon} {ftObj.label}</span>}
                      <span className="text-xs text-muted-foreground">{rules.length} قاعدة</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/20 text-muted-foreground text-xs">
                            <th className="px-4 py-2.5 text-right">نطاق الراتب (ريال)</th>
                            <th className="px-4 py-2.5 text-right">نسبة الربح</th>
                            <th className="px-4 py-2.5 text-right">المدة</th>
                            <th className="px-4 py-2.5 text-right">المستشار</th>
                            <th className="px-4 py-2.5 text-right">آخر تعديل</th>
                            <th className="px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.sort((a, b) => a.salaryMin - b.salaryMin).map(rule => (
                            <tr key={rule.id} className={`border-t border-border hover:bg-muted/20 ${rule.isOwn ? "" : "opacity-80"}`}>
                              <td className="px-4 py-3 font-medium">{rule.salaryMin.toLocaleString("ar-SA")} – {rule.salaryMax.toLocaleString("ar-SA")}</td>
                              <td className="px-4 py-3"><span className="font-black text-primary text-base">{Number(rule.profitRate).toFixed(2)}٪</span></td>
                              <td className="px-4 py-3 text-muted-foreground">{rule.durationMonths ? `${rule.durationMonths} شهر` : "—"}</td>
                              <td className="px-4 py-3">
                                {rule.isOwn ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <UserCheck className="w-3 h-3" /> أنت
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">{rule.ownerAdvisorName ?? "—"}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {rule.lastModifiedByName ? (
                                  <span title={rule.lastModifiedAt ? new Date(rule.lastModifiedAt).toLocaleString("ar-SA") : ""}>
                                    {rule.lastModifiedByName}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      ruleForm.reset({
                                        sector: rule.sector as any,
                                        financingType: rule.financingType as any,
                                        bankName: rule.bankName,
                                        bands: [{
                                          salaryMin: rule.salaryMin,
                                          salaryMax: rule.salaryMax,
                                          profitRate: Number(rule.profitRate),
                                          durationMonths: rule.durationMonths ?? undefined,
                                        }],
                                      });
                                      setShowRuleModal(true);
                                    }}
                                    className="text-muted-foreground hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                                    title="نسخ كقاعدة جديدة"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  {rule.isOwn ? (
                                    <>
                                      <button onClick={() => setEditingRule(rule)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="تعديل">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => deleteRule(rule.id)} className="text-muted-foreground hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="حذف">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <span title="للقراءة فقط" className="inline-flex">
                                      <Lock className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Colleagues ─── */}
      {activeTab === "colleagues" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-l from-violet-50 to-violet-100 border border-violet-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1 text-violet-900">المستشارون في نفس البنك</h3>
                <p className="text-sm text-violet-700 leading-relaxed">
                  يمكنك مراقبة أداء زملائك في المنصة. في حال لاحظت أي سلوك مخالف للأنظمة أو المعايير المهنية، يمكنك الإبلاغ عنه وسيتم مراجعة البلاغ من قِبل الإدارة.
                </p>
              </div>
            </div>
          </div>

          {loadingColleagues ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> جاري التحميل...
            </div>
          ) : !(colleagues ?? []).length ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="p-12 text-center">
                <Users className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">لا يوجد زملاء بعد</h3>
                <p className="text-muted-foreground text-sm">لم يتم قبول مستشارين آخرين من نفس البنك في المنصة حتى الآن.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(colleagues ?? []).map(c => (
                <Card key={c.id} className={`border-border/50 ${c.isMe ? "ring-2 ring-primary ring-offset-1" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-black text-sm">{c.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.employeeId}</p>
                        </div>
                      </div>
                      {c.isMe && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">أنت</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">الخبرة</p>
                        <p className="font-bold">{c.monthsExperience >= 12 ? `${Math.floor(c.monthsExperience / 12)} سنة ${c.monthsExperience % 12 ? `و${c.monthsExperience % 12} شهر` : ""}` : `${c.monthsExperience} شهر`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">نسبة النجاح</p>
                        <p className="font-bold text-emerald-600">{c.successRate.toFixed(0)}٪</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">إجمالي العروض</p>
                        <p className="font-bold">{c.offersCount} عرض</p>
                      </div>
                    </div>
                    {!c.isMe && (
                      <button
                        onClick={() => { setReportingColleague(c); setReportReason(""); setReportStatus("idle"); }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
                      >
                        <Flag className="w-4 h-4" /> إبلاغ عن مخالفة
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Edit Rule Modal ─── */}
      {editingRule && (
        <Modal isOpen={!!editingRule} onClose={() => setEditingRule(null)} title="تعديل قاعدة السعر">
          <form className="space-y-4 mt-2" onSubmit={async e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            updateRule({ id: editingRule.id, data: {
              profitRate: Number(fd.get("profitRate")),
              salaryMin: Number(fd.get("salaryMin")),
              salaryMax: Number(fd.get("salaryMax")),
              durationMonths: Number(fd.get("durationMonths")) || undefined,
              notes: fd.get("notes") as string || undefined,
            }});
          }}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="الحد الأدنى للراتب" name="salaryMin" type="number" defaultValue={editingRule.salaryMin} />
              <Input label="الحد الأقصى للراتب" name="salaryMax" type="number" defaultValue={editingRule.salaryMax} />
              <Input label="نسبة الربح (%)" name="profitRate" type="number" step="0.01" defaultValue={Number(editingRule.profitRate)} />
              <Input label="المدة (شهر)" name="durationMonths" type="number" defaultValue={editingRule.durationMonths ?? ""} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground block">ملاحظات</label>
              <textarea name="notes" defaultValue={editingRule.notes ?? ""} rows={2} className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={updatingRule} className="flex-1">
                {updatingRule ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التغييرات"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingRule(null)}>إلغاء</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Report Colleague Modal ─── */}
      {reportingColleague && (
        <Modal isOpen={!!reportingColleague} onClose={() => { setReportingColleague(null); setReportStatus("idle"); }} title="الإبلاغ عن مخالفة">
          {reportStatus === "done" ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">تم إرسال البلاغ</h3>
              <p className="text-muted-foreground text-sm mb-6">سيراجع فريق الإدارة بلاغك وسيتخذ الإجراء المناسب.</p>
              <Button onClick={() => { setReportingColleague(null); setReportStatus("idle"); }}>حسناً</Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-xl p-4 text-sm">
                <p className="text-muted-foreground mb-1">الإبلاغ عن</p>
                <p className="font-bold">{reportingColleague.name}</p>
                <p className="text-xs text-muted-foreground">{reportingColleague.employeeId} · {reportingColleague.company}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground block">سبب البلاغ *</label>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  rows={4}
                  placeholder="اذكر بالتفصيل المخالفة التي لاحظتها..."
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-muted-foreground">الحد الأدنى ١٠ أحرف. {reportReason.length} حرف</p>
              </div>
              {reportStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة مرة أخرى.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  disabled={reportReason.trim().length < 10 || reportStatus === "submitting"}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    setReportStatus("submitting");
                    try {
                      await customFetch(`/api/advisors/${reportingColleague.id}/report`, {
                        method: "POST",
                        body: JSON.stringify({ reason: reportReason }),
                      });
                      setReportStatus("done");
                    } catch {
                      setReportStatus("error");
                    }
                  }}
                >
                  {reportStatus === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flag className="w-4 h-4" /> إرسال البلاغ</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setReportingColleague(null)}>إلغاء</Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ─── Offer Modal ─── */}
      <Modal isOpen={!!selectedRequest} onClose={() => { setSelectedRequest(null); offerForm.reset(); setCalcEnabled(false); setSelectedFeatures([]); setCalcDeductionRate("33.33"); setCalcMonths(""); setCalcProfitRate(""); }} title={`تقديم عرض — ${selectedRequest ? formatRequestRef({ id: selectedRequest.id, financingPurpose: selectedRequest.financingPurpose, financingType: selectedRequest.financingType, sector: selectedRequest.sector }) : ""}`}>
        {selectedRequest && (() => {
          const reqAny = selectedRequest as any;
          const reqFt = reqAny.financingType === "debt_transfer" ? "debt_purchase" : reqAny.financingType;
          const matchingRule = (pricingRules ?? []).find(r =>
            r.isOwn &&
            r.sector === reqAny.sector &&
            r.financingType === reqFt &&
            selectedRequest.salary >= r.salaryMin &&
            selectedRequest.salary <= r.salaryMax
          );
          // Effective inputs (manual overrides take precedence, else fall back to matching rule defaults)
          const effectiveProfitRate = Number(calcProfitRate) > 0
            ? Number(calcProfitRate)
            : matchingRule ? Number(matchingRule.profitRate) : 0;
          const effectiveMonths = Number(calcMonths) > 0
            ? Number(calcMonths)
            : (matchingRule?.durationMonths ?? selectedRequest.remainingMonths ?? 60);
          const deductionPct = Number(calcDeductionRate);
          const deductionFraction = deductionPct > 0 ? deductionPct / 100 : 0;
          const salary = selectedRequest.salary || 0;
          // Formula:
          //   totalPayment = salary * deductionRate * months
          //   totalProfitMargin = 1 + (profitRate/100) * (months/12)
          //   principalAmount = totalPayment / totalProfitMargin
          const totalPayment = +(salary * deductionFraction * effectiveMonths).toFixed(2);
          const profitMargin = 1 + (effectiveProfitRate / 100) * (effectiveMonths / 12);
          const principalAmount = profitMargin > 0 ? +(totalPayment / profitMargin).toFixed(2) : 0;
          const profitAmountCalc = +(totalPayment - principalAmount).toFixed(2);
          const monthlyCalc = effectiveMonths > 0 ? +(totalPayment / effectiveMonths).toFixed(2) : 0;
          const canApply = deductionFraction > 0 && effectiveProfitRate > 0 && effectiveMonths > 0 && principalAmount > 0;
          const applySuggested = () => {
            if (!canApply) return;
            offerForm.setValue("profitRate", effectiveProfitRate);
            offerForm.setValue("principal", principalAmount);
            offerForm.setValue("profitAmount", profitAmountCalc);
            offerForm.setValue("durationMonths", effectiveMonths);
          };
          return (
          <form onSubmit={offerForm.handleSubmit(onSubmitOffer)} className="space-y-5 mt-2">
            {/* Request snapshot */}
            <div className="grid grid-cols-2 gap-2 bg-muted/50 p-4 rounded-xl text-sm">
              {[
                { label: "جهة العمل", value: selectedRequest.employer },
                { label: "الراتب", value: formatCurrency(selectedRequest.salary) },
                { label: "المديونية", value: formatCurrency(selectedRequest.currentDebt), cls: "text-primary font-bold" },
                { label: "المتبقي", value: `${selectedRequest.remainingMonths} شهر` },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className={`font-bold ${cls ?? ""}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Calculator toggle */}
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">حاسبة مساعدة (اختيارية)</span>
                </div>
                <button type="button" onClick={() => setCalcEnabled(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${calcEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
                  <span className={`absolute top-0.5 ${calcEnabled ? "right-0.5" : "right-5"} w-5 h-5 rounded-full bg-white shadow transition-all`} />
                </button>
              </div>
              {calcEnabled && (
                <div className="mt-3 pt-3 border-t border-primary/20 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-2"><p className="text-muted-foreground">راتب العميل الصافي</p><p className="font-black text-primary">{formatCurrency(selectedRequest.salary)}</p></div>
                    <div className="bg-white rounded-lg p-2"><p className="text-muted-foreground">المديونية الحالية</p><p className="font-black text-primary">{formatCurrency(selectedRequest.currentDebt)}</p></div>
                  </div>

                  {matchingRule ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-800 text-[11px]">
                      ✓ قاعدة سعر مطابقة في جدولك: نسبة الربح <strong>{Number(matchingRule.profitRate).toFixed(2)}٪</strong>
                      {matchingRule.durationMonths && <> · المدة <strong>{matchingRule.durationMonths} شهر</strong></>}
                    </div>
                  ) : (
                    <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px]">
                      لا توجد قاعدة سعر مطابقة — أدخل نسبة الربح والمدة يدوياً.
                    </p>
                  )}

                  {/* Manual inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-foreground block mb-1">نسبة الاستقطاع (%)</label>
                      <input type="number" step="0.01" inputMode="decimal" value={calcDeductionRate}
                        onChange={e => setCalcDeductionRate(e.target.value)}
                        placeholder="33.33"
                        className="w-full rounded-lg border-2 border-border bg-white px-2 py-1.5 text-xs font-bold text-center focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-foreground block mb-1">نسبة الربح السنوية (%)</label>
                      <input type="number" step="0.01" inputMode="decimal" value={calcProfitRate}
                        onChange={e => setCalcProfitRate(e.target.value)}
                        placeholder={matchingRule ? Number(matchingRule.profitRate).toFixed(2) : "2.59"}
                        className="w-full rounded-lg border-2 border-border bg-white px-2 py-1.5 text-xs font-bold text-center focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-foreground block mb-1">المدة (شهر)</label>
                      <input type="number" inputMode="numeric" value={calcMonths}
                        onChange={e => setCalcMonths(e.target.value)}
                        placeholder={String(matchingRule?.durationMonths ?? selectedRequest.remainingMonths ?? 60)}
                        className="w-full rounded-lg border-2 border-border bg-white px-2 py-1.5 text-xs font-bold text-center focus:outline-none focus:border-primary" />
                    </div>
                  </div>

                  {/* Live results */}
                  <div className="bg-white rounded-xl border-2 border-primary/20 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground">القسط الشهري المقترح</p>
                        <p className="font-black text-foreground text-sm">{canApply ? formatCurrency(monthlyCalc) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">إجمالي السداد</p>
                        <p className="font-black text-foreground text-sm">{canApply ? formatCurrency(totalPayment) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">مبلغ الربح</p>
                        <p className="font-black text-amber-700 text-sm">{canApply ? formatCurrency(profitAmountCalc) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">مبلغ التمويل الصافي</p>
                        <p className="font-black text-emerald-700 text-base">{canApply ? formatCurrency(principalAmount) : "—"}</p>
                      </div>
                    </div>
                    <button type="button" onClick={applySuggested} disabled={!canApply}
                      className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      تطبيق على العرض
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profit Rate */}
            <Input label="نسبة الربح السنوية (%)" type="number" step="0.01" placeholder="2.5" {...offerForm.register("profitRate")} error={offerForm.formState.errors.profitRate?.message} />

            {/* Principal + Profit → Total auto */}
            <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
              <p className="text-sm font-bold text-foreground">تفاصيل التمويل</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="أصل التمويل (ريال)" type="number" step="0.01" inputMode="decimal" placeholder="150000" {...offerForm.register("principal")} error={offerForm.formState.errors.principal?.message} />
                <Input label="مبلغ الربح (ريال)" type="number" step="0.01" inputMode="decimal" placeholder="18000" {...offerForm.register("profitAmount")} error={offerForm.formState.errors.profitAmount?.message} />
              </div>

              {/* Auto-calculated summary */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="bg-white rounded-xl p-3 text-center border border-border">
                  <p className="text-xs text-muted-foreground mb-1">إجمالي التمويل</p>
                  <p className={`font-black text-sm ${totalAmount > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {totalAmount > 0 ? formatCurrency(totalAmount) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">أصل + ربح</p>
                </div>
                <div className="col-span-1">
                  <Input label="مدة السداد (أشهر)" type="number" placeholder="60" {...offerForm.register("durationMonths")} error={offerForm.formState.errors.durationMonths?.message} />
                </div>
                <div className="bg-primary/10 rounded-xl p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">القسط الشهري</p>
                  <p className={`font-black text-sm ${monthlyInstallment > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {monthlyInstallment > 0 ? formatCurrency(monthlyInstallment) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">إجمالي ÷ مدة</p>
                </div>
              </div>
            </div>

            {/* Features checklist */}
            <div className="space-y-2">
              <label className="text-sm font-bold">مميزات إضافية ترغب بإرفاقها مع العرض (اختياري)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OFFER_FEATURES.map(f => {
                  const checked = selectedFeatures.includes(f.value);
                  return (
                    <button key={f.value} type="button" onClick={() => toggleFeature(f.value)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs text-right transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-primary border-primary text-white" : "border-border"}`}>
                        {checked && <CheckCircle2 className="w-3 h-3" />}
                      </span>
                      <span className="text-base">{f.icon}</span>
                      <span className="font-medium flex-1">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">ملاحظات (اختياري)</label>
              <textarea {...offerForm.register("notes")}
                className="w-full h-16 rounded-xl border-2 border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                placeholder="شروط إضافية..." />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => { setSelectedRequest(null); offerForm.reset(); setCalcEnabled(false); setSelectedFeatures([]); }} className="flex-1">إلغاء</Button>
              <Button type="submit" isLoading={submittingOffer} className="flex-1 gap-2">
                اعتماد العرض <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </form>
          );
        })()}
      </Modal>

      {/* ─── Bank Change Modal ─── */}
      <Modal isOpen={showBankChange} onClose={() => { setShowBankChange(false); setNewBankName(""); }} title="طلب تغيير البنك">
        <div className="space-y-4 mt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
            بعد إرسال الطلب، ستراجعه الإدارة وتتأكد من صحة انتقالك للبنك الجديد قبل اعتماده. لن يتغيّر بنكك المعروض على العملاء حتى تتم الموافقة.
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">البنك الجديد</label>
            <select
              value={newBankName}
              onChange={e => setNewBankName(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">— اختر البنك —</option>
              {SAUDI_BANKS.filter(b => b !== meProfile?.company).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowBankChange(false); setNewBankName(""); }} className="flex-1">إلغاء</Button>
            <Button type="button" onClick={() => requestBankChange(newBankName)} disabled={!newBankName} isLoading={requestingBankChange} className="flex-1">
              إرسال الطلب للإدارة
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Add Rule Modal ─── */}
      <Modal isOpen={showRuleModal} onClose={() => { setShowRuleModal(false); ruleForm.reset({ bands: [{ salaryMin: 0, salaryMax: 0, profitRate: 0 }] }); }} title="إضافة قاعدة سعر">
        <form onSubmit={ruleForm.handleSubmit(onSubmitRules)} className="space-y-5 mt-2">

          {/* Financing Type */}
          <div>
            <label className="text-sm font-bold block mb-2">نوع التمويل</label>
            <div className="grid grid-cols-4 gap-2">
              {FINANCING_TYPES.filter(ft => ft.value !== "debt_transfer").map(ft => (
                <button key={ft.value} type="button"
                  onClick={() => ruleForm.setValue("financingType", ft.value as any)}
                  className={`rounded-xl border-2 p-2 text-center transition-all ${watchRuleFinancingType === ft.value ? `border-primary bg-primary/10 text-primary` : "border-border hover:border-primary/40"}`}
                >
                  <div className="text-lg">{ft.icon}</div>
                  <div className="text-xs font-bold mt-1 leading-tight">{ft.label.replace("تمويل ", "")}</div>
                </button>
              ))}
            </div>
            {ruleForm.formState.errors.financingType && <p className="text-xs text-red-500 mt-1">{ruleForm.formState.errors.financingType.message}</p>}
          </div>

          {/* Sector */}
          <div>
            <label className="text-sm font-bold block mb-2">القطاع الوظيفي</label>
            <div className="grid grid-cols-4 gap-2">
              {SECTORS.map(s => (
                <button key={s.value} type="button"
                  onClick={() => ruleForm.setValue("sector", s.value as any)}
                  className={`rounded-xl border-2 p-2 text-xs font-bold transition-all ${watchRuleSector === s.value ? `${s.color} border-current` : "border-border hover:border-primary/40"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {ruleForm.formState.errors.sector && <p className="text-xs text-red-500 mt-1">{ruleForm.formState.errors.sector.message}</p>}
          </div>

          {/* Dynamic Salary Bands */}
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <p className="text-xs font-bold text-muted-foreground">الراتب الأدنى (ريال)</p>
              <p className="text-xs font-bold text-muted-foreground">الراتب الأعلى (ريال)</p>
              <p className="text-xs font-bold text-muted-foreground">نسبة الربح (%)</p>
              <p className="text-xs font-bold text-muted-foreground">المدة (أشهر)</p>
              <span />
            </div>

            {bandFields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-start">
                <Input
                  type="number" placeholder="5000"
                  {...ruleForm.register(`bands.${idx}.salaryMin`)}
                  error={ruleForm.formState.errors.bands?.[idx]?.salaryMin?.message}
                />
                <Input
                  type="number" placeholder="10000"
                  {...ruleForm.register(`bands.${idx}.salaryMax`)}
                  error={ruleForm.formState.errors.bands?.[idx]?.salaryMax?.message}
                />
                <Input
                  type="number" step="0.01" placeholder="2.5"
                  {...ruleForm.register(`bands.${idx}.profitRate`)}
                  error={ruleForm.formState.errors.bands?.[idx]?.profitRate?.message}
                />
                <Input
                  type="number" placeholder="60"
                  {...ruleForm.register(`bands.${idx}.durationMonths`)}
                  error={ruleForm.formState.errors.bands?.[idx]?.durationMonths?.message}
                />
                <button
                  type="button"
                  onClick={() => removeBand(idx)}
                  disabled={bandFields.length === 1}
                  className="mt-1 p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const lastMax = Number(ruleForm.getValues(`bands.${bandFields.length - 1}.salaryMax`)) || 0;
                appendBand({ salaryMin: lastMax + 1, salaryMax: 0, profitRate: 0, durationMonths: undefined });
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-2.5 text-sm font-bold text-primary hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="w-4 h-4" /> إضافة نطاق راتب جديد
            </button>
          </div>

          {/* Bank — auto-filled from advisor profile (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-bold">البنك المُموِّل</label>
            <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3">
              <Building className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold text-foreground flex-1">{user?.company ?? "—"}</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> مُحدَّد تلقائياً
              </span>
            </div>
            <input type="hidden" {...ruleForm.register("bankName")} />
          </div>

          {/* Live Preview */}
          {(() => {
            const prev = getRulePreview();
            if (!prev) return null;
            return (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm space-y-2">
                <p className="font-bold text-primary">معاينة القواعد ({prev.validBands.length}):</p>
                {prev.validBands.map((b, i) => (
                  <p key={i} className="text-muted-foreground flex items-center gap-1">
                    <span className="text-xs bg-primary/10 text-primary px-1.5 rounded font-bold">{i + 1}</span>
                    {prev.ftLabel} · {prev.sectorLabel} · {Number(b.salaryMin).toLocaleString("ar-SA")}–{Number(b.salaryMax).toLocaleString("ar-SA")} ريال →{" "}
                    <strong className="text-primary">{Number(b.profitRate).toFixed(2)}٪</strong>
                    {b.durationMonths ? <span className="text-xs">({b.durationMonths} شهر)</span> : null}
                  </p>
                ))}
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">{prev.bankName}</p>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { setShowRuleModal(false); ruleForm.reset({ bands: [{ salaryMin: 0, salaryMax: 0, profitRate: 0 }] }); }} className="flex-1">إلغاء</Button>
            <Button type="submit" isLoading={creatingRule} className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              حفظ {bandFields.length > 1 ? `${bandFields.length} قواعد` : "القاعدة"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
