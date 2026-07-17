import { useEffect, useState } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { markDealSeen } from "@/lib/dealsSeen";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FINANCING_TYPES } from "@/lib/constants";
import { CalendarRange, Sparkles, Tag, Loader2, ArrowLeft, Gift } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AnnualOffer {
  id: number;
  bankName: string;
  title: string;
  terms: string | null;
  profitRate: number | null;
  financingType: string;
  validFrom: string | null;
  validTo: string | null;
  status: string;
  features: string[];
}

function financingLabel(value: string): string {
  return FINANCING_TYPES.find((t) => t.value === value)?.label ?? value;
}

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default function AnnualOffers() {
  usePageMeta({
    title: "عروض البنوك السنوية",
    description: "اطّلع على أحدث العروض التمويلية السنوية من البنوك السعودية المرخّصة. عروض تمويل شخصي وعقاري وسيارات بأفضل نسب الأرباح.",
    path: "/annual-offers",
  });

  const [offers, setOffers] = useState<AnnualOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/annual-offers`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Visiting the annual-offers page marks them seen for signed-in clients.
  useEffect(() => {
    markDealSeen("annual_offers");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-14 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-5">
            <Gift className="w-4 h-4" />
            العروض السنوية
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">عروض البنوك السنوية</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تصفّح أحدث عروض التمويل السنوية المعتمدة من البنوك السعودية — واختر ما يناسبك ثم قدّم طلبك للحصول على أفضل سعر تنافسي.
          </p>
        </div>
      </section>

      <section className="py-14 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : offers.length === 0 ? (
            <Card className="border-dashed border-2 border-border/60 max-w-xl mx-auto">
              <CardContent className="py-16 text-center">
                <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="font-bold text-foreground mb-1">لا توجد عروض سنوية متاحة حالياً</p>
                <p className="text-sm text-muted-foreground mb-6">تابعنا — تُضاف عروض البنوك الجديدة باستمرار.</p>
                <Link href="/apply">
                  <Button className="gap-2">
                    قدّم طلبك الآن
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer, idx) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.08 }}
                >
                  <Card className="h-full border-border/60 hover:shadow-xl transition-all duration-300 flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{offer.bankName}</p>
                          <h3 className="text-lg font-bold text-foreground leading-snug">{offer.title}</h3>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                          {financingLabel(offer.financingType)}
                        </Badge>
                      </div>

                      {offer.profitRate != null && (
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-3xl font-black text-primary">{offer.profitRate}٪</span>
                          <span className="text-sm text-muted-foreground">نسبة الربح</span>
                        </div>
                      )}

                      {offer.terms && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{offer.terms}</p>
                      )}

                      {offer.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {offer.features.map((f, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-full"
                            >
                              <Sparkles className="w-3 h-3 text-primary" />
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
                        {(offer.validFrom || offer.validTo) && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarRange className="w-3.5 h-3.5" />
                            {offer.validFrom && <span>من {formatDate(offer.validFrom)}</span>}
                            {offer.validTo && <span>حتى {formatDate(offer.validTo)}</span>}
                          </p>
                        )}
                        <Link href="/apply">
                          <Button className="w-full gap-2 mt-1">
                            <Tag className="w-4 h-4" />
                            اطلب هذا العرض
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
