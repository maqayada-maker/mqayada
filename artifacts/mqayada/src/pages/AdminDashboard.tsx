import { useGetStats, useListRequests } from "@workspace/api-client-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { SAUDI_BANKS } from "@/lib/constants";
import { useState } from "react";
import {
  Activity, CheckCircle2, FileText, LayoutDashboard, Users,
  Clock, XCircle, BarChart3, TrendingUp, Building2, Percent,
  TableProperties, Pencil, Trash2, Check, X, Loader2, Flag, ShieldAlert,
  MessageSquarePlus, AlertTriangle, Plus, Megaphone, Award, UserCheck,
  ShieldCheck, Star, Power, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";

const VALID_SECTORS = ["government", "semi_government", "private", "retired"] as const;
const VALID_FINANCING_TYPES = ["personal", "real_estate", "car", "debt_purchase"] as const;
const SECTOR_LABELS_FORM: Record<string, string> = { government: "حكومي", semi_government: "شبه حكومي", private: "خاص", retired: "متقاعد" };
const FINANCING_TYPE_LABELS_FORM: Record<string, string> = { personal: "شخصي", real_estate: "عقاري", car: "سيارة", debt_purchase: "شراء دين" };

interface NewRuleForm {
  bankName: string;
  sector: string;
  financingType: string;
  salaryMin: string;
  salaryMax: string;
  profitRate: string;
  durationMonths: string;
  notes: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("mqayada_token") ?? "";

interface PendingAdvisor {
  id: number;
  name: string;
  company: string;
  email: string | null;
  phone: string;
  employeeId: string;
  appointmentDate: string | null;
  monthsExperience: number;
  createdAt: string;
}

interface AdvisorReport {
  id: number;
  reporterAdvisorId: number;
  reporterName: string;
  reportedAdvisorId: number;
  reportedName: string;
  bankName: string;
  reason: string;
  status: string;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface ClientReport {
  id: number;
  clientUserId: number | null;
  clientName: string;
  requestId: number | null;
  subject: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface PendingChosenOffer {
  offerId: number;
  requestId: number;
  advisorId: number;
  profitRate: number;
  monthlyInstallment: number;
  totalAmount: number;
  durationMonths: number;
  notes: string | null;
  offerStatus: string;
  advisorName: string;
  advisorCompany: string;
  clientName: string;
  clientPhone: string;
  employer: string;
  sector: string;
  currentDebt: number;
}

function usePendingAdvisors() {
  return useQuery<PendingAdvisor[]>({
    queryKey: ["/api/advisors/pending"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/advisors/pending`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function usePendingChosenOffers() {
  return useQuery<PendingChosenOffer[]>({
    queryKey: ["/api/requests/pending-chosen"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/requests/pending-chosen`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useApproveAdvisor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/advisors/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/advisors/pending"] }),
  });
}

function useRejectAdvisor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/advisors/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/advisors/pending"] }),
  });
}

function useApproveChosenOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: number) => {
      const res = await fetch(`${BASE}/api/offers/${offerId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/requests/pending-chosen"] });
      qc.invalidateQueries({ queryKey: ["/api/requests"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

function useRejectChosenOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: number; reason: string }) => {
      const res = await fetch(`${BASE}/api/offers/${offerId}/reject-admin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/requests/pending-chosen"] });
      qc.invalidateQueries({ queryKey: ["/api/requests"] });
    },
  });
}

function useBulkApproveOffers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/offers/bulk-approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/requests/pending-chosen"] });
      qc.invalidateQueries({ queryKey: ["/api/requests"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

const SECTOR_LABELS: Record<string, string> = {
  government: "حكومي",
  semi_government: "شبه حكومي",
  private: "خاص",
  retired: "متقاعد",
};

const TABS = [
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  { id: "pending-advisors", label: "طلبات انضمام", icon: Users, badge: true },
  { id: "bank-changes", label: "طلبات تغيير البنك", icon: Building2, badge: true },
  { id: "client-reports", label: "شكاوى العملاء", icon: MessageSquarePlus, badge: true },
  { id: "reports", label: "بلاغات المستشارين", icon: Flag, badge: true },
  { id: "requests", label: "سجل الطلبات", icon: FileText },
  { id: "pricing", label: "جدول الأسعار", icon: TableProperties },
  { id: "best-price", label: "إعلانات أفضل سعر", icon: Megaphone },
  { id: "sponsors", label: "الرعاة الرسميون", icon: Award },
  { id: "advisors-registry", label: "سجل المستشارين", icon: UserCheck },
];

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
}

const SECTOR_LABELS_PRICING: Record<string, string> = {
  government: "حكومي",
  semi_government: "شبه حكومي",
  private: "خاص",
  retired: "متقاعد",
};

const FINANCING_TYPE_LABELS: Record<string, string> = {
  personal: "شخصي",
  real_estate: "عقاري",
  car: "سيارة",
  debt_purchase: "شراء دين",
};

function usePricingRules() {
  return useQuery<PricingRule[]>({
    queryKey: ["/api/pricing/rules/all"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pricing/rules`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useEditPricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profitRate, durationMonths }: { id: number; profitRate: number; durationMonths?: number | null }) => {
      const res = await fetch(`${BASE}/api/pricing/rules/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profitRate, durationMonths }),
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pricing/rules/all"] }),
  });
}

function useDeletePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/pricing/rules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pricing/rules/all"] }),
  });
}

function useCreatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bankName: string; sector: string; financingType: string;
      salaryMin: number; salaryMax: number; profitRate: number;
      durationMonths?: number | null; notes?: string;
    }) => {
      const res = await fetch(`${BASE}/api/pricing/rules`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      return body;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/pricing/rules/all"] }),
  });
}

function useClientReports() {
  return useQuery<ClientReport[]>({
    queryKey: ["/api/reports/client"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/reports/client`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useHandleClientReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: number; status: "resolved" | "dismissed"; adminNote?: string }) => {
      const res = await fetch(`${BASE}/api/reports/client/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/reports/client"] }),
  });
}

function useAdvisorReports() {
  return useQuery<AdvisorReport[]>({
    queryKey: ["/api/advisors/reports"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/advisors/reports`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useHandleReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, adminNote }: { id: number; action: "dismiss" | "remove"; adminNote?: string }) => {
      const res = await fetch(`${BASE}/api/advisors/reports/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote }),
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/advisors/reports"] });
      qc.invalidateQueries({ queryKey: ["/api/advisors/pending"] });
    },
  });
}

/* ════════════════ BEST-PRICE ADS ════════════════ */
interface BestPriceAd {
  id: number;
  product: string;
  bankName: string;
  profitRate: number;
  sponsorshipAmount: number;
  active: boolean;
  sortOrder: number;
}

function useBestPriceAds() {
  return useQuery<BestPriceAd[]>({
    queryKey: ["/api/admin/best-price-ads"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/best-price-ads`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useSaveBestPriceAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/admin/best-price-ads${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      return body;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/best-price-ads"] }),
  });
}

function useDeleteBestPriceAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/admin/best-price-ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/best-price-ads"] }),
  });
}

/* ════════════════ OFFICIAL SPONSORS ════════════════ */
interface Sponsor {
  id: number;
  name: string;
  logoUrl: string | null;
  website: string | null;
  active: boolean;
  sortOrder: number;
}

function useSponsors() {
  return useQuery<Sponsor[]>({
    queryKey: ["/api/admin/sponsors"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/sponsors`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useSaveSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/admin/sponsors${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      return body;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/sponsors"] }),
  });
}

function useDeleteSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/admin/sponsors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/sponsors"] }),
  });
}

/* ════════════════ ADVISOR REGISTRY ════════════════ */
interface RegistryAdvisor {
  id: number;
  name: string;
  company: string;
  email: string | null;
  phone: string;
  employeeId: string;
  isSupervisor: boolean;
  supervisorAdvisorId: number | null;
  supervisorName: string | null;
  vacationDelegateAdvisorId: number | null;
  successRate: number;
  rating: number;
  offersCount: number;
  requestsWorked: number;
  activityRank: number | null;
  monthsExperience: number;
  availability: boolean;
  createdAt: string;
}

interface SupervisorRow {
  id: number;
  name: string;
  company: string;
  email: string | null;
  phone: string;
  employeeId: string;
}

function useAllAdvisors() {
  return useQuery<RegistryAdvisor[]>({
    queryKey: ["/api/advisors"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/advisors`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useSupervisors() {
  return useQuery<SupervisorRow[]>({
    queryKey: ["/api/admin/supervisors"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/supervisors`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
}

function useAssignSupervisor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (advisorId: number) => {
      const res = await fetch(`${BASE}/api/admin/supervisors`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      return body;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/advisors"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/supervisors"] });
    },
  });
}

function useRevokeSupervisor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (advisorId: number) => {
      const res = await fetch(`${BASE}/api/admin/supervisors/${advisorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/advisors"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/supervisors"] });
    },
  });
}

function useRevokeMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (advisorId: number) => {
      const res = await fetch(`${BASE}/api/advisors/${advisorId}/revoke-membership`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/advisors"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/supervisors"] });
    },
  });
}

interface AdForm { product: string; bankName: string; profitRate: string; sponsorshipAmount: string; active: boolean; sortOrder: string; }
interface SponsorForm { name: string; logoUrl: string; website: string; active: boolean; sortOrder: string; }
const EMPTY_AD_FORM: AdForm = { product: "", bankName: SAUDI_BANKS[0], profitRate: "", sponsorshipAmount: "0", active: true, sortOrder: "0" };
const EMPTY_SPONSOR_FORM: SponsorForm = { name: "", logoUrl: "", website: "", active: true, sortOrder: "0" };

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("stats");

  const { data: stats } = useGetStats();
  const { data: requests } = useListRequests();
  const { data: pendingAdvisors, isLoading: loadingAdvisors } = usePendingAdvisors();

  interface BankChangeRow {
    id: number; name: string; company: string; pendingCompany: string;
    bankChangeRequestedAt: string; phone: string; employeeId: string;
  }
  const { data: bankChangeRequests, isLoading: loadingBankChanges } = useQuery<BankChangeRow[]>({
    queryKey: ["/api/advisors/bank-change-requests"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/advisors/bank-change-requests`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });
  const { mutate: approveBankChange, isPending: approvingBankChange } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/advisors/${id}/bank-change/approve`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/advisors/bank-change-requests"] }),
  });
  const { mutate: rejectBankChange, isPending: rejectingBankChange } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/advisors/${id}/bank-change/reject`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/advisors/bank-change-requests"] }),
  });
  const { data: pendingOffers, isLoading: loadingOffers } = usePendingChosenOffers();
  const { data: pricingRules, isLoading: loadingPricing } = usePricingRules();
  const { data: advisorReports, isLoading: loadingReports } = useAdvisorReports();
  const { data: clientReports, isLoading: loadingClientReports } = useClientReports();
  const { mutate: handleReport, isPending: handlingReport } = useHandleReport();
  const { mutate: handleClientReport, isPending: handlingClientReport } = useHandleClientReport();
  const { mutate: editRule, isPending: editingRule } = useEditPricingRule();
  const { mutate: deleteRule, isPending: deletingRule } = useDeletePricingRule();
  const { mutate: createRule, isPending: creatingRule } = useCreatePricingRule();

  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ profitRate: string; durationMonths: string }>({ profitRate: "", durationMonths: "" });
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState<NewRuleForm>({ bankName: "", sector: "government", financingType: "personal", salaryMin: "", salaryMax: "", profitRate: "", durationMonths: "", notes: "" });
  const [newRuleError, setNewRuleError] = useState<string | null>(null);
  // Pricing bank selector
  const [selectedPricingBank, setSelectedPricingBank] = useState<string>("");
  const [customBankName, setCustomBankName] = useState("");
  const [showAddRow, setShowAddRow] = useState(false);
  const [addRowForm, setAddRowForm] = useState<NewRuleForm>({ bankName: "", sector: "government", financingType: "personal", salaryMin: "", salaryMax: "", profitRate: "", durationMonths: "", notes: "" });
  const [addRowError, setAddRowError] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{ offerId: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { mutate: approveAdvisor, isPending: approvingAdvisor } = useApproveAdvisor();
  const { mutate: rejectAdvisor, isPending: rejectingAdvisor } = useRejectAdvisor();
  const { mutate: approveOffer, isPending: approvingOffer } = useApproveChosenOffer();
  const { mutate: rejectOffer, isPending: rejectingOffer } = useRejectChosenOffer();
  const { mutate: bulkApprove, isPending: bulkApproving } = useBulkApproveOffers();

  // ── Best-price ads + sponsors (homepage) ──
  const { data: bestPriceAds, isLoading: loadingAds } = useBestPriceAds();
  const { data: sponsors, isLoading: loadingSponsors } = useSponsors();
  const { mutate: saveAd, isPending: savingAd } = useSaveBestPriceAd();
  const { mutate: deleteAd, isPending: deletingAd } = useDeleteBestPriceAd();
  const { mutate: saveSponsor, isPending: savingSponsor } = useSaveSponsor();
  const { mutate: deleteSponsor, isPending: deletingSponsor } = useDeleteSponsor();

  const [adModal, setAdModal] = useState<{ id?: number } | null>(null);
  const [adForm, setAdForm] = useState<AdForm>(EMPTY_AD_FORM);
  const [adError, setAdError] = useState<string | null>(null);
  const [sponsorModal, setSponsorModal] = useState<{ id?: number } | null>(null);
  const [sponsorForm, setSponsorForm] = useState<SponsorForm>(EMPTY_SPONSOR_FORM);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  // ── Advisor registry ──
  const { data: allAdvisors, isLoading: loadingAllAdvisors } = useAllAdvisors();
  const { data: supervisors } = useSupervisors();
  const { mutate: assignSupervisor, isPending: assigningSupervisor } = useAssignSupervisor();
  const { mutate: revokeSupervisor, isPending: revokingSupervisor } = useRevokeSupervisor();
  const { mutate: revokeMembership, isPending: revokingMembership } = useRevokeMembership();
  const [registryBankFilter, setRegistryBankFilter] = useState<string>("");

  const openAdModal = (ad?: BestPriceAd) => {
    setAdError(null);
    if (ad) {
      setAdForm({
        product: ad.product, bankName: ad.bankName,
        profitRate: String(ad.profitRate), sponsorshipAmount: String(ad.sponsorshipAmount),
        active: ad.active, sortOrder: String(ad.sortOrder),
      });
      setAdModal({ id: ad.id });
    } else {
      setAdForm(EMPTY_AD_FORM);
      setAdModal({});
    }
  };

  const submitAd = () => {
    setAdError(null);
    if (!adForm.product.trim()) return setAdError("اسم المنتج مطلوب");
    if (!adForm.bankName.trim()) return setAdError("البنك مطلوب");
    const rate = Number(adForm.profitRate);
    if (adForm.profitRate === "" || isNaN(rate)) return setAdError("نسبة الربح مطلوبة");
    saveAd(
      {
        id: adModal?.id,
        data: {
          product: adForm.product.trim(),
          bankName: adForm.bankName.trim(),
          profitRate: rate,
          sponsorshipAmount: Number(adForm.sponsorshipAmount) || 0,
          active: adForm.active,
          sortOrder: Number(adForm.sortOrder) || 0,
        },
      },
      { onSuccess: () => setAdModal(null), onError: (e: any) => setAdError(e.message ?? "حدث خطأ") }
    );
  };

  const openSponsorModal = (sp?: Sponsor) => {
    setSponsorError(null);
    if (sp) {
      setSponsorForm({
        name: sp.name, logoUrl: sp.logoUrl ?? "", website: sp.website ?? "",
        active: sp.active, sortOrder: String(sp.sortOrder),
      });
      setSponsorModal({ id: sp.id });
    } else {
      setSponsorForm(EMPTY_SPONSOR_FORM);
      setSponsorModal({});
    }
  };

  const submitSponsor = () => {
    setSponsorError(null);
    if (sponsorForm.name.trim().length < 2) return setSponsorError("اسم الراعي مطلوب");
    saveSponsor(
      {
        id: sponsorModal?.id,
        data: {
          name: sponsorForm.name.trim(),
          logoUrl: sponsorForm.logoUrl.trim() || null,
          website: sponsorForm.website.trim() || null,
          active: sponsorForm.active,
          sortOrder: Number(sponsorForm.sortOrder) || 0,
        },
      },
      { onSuccess: () => setSponsorModal(null), onError: (e: any) => setSponsorError(e.message ?? "حدث خطأ") }
    );
  };

  const advisorNameById = new Map((allAdvisors ?? []).map(a => [a.id, a.name]));

  const extStats = stats as any;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">قيد المراجعة</Badge>;
      case 'active': return <Badge variant="secondary">يستقبل عروض</Badge>;
      case 'awaiting_admin': return <Badge variant="warning">بانتظار اعتماد الإدارة</Badge>;
      case 'approved': return <Badge variant="success">معتمد</Badge>;
      case 'closed': return <Badge variant="outline">مغلق</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-9 h-9 text-primary" />
        <h1 className="text-3xl font-extrabold text-foreground">لوحة الإدارة</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
        {TABS.map(tab => {
          const pendingAdvisorReports = (advisorReports ?? []).filter(r => r.status === "pending").length;
          const pendingClientReports = (clientReports ?? []).filter(r => r.status === "pending").length;
          const badgeCount =
            tab.id === "pending-offers" ? (pendingOffers?.length ?? 0) :
            tab.id === "pending-advisors" ? (pendingAdvisors?.length ?? 0) :
            tab.id === "bank-changes" ? (bankChangeRequests?.length ?? 0) :
            tab.id === "reports" ? pendingAdvisorReports :
            tab.id === "client-reports" ? pendingClientReports : 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && badgeCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-black">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── STATS TAB ── */}
      {activeTab === "stats" && (
        <div className="space-y-8">
          {/* Main KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الطلبات", value: extStats?.totalRequests ?? 0, icon: FileText, color: "border-t-primary", sub: `${extStats?.awaitingAdmin ?? 0} بانتظار الاعتماد` },
              { label: "العملاء المسجلون", value: extStats?.totalClients ?? 0, icon: Users, color: "border-t-blue-500", sub: `${extStats?.totalRequests ?? 0} طلب مقدَّم` },
              { label: "الصفقات المعتمدة", value: extStats?.approvedDeals ?? 0, icon: CheckCircle2, color: "border-t-emerald-500", sub: `من أصل ${extStats?.totalOffers ?? 0} عرض` },
              { label: "المستشارون الفعّالون", value: extStats?.activeAdvisors ?? 0, icon: Activity, color: "border-t-violet-500", sub: `من إجمالي ${extStats?.totalAdvisors ?? 0}` },
            ].map(card => (
              <Card key={card.label} className={`border-t-4 ${card.color}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">{card.label}</p>
                      <h3 className="text-3xl font-black text-foreground">{card.value}</h3>
                    </div>
                    <card.icon className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none">
              <CardContent className="p-6">
                <TrendingUp className="w-6 h-6 mb-3 opacity-70" />
                <p className="text-sm opacity-75 mb-1">إجمالي قيمة التمويل المطلوب</p>
                <h3 className="text-2xl font-black">{formatCurrency(extStats?.totalFinancingRequested ?? 0)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-none">
              <CardContent className="p-6">
                <Building2 className="w-6 h-6 mb-3 opacity-70" />
                <p className="text-sm opacity-75 mb-1">إجمالي قيمة العروض المقدَّمة</p>
                <h3 className="text-2xl font-black">{formatCurrency(extStats?.totalFinancingOffered ?? 0)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-600 to-violet-500 text-white border-none">
              <CardContent className="p-6">
                <Percent className="w-6 h-6 mb-3 opacity-70" />
                <p className="text-sm opacity-75 mb-1">متوسط نسبة الربح</p>
                <h3 className="text-2xl font-black">{extStats?.avgProfitRate ?? "0.00"}٪</h3>
              </CardContent>
            </Card>
          </div>

          {/* Advisors by bank + Clients by sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  المستشارون الفعّالون حسب البنك
                </h3>
                {(!extStats?.advisorsByBank || extStats.advisorsByBank.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات بعد</p>
                ) : (
                  <div className="space-y-3">
                    {extStats.advisorsByBank.map((row: any) => {
                      const max = Math.max(...extStats.advisorsByBank.map((r: any) => r.count));
                      return (
                        <div key={row.bank}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-foreground truncate max-w-[70%]">{row.bank}</span>
                            <span className="font-bold text-primary">{row.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(row.count / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  العملاء حسب القطاع الوظيفي
                </h3>
                {(!extStats?.clientsBySector || extStats.clientsBySector.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات بعد</p>
                ) : (
                  <div className="space-y-3">
                    {extStats.clientsBySector.map((row: any) => {
                      const max = Math.max(...extStats.clientsBySector.map((r: any) => r.count));
                      const colors: Record<string, string> = {
                        government: "bg-blue-500",
                        semi_government: "bg-violet-500",
                        private: "bg-emerald-500",
                        retired: "bg-amber-500",
                      };
                      return (
                        <div key={row.sector}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{SECTOR_LABELS[row.sector] ?? row.sector}</span>
                            <span className="font-bold text-primary">{row.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${colors[row.sector] ?? "bg-primary"}`}
                              style={{ width: `${(row.count / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── PENDING CHOSEN OFFERS TAB ── */}
      {activeTab === "pending-offers" && (
        <div>
          {/* Rejection reason modal */}
          {rejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRejectModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg text-destructive">رفض العرض</h3>
                <p className="text-sm text-muted-foreground">يرجى إدخال سبب الرفض ليُعرض للعميل عند اختياره عروضاً أخرى.</p>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="سبب الرفض (اختياري)"
                  rows={3}
                  className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30 resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                    isLoading={rejectingOffer}
                    onClick={() => {
                      rejectOffer({ offerId: rejectModal.offerId, reason: rejectReason }, {
                        onSuccess: () => { setRejectModal(null); setRejectReason(""); },
                      });
                    }}
                  >
                    تأكيد الرفض
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold">عروض اختارها العملاء — بانتظار اعتماد الإدارة</h2>
            {(pendingOffers?.length ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {pendingOffers!.length}
              </span>
            )}
            {(pendingOffers?.length ?? 0) > 1 && (
              <Button
                className="mr-auto bg-green-600 hover:bg-green-700 text-white gap-2"
                size="sm"
                isLoading={bulkApproving}
                onClick={() => bulkApprove()}
              >
                <CheckCircle2 className="w-4 h-4" />
                اعتماد الكل ({pendingOffers!.length})
              </Button>
            )}
          </div>

          {loadingOffers ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
          ) : !pendingOffers || pendingOffers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا توجد عروض بانتظار الاعتماد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingOffers.map(offer => (
                <Card key={offer.offerId} className="border-amber-200 bg-amber-50/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      {/* Client info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="warning" className="text-xs">طلب #{offer.requestId}</Badge>
                          <Badge variant="outline" className="text-xs">{SECTOR_LABELS[offer.sector] ?? offer.sector}</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">العميل</p>
                            <p className="font-bold">{offer.clientName}</p>
                            <p className="text-xs text-muted-foreground">{offer.clientPhone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">جهة العمل</p>
                            <p className="font-semibold">{offer.employer}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">المديونية الحالية</p>
                            <p className="font-bold text-primary">{formatCurrency(offer.currentDebt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Offer details */}
                      <div className="flex-1 bg-white rounded-xl border border-border p-4 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground mb-3">العرض المختار</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">المستشار</p>
                            <p className="font-bold">{offer.advisorName}</p>
                            <p className="text-xs text-muted-foreground">{offer.advisorCompany}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">نسبة الربح</p>
                            <p className="font-black text-lg text-primary">{offer.profitRate}٪</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">القسط الشهري</p>
                            <p className="font-bold">{formatCurrency(offer.monthlyInstallment)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">إجمالي التمويل</p>
                            <p className="font-bold">{formatCurrency(offer.totalAmount)}</p>
                            <p className="text-xs text-muted-foreground">{offer.durationMonths} شهر</p>
                          </div>
                        </div>
                        {offer.notes && (
                          <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                            <span className="font-semibold">ملاحظة: </span>{offer.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-3 flex-shrink-0">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white gap-2"
                          isLoading={approvingOffer}
                          onClick={() => approveOffer(offer.offerId)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          اعتماد وتوصيل
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                          onClick={() => { setRejectReason(""); setRejectModal({ offerId: offer.offerId }); }}
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PENDING ADVISORS TAB ── */}
      {activeTab === "pending-advisors" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold">طلبات انضمام المستشارين</h2>
            {(pendingAdvisors?.length ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {pendingAdvisors!.length}
              </span>
            )}
          </div>

          {loadingAdvisors ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
          ) : !pendingAdvisors || pendingAdvisors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا يوجد طلبات انضمام معلّقة</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="text-xs text-muted-foreground uppercase bg-amber-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-bold">الاسم</th>
                      <th className="px-6 py-4 font-bold">الجهة</th>
                      <th className="px-6 py-4 font-bold">البريد</th>
                      <th className="px-6 py-4 font-bold">الرقم الوظيفي</th>
                      <th className="px-6 py-4 font-bold">الخبرة</th>
                      <th className="px-6 py-4 font-bold">تاريخ التعيين</th>
                      <th className="px-6 py-4 font-bold">تاريخ الطلب</th>
                      <th className="px-6 py-4 font-bold text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingAdvisors.map((advisor) => (
                      <tr key={advisor.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold">{advisor.name}</td>
                        <td className="px-6 py-4">{advisor.company}</td>
                        <td className="px-6 py-4 text-muted-foreground">{advisor.email ?? "—"}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-mono text-xs">{advisor.employeeId}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {advisor.monthsExperience >= 12
                            ? `${Math.floor(advisor.monthsExperience / 12)} سنة${advisor.monthsExperience % 12 ? ` و${advisor.monthsExperience % 12} شهر` : ""}`
                            : `${advisor.monthsExperience ?? 0} شهر`}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {advisor.appointmentDate
                            ? new Date(advisor.appointmentDate).toLocaleDateString("ar-SA")
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(advisor.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              isLoading={approvingAdvisor}
                              onClick={() => approveAdvisor(advisor.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                              isLoading={rejectingAdvisor}
                              onClick={() => rejectAdvisor(advisor.id)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              رفض
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── BANK CHANGE TAB ── */}
      {activeTab === "bank-changes" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl font-bold">طلبات تغيير البنك من المستشارين</h2>
            {(bankChangeRequests?.length ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                {bankChangeRequests!.length}
              </span>
            )}
          </div>
          {loadingBankChanges ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
          ) : !bankChangeRequests || bankChangeRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا توجد طلبات تغيير بنك معلّقة</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="text-xs text-muted-foreground uppercase bg-sky-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-bold">المستشار</th>
                      <th className="px-6 py-4 font-bold">البنك الحالي</th>
                      <th className="px-6 py-4 font-bold">البنك الجديد</th>
                      <th className="px-6 py-4 font-bold">الرقم الوظيفي</th>
                      <th className="px-6 py-4 font-bold">الجوّال</th>
                      <th className="px-6 py-4 font-bold">تاريخ الطلب</th>
                      <th className="px-6 py-4 font-bold text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bankChangeRequests.map(row => (
                      <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold">{row.name}</td>
                        <td className="px-6 py-4">{row.company}</td>
                        <td className="px-6 py-4 font-bold text-sky-700">{row.pendingCompany}</td>
                        <td className="px-6 py-4"><Badge variant="outline" className="font-mono text-xs">{row.employeeId}</Badge></td>
                        <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{row.phone}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {row.bankChangeRequestedAt ? new Date(row.bankChangeRequestedAt).toLocaleDateString("ar-SA") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-center">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              isLoading={approvingBankChange} onClick={() => approveBankChange(row.id)}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> موافقة
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                              isLoading={rejectingBankChange} onClick={() => rejectBankChange(row.id)}>
                              <XCircle className="w-3.5 h-3.5" /> رفض
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === "reports" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold">بلاغات المستشارين</h2>
            {(advisorReports ?? []).filter(r => r.status === "pending").length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                {(advisorReports ?? []).filter(r => r.status === "pending").length}
              </span>
            )}
          </div>

          {loadingReports ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
          ) : !(advisorReports ?? []).length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا توجد بلاغات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(advisorReports ?? []).map(report => {
                const statusColors: Record<string, string> = {
                  pending: "text-amber-700 bg-amber-50 border-amber-200",
                  dismissed: "text-muted-foreground bg-muted border-border",
                  actioned: "text-red-700 bg-red-50 border-red-200",
                };
                const statusLabels: Record<string, string> = {
                  pending: "قيد المراجعة",
                  dismissed: "تم رفضه",
                  actioned: "تم إزالة المستشار",
                };
                return (
                  <Card key={report.id} className={`border ${report.status === "pending" ? "border-amber-200 bg-amber-50/30" : "border-border"}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Flag className="w-4 h-4 text-red-500" />
                            <span className="font-bold">بلاغ #{report.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[report.status] ?? ""}`}>
                              {statusLabels[report.status] ?? report.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString("ar-SA")}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{report.bankName}</Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">مقدّم البلاغ</p>
                          <p className="font-bold">{report.reporterName}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">المُبلَّغ عنه</p>
                          <p className="font-bold text-red-700">{report.reportedName}</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">سبب البلاغ</p>
                        <p className="text-sm leading-relaxed">{report.reason}</p>
                      </div>

                      {report.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
                          <p className="text-xs font-bold mb-1">ملاحظة الإدارة:</p>
                          <p>{report.adminNote}</p>
                        </div>
                      )}

                      {report.status === "pending" && (
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white gap-2"
                            isLoading={handlingReport}
                            onClick={() => handleReport({ id: report.id, action: "remove", adminNote: "تم مراجعة البلاغ وإزالة المستشار." })}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            إزالة المستشار
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={handlingReport}
                            onClick={() => handleReport({ id: report.id, action: "dismiss", adminNote: "تمت مراجعة البلاغ ورُفض." })}
                          >
                            <Check className="w-3.5 h-3.5" />
                            رفض البلاغ
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CLIENT REPORTS TAB ── */}
      {activeTab === "client-reports" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <MessageSquarePlus className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold">بلاغات العملاء</h2>
            {(clientReports ?? []).filter(r => r.status === "pending").length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {(clientReports ?? []).filter(r => r.status === "pending").length}
              </span>
            )}
          </div>

          {loadingClientReports ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">جارٍ التحميل...</CardContent></Card>
          ) : !(clientReports ?? []).length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا توجد بلاغات من العملاء</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(clientReports ?? []).map(report => {
                const statusColors: Record<string, string> = {
                  pending: "text-amber-700 bg-amber-50 border-amber-200",
                  resolved: "text-emerald-700 bg-emerald-50 border-emerald-200",
                  dismissed: "text-muted-foreground bg-muted border-border",
                };
                const statusLabels: Record<string, string> = {
                  pending: "قيد المراجعة",
                  resolved: "تم الحل",
                  dismissed: "تم رفضه",
                };
                return (
                  <Card key={report.id} className={`border ${report.status === "pending" ? "border-blue-200 bg-blue-50/20" : "border-border"}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-blue-500" />
                            <span className="font-bold">بلاغ عميل #{report.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[report.status] ?? ""}`}>
                              {statusLabels[report.status] ?? report.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString("ar-SA")}</p>
                        </div>
                        {report.requestId && (
                          <Badge variant="outline" className="text-xs">طلب #{report.requestId}</Badge>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">العميل</p>
                          <p className="font-bold">{report.clientName}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">موضوع البلاغ</p>
                          <p className="font-bold text-blue-800">{report.subject}</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">تفاصيل المشكلة</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.description}</p>
                      </div>

                      {report.adminNote && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-800">
                          <p className="text-xs font-bold mb-1">ملاحظة الإدارة:</p>
                          <p>{report.adminNote}</p>
                        </div>
                      )}

                      {report.status === "pending" && (
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            isLoading={handlingClientReport}
                            onClick={() => handleClientReport({ id: report.id, status: "resolved", adminNote: "تمت مراجعة البلاغ وحلّ المشكلة." })}
                          >
                            <Check className="w-3.5 h-3.5" />
                            تم الحل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={handlingClientReport}
                            onClick={() => handleClientReport({ id: report.id, status: "dismissed", adminNote: "تمت مراجعة البلاغ ورُفض." })}
                          >
                            <X className="w-3.5 h-3.5" />
                            رفض البلاغ
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ALL REQUESTS TAB ── */}
      {activeTab === "requests" && (
        <div>
          <h2 className="text-xl font-bold mb-6">سجل الطلبات</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold">رقم الطلب</th>
                    <th className="px-6 py-4 font-bold">العميل</th>
                    <th className="px-6 py-4 font-bold">جهة العمل</th>
                    <th className="px-6 py-4 font-bold">المديونية</th>
                    <th className="px-6 py-4 font-bold">الحالة</th>
                    <th className="px-6 py-4 font-bold">العروض</th>
                    <th className="px-6 py-4 font-bold text-center">تفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests?.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold">#{req.id}</td>
                      <td className="px-6 py-4">{req.fullName}</td>
                      <td className="px-6 py-4">{req.employer}</td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(req.currentDebt)}</td>
                      <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                      <td className="px-6 py-4 font-bold text-primary">{req.offersCount}</td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/requests/${req.id}`}>
                          <Button variant="outline" size="sm">عرض</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── PRICING TAB ── */}
      {activeTab === "pricing" && (() => {
        const existingBanks = Array.from(new Set((pricingRules ?? []).map(r => r.bankName))).sort();
        const activeBankName = selectedPricingBank === "__new__" ? customBankName.trim() : selectedPricingBank;
        const bankRules = (pricingRules ?? []).filter(r => r.bankName === activeBankName);

        const submitAddRow = () => {
          setAddRowError(null);
          const { sector, financingType, salaryMin, salaryMax, profitRate, durationMonths, notes } = addRowForm;
          if (!activeBankName) return setAddRowError("يرجى تحديد اسم البنك أولاً");
          const minN = Number(salaryMin); const maxN = Number(salaryMax); const rateN = Number(profitRate);
          if (!salaryMin || !salaryMax || !profitRate || isNaN(minN) || isNaN(maxN) || isNaN(rateN)) return setAddRowError("يرجى تعبئة جميع الحقول بأرقام صحيحة");
          if (maxN <= minN) return setAddRowError("الراتب الأقصى يجب أن يكون أكبر من الأدنى");
          createRule(
            { bankName: activeBankName, sector, financingType, salaryMin: minN, salaryMax: maxN, profitRate: rateN, durationMonths: durationMonths ? Number(durationMonths) : null, notes: notes || undefined },
            {
              onSuccess: () => {
                setShowAddRow(false);
                setAddRowForm({ bankName: "", sector: "government", financingType: "personal", salaryMin: "", salaryMax: "", profitRate: "", durationMonths: "", notes: "" });
                setAddRowError(null);
              },
              onError: (e: any) => setAddRowError(e.message ?? "حدث خطأ"),
            }
          );
        };

        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <TableProperties className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800">إدارة جداول الأسعار</h3>
                <p className="text-sm text-amber-700 mt-0.5">اختر البنك من القائمة لعرض أسعاره وإضافة نطاقات رواتب جديدة.</p>
              </div>
            </div>

            {/* ── Bank selector ── */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> اختر البنك / الجهة
                </label>
                <div className="flex gap-3 flex-wrap items-center">
                  <select
                    value={selectedPricingBank}
                    onChange={e => { setSelectedPricingBank(e.target.value); setShowAddRow(false); setCustomBankName(""); }}
                    className="flex-1 min-w-[200px] h-10 text-sm border border-input rounded-xl bg-background px-3 font-medium"
                  >
                    <option value="">— اختر بنكاً —</option>
                    {existingBanks.map(b => <option key={b} value={b}>{b}</option>)}
                    <option value="__new__">+ إضافة بنك جديد</option>
                  </select>
                  {selectedPricingBank === "__new__" && (
                    <input
                      type="text"
                      value={customBankName}
                      onChange={e => setCustomBankName(e.target.value)}
                      placeholder="اكتب اسم البنك الجديد..."
                      className="flex-1 min-w-[200px] h-10 px-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Rules table for selected bank ── */}
            {loadingPricing ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> جاري التحميل...
              </div>
            ) : !selectedPricingBank ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-bold text-foreground mb-1">اختر بنكاً من القائمة أعلاه</p>
                  <p className="text-sm text-muted-foreground">ستظهر قواعد الأسعار الخاصة بالبنك المختار</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-border/60">
                <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="font-extrabold text-foreground">{activeBankName || "بنك جديد"}</h3>
                    <span className="text-xs text-muted-foreground">{bankRules.length} قاعدة</span>
                  </div>
                  <Button
                    onClick={() => { setShowAddRow(true); setAddRowError(null); setAddRowForm({ bankName: "", sector: "government", financingType: "personal", salaryMin: "", salaryMax: "", profitRate: "", durationMonths: "", notes: "" }); }}
                    className="gap-1.5 h-8 text-xs px-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة نطاق راتب وتسعير
                  </Button>
                </div>

                {bankRules.length === 0 && !showAddRow ? (
                  <div className="p-10 text-center">
                    <TableProperties className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-muted-foreground mb-3">لا توجد قواعد لهذا البنك بعد</p>
                    <Button onClick={() => setShowAddRow(true)} className="gap-1.5 text-sm">
                      <Plus className="w-4 h-4" /> أضف أول قاعدة
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/20 text-muted-foreground text-xs border-b border-border">
                          <th className="px-4 py-2.5 text-right">القطاع</th>
                          <th className="px-4 py-2.5 text-right">نوع التمويل</th>
                          <th className="px-4 py-2.5 text-right">نطاق الراتب (ريال)</th>
                          <th className="px-4 py-2.5 text-right">نسبة الربح</th>
                          <th className="px-4 py-2.5 text-right">المدة (أشهر)</th>
                          <th className="px-4 py-2.5 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankRules.sort((a, b) => a.salaryMin - b.salaryMin).map(rule => {
                          const isEditing = editingRuleId === rule.id;
                          return (
                            <tr key={rule.id} className={`border-t border-border transition-colors ${isEditing ? "bg-amber-50" : "hover:bg-muted/20"}`}>
                              <td className="px-4 py-3">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                  {SECTOR_LABELS_PRICING[rule.sector] ?? rule.sector}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {FINANCING_TYPE_LABELS[rule.financingType] ?? rule.financingType}
                              </td>
                              <td className="px-4 py-3 font-medium text-xs">
                                {Number(rule.salaryMin).toLocaleString("ar-SA")} – {Number(rule.salaryMax).toLocaleString("ar-SA")}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <input type="number" step="0.01" value={editValues.profitRate} onChange={e => setEditValues(v => ({ ...v, profitRate: e.target.value }))} className="w-20 rounded-lg border-2 border-amber-400 px-2 py-1 text-sm font-bold focus:outline-none" />
                                ) : (
                                  <span className="font-black text-primary">{Number(rule.profitRate).toFixed(2)}٪</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <input type="number" value={editValues.durationMonths} onChange={e => setEditValues(v => ({ ...v, durationMonths: e.target.value }))} className="w-20 rounded-lg border-2 border-amber-400 px-2 py-1 text-sm focus:outline-none" placeholder="اختياري" />
                                ) : (
                                  <span className="text-muted-foreground">{rule.durationMonths ? `${rule.durationMonths}` : "—"}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 justify-center">
                                  {isEditing ? (
                                    <>
                                      <button onClick={() => { editRule({ id: rule.id, profitRate: Number(editValues.profitRate), durationMonths: editValues.durationMonths ? Number(editValues.durationMonths) : null }); setEditingRuleId(null); }} disabled={editingRule} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors" title="حفظ">
                                        {editingRule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                      </button>
                                      <button onClick={() => setEditingRuleId(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors" title="إلغاء">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => { setEditingRuleId(rule.id); setEditValues({ profitRate: Number(rule.profitRate).toString(), durationMonths: rule.durationMonths?.toString() ?? "" }); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="تعديل">
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => { if (confirm("هل تريد حذف هذه القاعدة؟")) deleteRule(rule.id); }} disabled={deletingRule} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="حذف">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* ── Inline add row ── */}
                        {showAddRow && (
                          <tr className="border-t-2 border-primary/30 bg-primary/5">
                            <td className="px-3 py-2">
                              <select value={addRowForm.sector} onChange={e => setAddRowForm(f => ({ ...f, sector: e.target.value }))} className="w-full h-8 text-xs border border-input rounded-lg bg-background px-2">
                                {VALID_SECTORS.map(s => <option key={s} value={s}>{SECTOR_LABELS_FORM[s]}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select value={addRowForm.financingType} onChange={e => setAddRowForm(f => ({ ...f, financingType: e.target.value }))} className="w-full h-8 text-xs border border-input rounded-lg bg-background px-2">
                                {VALID_FINANCING_TYPES.map(t => <option key={t} value={t}>{FINANCING_TYPE_LABELS_FORM[t]}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <input type="number" value={addRowForm.salaryMin} onChange={e => setAddRowForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="من" className="w-20 h-8 px-2 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                                <span className="text-muted-foreground text-xs">–</span>
                                <input type="number" value={addRowForm.salaryMax} onChange={e => setAddRowForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="إلى" className="w-20 h-8 px-2 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" step="0.01" value={addRowForm.profitRate} onChange={e => setAddRowForm(f => ({ ...f, profitRate: e.target.value }))} placeholder="%" className="w-20 h-8 px-2 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={addRowForm.durationMonths} onChange={e => setAddRowForm(f => ({ ...f, durationMonths: e.target.value }))} placeholder="اختياري" className="w-20 h-8 px-2 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1 justify-center">
                                <button onClick={submitAddRow} disabled={creatingRule} className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors" title="حفظ">
                                  {creatingRule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => { setShowAddRow(false); setAddRowError(null); }} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors" title="إلغاء">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {addRowError && (
                      <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs">{addRowError}</div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        );
      })()}

      {/* ── BEST-PRICE ADS TAB ── */}
      {activeTab === "best-price" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">إعلانات أفضل سعر</h2>
              <span className="text-sm text-muted-foreground">({(bestPriceAds ?? []).length})</span>
            </div>
            <Button onClick={() => openAdModal()} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة إعلان
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">تظهر هذه الإعلانات في بطاقات "أفضل سعر" بالصفحة الرئيسية للمنصة.</p>
          </div>

          {loadingAds ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline-block ml-2" /> جارٍ التحميل...</CardContent></Card>
          ) : !(bestPriceAds ?? []).length ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <Megaphone className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-bold text-foreground mb-1">لا توجد إعلانات بعد</p>
                <p className="text-sm text-muted-foreground mb-4">أضف أول إعلان لعرضه في الصفحة الرئيسية</p>
                <Button onClick={() => openAdModal()} className="gap-2"><Plus className="w-4 h-4" /> إضافة إعلان</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-5 py-3 font-bold">المنتج</th>
                      <th className="px-5 py-3 font-bold">البنك</th>
                      <th className="px-5 py-3 font-bold">نسبة الربح</th>
                      <th className="px-5 py-3 font-bold">مبلغ الرعاية</th>
                      <th className="px-5 py-3 font-bold">الترتيب</th>
                      <th className="px-5 py-3 font-bold">الحالة</th>
                      <th className="px-5 py-3 font-bold text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(bestPriceAds ?? []).map(ad => (
                      <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-bold">{ad.product}</td>
                        <td className="px-5 py-3 text-muted-foreground">{ad.bankName}</td>
                        <td className="px-5 py-3 font-black text-primary">{Number(ad.profitRate).toFixed(2)}٪</td>
                        <td className="px-5 py-3">{ad.sponsorshipAmount ? formatCurrency(ad.sponsorshipAmount) : "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{ad.sortOrder}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => saveAd({ id: ad.id, data: { active: !ad.active } })}
                            disabled={savingAd}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${ad.active ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-muted-foreground bg-muted border-border hover:bg-border"}`}
                          >
                            <Power className="w-3 h-3" /> {ad.active ? "مفعّل" : "متوقف"}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 justify-center">
                            <button onClick={() => openAdModal(ad)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="تعديل">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { if (confirm("هل تريد حذف هذا الإعلان؟")) deleteAd(ad.id); }} disabled={deletingAd} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="حذف">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── SPONSORS TAB ── */}
      {activeTab === "sponsors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">الرعاة الرسميون</h2>
              <span className="text-sm text-muted-foreground">({(sponsors ?? []).length})</span>
            </div>
            <Button onClick={() => openSponsorModal()} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة راعٍ
            </Button>
          </div>

          {loadingSponsors ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline-block ml-2" /> جارٍ التحميل...</CardContent></Card>
          ) : !(sponsors ?? []).length ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <Award className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-bold text-foreground mb-1">لا يوجد رعاة بعد</p>
                <p className="text-sm text-muted-foreground mb-4">أضف أول راعٍ رسمي لعرضه في الصفحة الرئيسية</p>
                <Button onClick={() => openSponsorModal()} className="gap-2"><Plus className="w-4 h-4" /> إضافة راعٍ</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(sponsors ?? []).map(sp => (
                <Card key={sp.id} className={`border ${sp.active ? "border-border" : "border-dashed opacity-70"}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {sp.logoUrl ? (
                          <img src={sp.logoUrl} alt={sp.name} className="w-full h-full object-contain" />
                        ) : (
                          <Award className="w-6 h-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold truncate">{sp.name}</h3>
                        {sp.website ? (
                          <a href={sp.website} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 hover:underline truncate">
                            <ExternalLink className="w-3 h-3" /> {sp.website}
                          </a>
                        ) : (
                          <p className="text-xs text-muted-foreground">لا يوجد موقع</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">الترتيب: {sp.sortOrder}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => saveSponsor({ id: sp.id, data: { active: !sp.active } })}
                        disabled={savingSponsor}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${sp.active ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-muted-foreground bg-muted border-border hover:bg-border"}`}
                      >
                        <Power className="w-3 h-3" /> {sp.active ? "مفعّل" : "متوقف"}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openSponsorModal(sp)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="تعديل">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { if (confirm("هل تريد حذف هذا الراعي؟")) deleteSponsor(sp.id); }} disabled={deletingSponsor} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="حذف">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADVISORS REGISTRY TAB ── */}
      {activeTab === "advisors-registry" && (() => {
        const banks = Array.from(new Set((allAdvisors ?? []).map(a => a.company))).sort();
        const filtered = (allAdvisors ?? []).filter(a => !registryBankFilter || a.company === registryBankFilter);
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">سجل المستشارين</h2>
              <span className="text-sm text-muted-foreground">({(allAdvisors ?? []).length})</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">يمكنك تعيين مشرف واحد لكل بنك. تعيين مشرف جديد يُلغي إشراف السابق في نفس البنك تلقائياً.</p>
            </div>

            <Card className="border-border/60">
              <CardContent className="p-4">
                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> تصفية حسب البنك
                </label>
                <select
                  value={registryBankFilter}
                  onChange={e => setRegistryBankFilter(e.target.value)}
                  className="w-full sm:w-72 h-10 text-sm border border-input rounded-xl bg-background px-3 font-medium"
                >
                  <option value="">— جميع البنوك —</option>
                  {banks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </CardContent>
            </Card>

            {loadingAllAdvisors ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline-block ml-2" /> جارٍ التحميل...</CardContent></Card>
            ) : !filtered.length ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Users className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-bold text-foreground mb-1">لا يوجد مستشارون</p>
                  <p className="text-sm text-muted-foreground">لا توجد بيانات مطابقة للتصفية المحددة</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-5 py-3 font-bold">الترتيب</th>
                        <th className="px-5 py-3 font-bold">المستشار</th>
                        <th className="px-5 py-3 font-bold">البنك</th>
                        <th className="px-5 py-3 font-bold">المشرف</th>
                        <th className="px-5 py-3 font-bold">التقييم</th>
                        <th className="px-5 py-3 font-bold">عدد العروض</th>
                        <th className="px-5 py-3 font-bold">الطلبات المنجزة</th>
                        <th className="px-5 py-3 font-bold">النائب أثناء الإجازة</th>
                        <th className="px-5 py-3 font-bold">الإشراف</th>
                        <th className="px-5 py-3 font-bold text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map(a => {
                        const delegateName = a.vacationDelegateAdvisorId ? (advisorNameById.get(a.vacationDelegateAdvisorId) ?? "—") : "—";
                        return (
                          <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${a.activityRank === 1 ? "bg-amber-100 text-amber-700 border border-amber-300" : a.activityRank && a.activityRank <= 3 ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-muted text-muted-foreground"}`}>
                                {a.activityRank ?? "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-bold">{a.name}</div>
                              <div className="text-xs text-muted-foreground">{a.email ?? a.phone}</div>
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">{a.company}</td>
                            <td className="px-5 py-3 text-muted-foreground">{a.supervisorName ?? "—"}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1 font-bold text-primary">
                                <Star className="w-3.5 h-3.5" /> {Number(a.rating ?? 0).toFixed(1)}
                                <span className="text-xs text-muted-foreground font-normal">/ 5</span>
                              </span>
                            </td>
                            <td className="px-5 py-3 font-bold">{a.offersCount ?? 0}</td>
                            <td className="px-5 py-3 font-bold">{a.requestsWorked ?? 0}</td>
                            <td className="px-5 py-3 text-muted-foreground">{delegateName}</td>
                            <td className="px-5 py-3">
                              {a.isSupervisor ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                                  <ShieldCheck className="w-3 h-3" /> مشرف
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">مستشار</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-col gap-1.5 items-stretch min-w-[9rem]">
                                {a.isSupervisor ? (
                                  <Button
                                    size="sm" variant="outline"
                                    className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                                    isLoading={revokingSupervisor}
                                    onClick={() => { if (confirm("هل تريد إلغاء الإشراف عن هذا المستشار؟")) revokeSupervisor(a.id); }}
                                  >
                                    <X className="w-3.5 h-3.5" /> إلغاء الإشراف
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="gap-1.5"
                                    isLoading={assigningSupervisor}
                                    onClick={() => assignSupervisor(a.id)}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" /> تعيين كمشرف
                                  </Button>
                                )}
                                <Button
                                  size="sm" variant="outline"
                                  className="gap-1.5 border-red-400 text-red-700 hover:bg-red-50"
                                  isLoading={revokingMembership}
                                  onClick={() => { if (confirm(`هل تريد إلغاء عضوية المستشار "${a.name}" نهائياً؟ لن يتمكن من تسجيل الدخول بعد ذلك.`)) revokeMembership(a.id); }}
                                >
                                  <X className="w-3.5 h-3.5" /> إلغاء العضوية
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {(supervisors ?? []).length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-600" /> المشرفون الحاليون (مشرف لكل بنك)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(supervisors ?? []).map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                        <ShieldCheck className="w-3 h-3" /> {s.name} — {s.company}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* ── Best-price ad modal ── */}
      <Modal isOpen={!!adModal} onClose={() => setAdModal(null)} title={adModal?.id ? "تعديل إعلان" : "إضافة إعلان أفضل سعر"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">اسم المنتج</label>
            <Input value={adForm.product} onChange={e => setAdForm(f => ({ ...f, product: e.target.value }))} placeholder="مثال: تمويل شخصي" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">البنك</label>
            <select
              value={adForm.bankName}
              onChange={e => setAdForm(f => ({ ...f, bankName: e.target.value }))}
              className="w-full h-10 text-sm border border-input rounded-xl bg-background px-3 font-medium"
            >
              {SAUDI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              {!SAUDI_BANKS.includes(adForm.bankName) && adForm.bankName && (
                <option value={adForm.bankName}>{adForm.bankName}</option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold mb-1.5">نسبة الربح %</label>
              <Input type="number" step="0.01" value={adForm.profitRate} onChange={e => setAdForm(f => ({ ...f, profitRate: e.target.value }))} placeholder="%" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">مبلغ الرعاية (ر.س)</label>
              <Input type="number" value={adForm.sponsorshipAmount} onChange={e => setAdForm(f => ({ ...f, sponsorshipAmount: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-bold mb-1.5">الترتيب</label>
              <Input type="number" value={adForm.sortOrder} onChange={e => setAdForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" />
            </div>
            <label className="flex items-center gap-2 h-10 cursor-pointer">
              <input type="checkbox" checked={adForm.active} onChange={e => setAdForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm font-bold">مفعّل</span>
            </label>
          </div>
          {adError && <p className="text-sm text-red-600">{adError}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={submitAd} isLoading={savingAd} className="gap-2 flex-1">
              <Check className="w-4 h-4" /> حفظ
            </Button>
            <Button variant="outline" onClick={() => setAdModal(null)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* ── Sponsor modal ── */}
      <Modal isOpen={!!sponsorModal} onClose={() => setSponsorModal(null)} title={sponsorModal?.id ? "تعديل راعٍ" : "إضافة راعٍ رسمي"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">اسم الراعي</label>
            <Input value={sponsorForm.name} onChange={e => setSponsorForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الجهة الراعية" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">رابط الشعار (اختياري)</label>
            <Input value={sponsorForm.logoUrl} onChange={e => setSponsorForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">الموقع الإلكتروني (اختياري)</label>
            <Input value={sponsorForm.website} onChange={e => setSponsorForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-bold mb-1.5">الترتيب</label>
              <Input type="number" value={sponsorForm.sortOrder} onChange={e => setSponsorForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" />
            </div>
            <label className="flex items-center gap-2 h-10 cursor-pointer">
              <input type="checkbox" checked={sponsorForm.active} onChange={e => setSponsorForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm font-bold">مفعّل</span>
            </label>
          </div>
          {sponsorError && <p className="text-sm text-red-600">{sponsorError}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={submitSponsor} isLoading={savingSponsor} className="gap-2 flex-1">
              <Check className="w-4 h-4" /> حفظ
            </Button>
            <Button variant="outline" onClick={() => setSponsorModal(null)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
