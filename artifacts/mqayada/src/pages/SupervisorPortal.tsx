import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Target, Gift, Link2, Plane, Copy, Check, RefreshCw, Plus, Trash2, X,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function authFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("mqayada_token") ?? "";
  return fetch(`${BASE}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options?.headers ?? {}) },
  });
}

interface TargetSummary { id: number; label: string; metric: string; period: string; targetValue: number; current: number; pct: number; }
interface TeamMember {
  id: number; name: string; employeeId: string; offersCount: number; successRate: number;
  availability: boolean; isSupervisor: boolean; isMe: boolean; joinedViaSupervisor: boolean;
  targets: TargetSummary[]; completionPct: number | null;
}
interface AnnualOffer {
  id: number; bankName: string; title: string; terms: string | null; profitRate: number | null;
  financingType: string; validFrom: string | null; validTo: string | null; status: string; features: string[];
}

const METRIC_LABELS: Record<string, string> = { offers: "عدد العروض المقدمة", agreed: "الصفقات المتفق عليها", rating: "متوسط التقييم" };
const PERIOD_LABELS: Record<string, string> = { monthly: "شهري", quarterly: "ربع سنوي", yearly: "سنوي" };
const FINANCING_LABELS: Record<string, string> = { personal: "تمويل شخصي", debt_transfer: "نقل مديونية", new_financing: "تمويل جديد", real_estate: "تمويل عقاري" };

function pctColor(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export default function SupervisorPortal() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"team" | "offers" | "settings">("team");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users className="w-6 h-6" /></span>
          بوابة مشرف المستشارين
        </h1>
        <p className="mt-2 text-muted-foreground">{user?.company ? `إشراف فريق ${user.company}` : "إدارة فريق المستشارين"}</p>
      </div>

      <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
        {[
          { key: "team", label: "فريقي والمستهدفات", icon: Target },
          { key: "offers", label: "العروض السنوية", icon: Gift },
          { key: "settings", label: "الدعوة والإعدادات", icon: Link2 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "team" && <TeamTab />}
      {tab === "offers" && <OffersTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

/* ════════════════ TEAM + TARGETS ════════════════ */
function TeamTab() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetFor, setTargetFor] = useState<TeamMember | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    authFetch("/supervisor/team")
      .then((r) => r.json())
      .then((d) => setTeam(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-16 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (team.length === 0) return <div className="py-16 text-center text-muted-foreground">لا يوجد مستشارون في فريقك بعد. شارك رابط الدعوة لإضافتهم.</div>;

  return (
    <div className="space-y-4">
      {team.map((m) => (
        <div key={m.id} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{m.name}</h3>
                {m.isMe && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">أنت (المشرف)</span>}
                {m.joinedViaSupervisor && !m.isMe && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">انضم عبر دعوتك</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">الرقم الوظيفي: {m.employeeId || "—"} · عروض: {m.offersCount} · نجاح: {m.successRate}%</p>
            </div>
            <div className="flex items-center gap-3">
              {m.completionPct !== null && (
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-foreground">{m.completionPct}%</p>
                  <p className="text-[10px] text-muted-foreground">إنجاز المستهدفات</p>
                </div>
              )}
              {!m.isMe && (
                <button onClick={() => setTargetFor(m)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> مستهدف
                </button>
              )}
            </div>
          </div>

          {m.targets.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {m.targets.map((t) => (
                <TargetRow key={t.id} target={t} onDeleted={load} />
              ))}
            </div>
          )}
        </div>
      ))}

      {targetFor && <TargetModal member={targetFor} onClose={() => setTargetFor(null)} onSaved={() => { setTargetFor(null); load(); }} />}
    </div>
  );
}

function TargetRow({ target, onDeleted }: { target: TargetSummary; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    setDeleting(true);
    const res = await authFetch(`/targets/${target.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(); else setDeleting(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-semibold text-foreground">{target.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{target.current} / {target.targetValue} · {PERIOD_LABELS[target.period] ?? target.period}</span>
          <button onClick={remove} disabled={deleting} className="text-rose-500 hover:text-rose-700 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${pctColor(target.pct)} transition-all`} style={{ width: `${target.pct}%` }} />
      </div>
    </div>
  );
}

function TargetModal({ member, onClose, onSaved }: { member: TeamMember; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState("");
  const [metric, setMetric] = useState("offers");
  const [targetValue, setTargetValue] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!label.trim() || !targetValue) { setError("يرجى تعبئة العنوان والقيمة المستهدفة"); return; }
    setSaving(true);
    const res = await authFetch("/targets", {
      method: "POST",
      body: JSON.stringify({ advisorId: member.id, label: label.trim(), metric, targetValue: Number(targetValue), period }),
    });
    if (res.ok) onSaved();
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "حدث خطأ"); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold">تحديد مستهدف لـ {member.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">عنوان المستهدف</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: تقديم 20 عرضاً" className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">المقياس</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background">
              {Object.entries(METRIC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">القيمة المستهدفة</label>
              <input type="number" min="1" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">الفترة</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background">
                {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm">
            {saving ? "جارٍ الحفظ…" : "حفظ المستهدف"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ════════════════ ANNUAL OFFERS ════════════════ */
const emptyOffer = { title: "", terms: "", profitRate: "", financingType: "personal", validFrom: "", validTo: "", features: "", status: "active" };

function OffersTab() {
  const [offers, setOffers] = useState<AnnualOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AnnualOffer | "new" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    authFetch("/annual-offers/mine").then((r) => r.json()).then((d) => setOffers(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id: number) => {
    if (!confirm("هل تريد حذف هذا العرض؟")) return;
    const res = await authFetch(`/annual-offers/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">العروض السنوية المنشورة لبنكك — يراها العملاء في صفحة العروض.</p>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90"><Plus className="w-4 h-4" /> عرض جديد</button>
      </div>

      {loading ? <div className="py-16 text-center text-muted-foreground">جارٍ التحميل…</div>
        : offers.length === 0 ? <div className="py-16 text-center text-muted-foreground">لا توجد عروض بعد.</div>
        : (
          <div className="grid sm:grid-cols-2 gap-4">
            {offers.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground">{o.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{o.status === "active" ? "نشط" : "متوقف"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{FINANCING_LABELS[o.financingType] ?? o.financingType}{o.profitRate !== null ? ` · نسبة ${o.profitRate}%` : ""}</p>
                {o.terms && <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{o.terms}</p>}
                {o.features.length > 0 && <ul className="mt-2 text-xs text-muted-foreground list-disc pr-4 space-y-0.5">{o.features.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}</ul>}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditing(o)} className="flex-1 text-xs font-bold py-2 rounded-xl bg-muted hover:bg-muted/70">تعديل</button>
                  <button onClick={() => remove(o.id)} className="text-xs font-bold py-2 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {editing && <OfferModal offer={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function OfferModal({ offer, onClose, onSaved }: { offer: AnnualOffer | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    ...emptyOffer,
    ...(offer ? {
      title: offer.title, terms: offer.terms ?? "", profitRate: offer.profitRate?.toString() ?? "",
      financingType: offer.financingType, validFrom: offer.validFrom ? offer.validFrom.slice(0, 10) : "",
      validTo: offer.validTo ? offer.validTo.slice(0, 10) : "", features: offer.features.join("\n"), status: offer.status,
    } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("عنوان العرض مطلوب"); return; }
    setSaving(true);
    const body = {
      title: form.title.trim(), terms: form.terms.trim() || null,
      profitRate: form.profitRate === "" ? null : Number(form.profitRate),
      financingType: form.financingType, validFrom: form.validFrom || null, validTo: form.validTo || null,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean), status: form.status,
    };
    const res = offer
      ? await authFetch(`/annual-offers/${offer.id}`, { method: "PUT", body: JSON.stringify(body) })
      : await authFetch("/annual-offers", { method: "POST", body: JSON.stringify(body) });
    if (res.ok) onSaved();
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "حدث خطأ"); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" dir="rtl">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold">{offer ? "تعديل العرض" : "عرض سنوي جديد"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">عنوان العرض</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">نوع التمويل</label>
              <select value={form.financingType} onChange={(e) => set("financingType", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background">
                {Object.entries(FINANCING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">نسبة الربح %</label>
              <input type="number" step="0.01" value={form.profitRate} onChange={(e) => set("profitRate", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">صالح من</label>
              <input type="date" value={form.validFrom} onChange={(e) => set("validFrom", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">صالح حتى</label>
              <input type="date" value={form.validTo} onChange={(e) => set("validTo", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">الشروط والتفاصيل</label>
            <textarea value={form.terms} onChange={(e) => set("terms", e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">المميزات (سطر لكل ميزة)</label>
            <textarea value={form.features} onChange={(e) => set("features", e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">الحالة</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full h-10 px-3 text-sm border border-input rounded-xl bg-background">
              <option value="active">نشط (ظاهر للعملاء)</option>
              <option value="inactive">متوقف</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 text-sm">{saving ? "جارٍ الحفظ…" : "حفظ العرض"}</button>
        </form>
      </div>
    </div>
  );
}

/* ════════════════ SETTINGS: invite + vacation delegate ════════════════ */
function SettingsTab() {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [delegateId, setDelegateId] = useState<string>("");
  const [savingDelegate, setSavingDelegate] = useState(false);
  const [delegateMsg, setDelegateMsg] = useState("");

  useEffect(() => {
    authFetch("/supervisor/invite").then((r) => r.json()).then((d) => setToken(d.token ?? null));
    authFetch("/supervisor/me").then((r) => r.json()).then((d) => { if (d?.vacationDelegate) setDelegateId(String(d.vacationDelegate.id)); });
    authFetch("/supervisor/team").then((r) => r.json()).then((d) => setTeam(Array.isArray(d) ? d : []));
  }, []);

  const inviteUrl = token ? `${window.location.origin}${BASE}/register?invite=${token}` : "";

  const copy = async () => {
    if (!inviteUrl) return;
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };

  const regenerate = async () => {
    if (!confirm("سيتم إبطال الرابط الحالي وإنشاء رابط جديد. متابعة؟")) return;
    setRegenerating(true);
    const res = await authFetch("/supervisor/invite/regenerate", { method: "POST" });
    const d = await res.json();
    if (res.ok) setToken(d.token);
    setRegenerating(false);
  };

  const saveDelegate = async () => {
    setSavingDelegate(true);
    setDelegateMsg("");
    const res = await authFetch("/supervisor/vacation-delegate", {
      method: "POST",
      body: JSON.stringify({ delegateAdvisorId: delegateId === "" ? null : Number(delegateId) }),
    });
    if (res.ok) setDelegateMsg("تم الحفظ بنجاح");
    else { const d = await res.json().catch(() => ({})); setDelegateMsg(d.error ?? "حدث خطأ"); }
    setSavingDelegate(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2"><Link2 className="w-5 h-5 text-primary" /> رابط دعوة المستشارين</h3>
        <p className="text-sm text-muted-foreground mb-4">شارك هذا الرابط مع مستشاري بنكك لينضموا تلقائياً إلى فريقك. سيتم إشعار الإدارة عند كل انضمام.</p>
        <div className="flex gap-2">
          <input readOnly value={inviteUrl} className="flex-1 h-10 px-3 text-sm border border-input rounded-xl bg-muted/40 text-foreground ltr text-left" />
          <button onClick={copy} className="flex items-center gap-1.5 text-sm font-bold px-4 rounded-xl bg-primary text-white hover:bg-primary/90">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "تم النسخ" : "نسخ"}
          </button>
        </div>
        <button onClick={regenerate} disabled={regenerating} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} /> إنشاء رابط جديد (إبطال الحالي)
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2"><Plane className="w-5 h-5 text-primary" /> نائب الإجازة</h3>
        <p className="text-sm text-muted-foreground mb-4">حدّد مستشاراً من فريقك كجهة تواصل بديلة أثناء إجازتك أو انتقالك. يظهر اسم النائب لفريقك وللإدارة في سجل المستشارين للرجوع إليه، دون منحه صلاحيات الإشراف تلقائياً.</p>
        <div className="flex gap-2">
          <select value={delegateId} onChange={(e) => setDelegateId(e.target.value)} className="flex-1 h-10 px-3 text-sm border border-input rounded-xl bg-background">
            <option value="">— بدون نائب —</option>
            {team.filter((m) => !m.isMe).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={saveDelegate} disabled={savingDelegate} className="text-sm font-bold px-4 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-60">حفظ</button>
        </div>
        {delegateMsg && <p className="text-xs text-emerald-600 mt-2">{delegateMsg}</p>}
      </div>
    </div>
  );
}
