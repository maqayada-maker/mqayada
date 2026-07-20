import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator, Target, TrendingDown, CheckCircle2, Trash2, LineChart as LineChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("mqayada_token") ?? "";

const fmt = (val: number) =>
  val.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ── Savings calculator linked to the live best rate ── */
export function SavingsCalculator({ bestRate, bestBank }: { bestRate: number; bestBank: string }) {
  const [principal, setPrincipal] = useState<string>("300000");
  const [currentRate, setCurrentRate] = useState<string>("4");
  const [months, setMonths] = useState<string>("60");

  const p = parseFloat(principal) || 0;
  const rOld = parseFloat(currentRate) || 0;
  const m = parseInt(months) || 0;

  let currentInstallment = 0;
  let newInstallment = 0;
  let monthlyDiff = 0;
  let totalSavings = 0;

  if (p > 0 && rOld >= 0 && m > 0) {
    const totalOld = p + p * (rOld / 100) * (m / 12);
    const totalNew = p + p * (bestRate / 100) * (m / 12);
    currentInstallment = totalOld / m;
    newInstallment = totalNew / m;
    monthlyDiff = Math.max(0, currentInstallment - newInstallment);
    totalSavings = Math.max(0, totalOld - totalNew);
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-extrabold text-lg">كم ستوفر مع أفضل سعر حالياً؟</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          مقارنة تلقائية مع أفضل نسبة منشورة الآن: <strong className="text-emerald-600">{bestRate}٪</strong> ({bestBank})
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="space-y-1.5">
            <Label htmlFor="sc-principal" className="text-sm font-bold">المبلغ المتبقي (ر.س)</Label>
            <Input id="sc-principal" type="number" step="any" inputMode="decimal"
              value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-months" className="text-sm font-bold">الأشهر المتبقية</Label>
            <Input id="sc-months" type="number" step="1" inputMode="numeric"
              value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-rate" className="text-sm font-bold">نسبتك الحالية (٪)</Label>
            <Input id="sc-rate" type="number" step="any" inputMode="decimal"
              value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">إجمالي التوفير المتوقع</p>
            <p className="text-2xl font-black text-primary">{fmt(totalSavings)} <span className="text-sm font-bold">ر.س</span></p>
          </div>
          <div className="rounded-2xl bg-muted/50 border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold mb-1">قسطك الحالي</p>
            <p className="text-xl font-bold">{fmt(currentInstallment)} ر.س</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p className="text-xs text-emerald-700 font-semibold mb-1">القسط بأفضل سعر ({bestRate}٪)</p>
            <p className="text-xl font-bold text-emerald-700">{fmt(newInstallment)} ر.س</p>
          </div>
        </div>

        {monthlyDiff > 0 && (
          <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-700">توفير شهري يصل إلى {fmt(monthlyDiff)} ر.س</p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          * الأرقام استرشادية بناءً على نسبة ربح ثابتة ولا تعتبر عرضاً تمويلياً ملزماً.
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Target rate alert card ── */
export function TargetRateCard({ bestRate }: { bestRate: number | null }) {
  const qc = useQueryClient();
  const [input, setInput] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const { data } = useQuery<{ targetRate: number | null }>({
    queryKey: ["rate-alert"],
    queryFn: async () => {
      const res = await window.fetch(`${BASE}/api/rate-alert`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("فشل تحميل التنبيه");
      return res.json();
    },
  });

  const target = data?.targetRate ?? null;

  useEffect(() => {
    if (target !== null) setInput(String(target));
  }, [target]);

  const saveMutation = useMutation({
    mutationFn: async (rate: number) => {
      const res = await window.fetch(`${BASE}/api/rate-alert`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ targetRate: rate }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الحفظ");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rate-alert"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await window.fetch(`${BASE}/api/rate-alert`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => {
      setInput("");
      qc.invalidateQueries({ queryKey: ["rate-alert"] });
    },
  });

  const parsed = parseFloat(input);
  const valid = Number.isFinite(parsed) && parsed > 0 && parsed <= 20;
  const achieved = target !== null && bestRate !== null && bestRate <= target;

  return (
    <Card className={achieved ? "border-emerald-300 bg-emerald-50/40" : "border-amber-200"}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${achieved ? "bg-emerald-100" : "bg-amber-100"}`}>
            <Target className={`w-5 h-5 ${achieved ? "text-emerald-600" : "text-amber-600"}`} />
          </div>
          <h3 className="font-extrabold text-lg">تنبيه السعر المستهدف</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          حدد النسبة التي تتمناها، وسنُعلمك فور نزول سعر أي بنك إليها أو أقل منها.
        </p>

        {achieved && (
          <div className="mb-4 rounded-2xl bg-emerald-100 border border-emerald-300 px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-800">
              تحقق هدفك! أفضل سعر حالياً {bestRate}٪ وهو عند أو أقل من هدفك ({target}٪)
            </p>
          </div>
        )}

        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-[140px] max-w-[200px]">
            <Label htmlFor="target-rate" className="text-sm font-bold">النسبة المستهدفة (٪)</Label>
            <Input id="target-rate" type="number" step="0.1" min="0.1" max="20" inputMode="decimal"
              placeholder="مثال: 3.5" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <Button
            onClick={() => valid && saveMutation.mutate(parsed)}
            disabled={!valid || saveMutation.isPending}
            className="gap-1.5"
          >
            {saveMutation.isPending ? "جارٍ الحفظ..." : saved ? "✓ تم الحفظ" : target !== null ? "تحديث الهدف" : "تفعيل التنبيه"}
          </Button>
          {target !== null && (
            <Button variant="outline" size="icon" aria-label="إلغاء التنبيه"
              onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-red-600 mt-2">{(saveMutation.error as Error).message}</p>
        )}
        {target !== null && !achieved && (
          <p className="text-sm text-muted-foreground mt-3">
            هدفك الحالي: <strong className="text-foreground">{target}٪</strong>
            {bestRate !== null && <> — أفضل سعر منشور الآن: <strong className="text-foreground">{bestRate}٪</strong></>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Rate history trend chart ── */
interface HistoryRow {
  id: number;
  product: string;
  bankName: string;
  profitRate: number;
  recordedAt: string;
}

export function RateHistoryChart() {
  const { data: rows } = useQuery<HistoryRow[]>({
    queryKey: ["rate-history"],
    queryFn: async () => {
      const res = await window.fetch(`${BASE}/api/rate-history`);
      if (!res.ok) throw new Error("فشل تحميل السجل");
      return res.json();
    },
  });

  if (!rows || rows.length === 0) return null;

  // Best (minimum) rate per calendar day
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const day = new Date(r.recordedAt).toISOString().slice(0, 10);
    const prev = byDay.get(day);
    if (prev === undefined || r.profitRate < prev) byDay.set(day, r.profitRate);
  }
  const points = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, rate]) => ({
      day,
      label: new Date(day + "T00:00:00").toLocaleDateString("ar", { month: "short", day: "numeric", calendar: "gregory" }),
      rate,
    }));

  if (points.length < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-5 flex items-center gap-3">
          <LineChartIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            سيظهر الرسم البياني لاتجاه الأسعار بعد أكثر من تحديث للأسعار على المنصة.
          </p>
        </CardContent>
      </Card>
    );
  }

  const first = points[0].rate;
  const last = points[points.length - 1].rate;
  const trendDown = last < first;

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <LineChartIcon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-extrabold text-lg">اتجاه أفضل سعر</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          أفضل نسبة منشورة في كل تحديث —{" "}
          {trendDown
            ? <span className="text-emerald-600 font-bold">الأسعار في نزول 📉</span>
            : last > first
            ? <span className="text-amber-600 font-bold">الأسعار في صعود</span>
            : <span className="font-bold">الأسعار مستقرة</span>}
        </p>
        <div dir="ltr" className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={["dataMin - 0.3", "dataMax + 0.3"]}
                tickFormatter={(v: number) => `${v}٪`}
              />
              <Tooltip
                formatter={(value) => [`${value}٪`, "أفضل نسبة"]}
                labelFormatter={(label) => String(label)}
              />
              <Line type="monotone" dataKey="rate" stroke="hsl(160 84% 39%)" strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(160 84% 39%)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
