import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Bell, BellRing, BellOff, CheckCircle2, FileText, Users, AlertTriangle, Sparkles, Gift, Tag, X } from "lucide-react";
import { getPushState, enablePush, disablePush, type PushState } from "@/lib/push";
import {
  DEAL_SEEN_PARAM,
  DEAL_TYPES,
  DEALS_SEEN_EVENT,
  markDealSeen,
  readDealsSeen,
  type DealType,
} from "@/lib/dealsSeen";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const DISMISS_KEY = "mqayada_dismissed_notifs";

interface NotificationItem {
  type: string;
  count: number;
  label: string;
  link: string;
}

interface BadgeData {
  total: number;
  items: NotificationItem[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  offers: Sparkles,
  approved: CheckCircle2,
  new_requests: FileText,
  client_accepted: CheckCircle2,
  approvals: CheckCircle2,
  advisors: Users,
  client_reports: AlertTriangle,
  advisor_reports: AlertTriangle,
  annual_offers: Gift,
  best_price: Tag,
};

const TYPE_COLORS: Record<string, string> = {
  offers: "text-blue-600 bg-blue-50",
  approved: "text-emerald-600 bg-emerald-50",
  new_requests: "text-primary bg-primary/10",
  client_accepted: "text-violet-600 bg-violet-50",
  approvals: "text-amber-600 bg-amber-50",
  advisors: "text-blue-600 bg-blue-50",
  client_reports: "text-red-600 bg-red-50",
  advisor_reports: "text-orange-600 bg-orange-50",
  annual_offers: "text-fuchsia-600 bg-fuchsia-50",
  best_price: "text-teal-600 bg-teal-50",
};

function readDismissed(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch { return {}; }
}

function writeDismissed(d: Record<string, number>) {
  try { localStorage.setItem(DISMISS_KEY, JSON.stringify(d)); } catch { /* silent */ }
}

export function NotificationBell() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<BadgeData | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Record<string, number>>(() => readDismissed());
  const [pushState, setPushState] = useState<PushState>("disabled");
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    getPushState().then(setPushState).catch(() => {});
  }, []);

  const togglePush = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      setPushState(pushState === "enabled" ? await disablePush() : await enablePush());
    } finally {
      setPushBusy(false);
    }
  };

  const fetchBadge = useCallback(async () => {
    const token = localStorage.getItem("mqayada_token");
    if (!token) return;
    try {
      const seen = readDealsSeen();
      const params = new URLSearchParams();
      for (const type of DEAL_TYPES) {
        if (seen[type]) params.set(DEAL_SEEN_PARAM[type], String(seen[type]));
      }
      const qs = params.toString();
      const res = await fetch(`${BASE}/api/notifications/badge${qs ? `?${qs}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchBadge();
    const id = setInterval(fetchBadge, 30_000);
    // Refetch immediately when a deal is marked seen (e.g. the client visited the
    // annual-offers page or the homepage) so the badge clears without waiting for poll.
    window.addEventListener(DEALS_SEEN_EVENT, fetchBadge);
    return () => {
      clearInterval(id);
      window.removeEventListener(DEALS_SEEN_EVENT, fetchBadge);
    };
  }, [fetchBadge]);

  // Filter out dismissed items where the dismissed count is >= the current count
  const visibleItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter(item => (dismissed[item.type] ?? 0) < item.count);
  }, [data, dismissed]);

  const visibleTotal = useMemo(
    () => visibleItems.reduce((sum, it) => sum + it.count - (dismissed[it.type] ?? 0), 0),
    [visibleItems, dismissed]
  );

  const handleClick = (item: NotificationItem) => {
    if ((DEAL_TYPES as string[]).includes(item.type)) {
      // Deal notifications clear by recording the moment they were seen; markDealSeen
      // dispatches DEALS_SEEN_EVENT which triggers a refetch.
      markDealSeen(item.type as DealType);
    } else {
      // Mark dismissed at the current count
      const next = { ...dismissed, [item.type]: item.count };
      setDismissed(next);
      writeDismissed(next);
    }
    setOpen(false);

    // Navigate to the link
    const target = item.link.startsWith(BASE) || !BASE
      ? item.link.replace(BASE, "") || "/"
      : item.link;
    navigate(target);

    // Scroll to middle of the destination page after navigation settles
    setTimeout(() => {
      const middle = Math.max(0, document.documentElement.scrollHeight / 2 - window.innerHeight / 2);
      window.scrollTo({ top: middle, behavior: "smooth" });
    }, 250);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors"
        title="الإشعارات"
      >
        <Bell className={`w-5 h-5 ${visibleTotal > 0 ? "text-primary" : "text-muted-foreground"}`} />
        {visibleTotal > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none animate-pulse">
            {visibleTotal > 99 ? "99+" : visibleTotal}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            dir="rtl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">الإشعارات</h3>
                {visibleTotal > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {visibleTotal}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {visibleItems.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">لا توجد إشعارات جديدة</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">ستظهر هنا أي تحديثات مهمة</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = TYPE_ICONS[item.type] ?? Bell;
                    const colorClass = TYPE_COLORS[item.type] ?? "text-muted-foreground bg-muted";
                    const remaining = item.count - (dismissed[item.type] ?? 0);
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-right"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-snug">{item.label}</p>
                        </div>
                        <span className="flex-shrink-0 min-w-[28px] h-7 px-2 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                          {remaining}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-border px-3 py-2.5 bg-muted/20 space-y-2">
              {pushState !== "unsupported" && (
                pushState === "denied" ? (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                    <BellOff className="w-3.5 h-3.5" />
                    إشعارات المتصفح محظورة — فعّلها من إعدادات المتصفح
                  </p>
                ) : (
                  <button
                    onClick={togglePush}
                    disabled={pushBusy}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 ${
                      pushState === "enabled"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {pushState === "enabled" ? (
                      <>
                        <BellRing className="w-4 h-4" />
                        {pushBusy ? "جارٍ..." : "إشعارات المتصفح مفعّلة — إيقاف"}
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {pushBusy ? "جارٍ التفعيل..." : "تفعيل إشعارات المتصفح"}
                      </>
                    )}
                  </button>
                )
              )}
              <p className="text-xs text-muted-foreground text-center">يتجدد تلقائياً كل ٣٠ ثانية</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
