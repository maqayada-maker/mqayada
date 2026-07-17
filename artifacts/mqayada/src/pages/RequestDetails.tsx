import { useState } from "react";
import { useRoute } from "wouter";
import { useGetRequest, useGetRequestOffers, useAcceptOffer, getGetRequestQueryKey, getGetRequestOffersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, FileText, CheckCircle2, Trophy, TrendingDown, Clock, Building, Percent, Calendar, Sparkles, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const OFFER_FEATURE_LABELS: Record<string, { label: string }> = {
  free_card_first_year: { label: "بطاقة ائتمانية مجانية السنة الأولى" },
  free_card_lifetime: { label: "بطاقة ائتمانية مجانية مدى الحياة" },
  no_admin_fees: { label: "بدون رسوم إدارية" },
  installment_deferral: { label: "تأجيل الأقساط متاح" },
  early_payoff_discount: { label: "خصم على السداد المبكر" },
  free_takaful: { label: "تأمين تكافلي مجاني" },
};

function savingsAmount(currentDebt: number, currentMonths: number, offerTotal: number) {
  const currentTotal = currentDebt;
  const saving = currentTotal - offerTotal;
  return saving;
}

function RequestTimeline({ request, offers }: { request: any, offers: any[] }) {
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mt-6">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="font-bold text-sm">
          {request.status === "expired" ? "انتهت المهلة (٢٤ ساعة) دون استجابة" : "الطلب مغلق"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 w-full overflow-x-auto mt-2">
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

export default function RequestDetails() {
  const [, params] = useRoute("/requests/:id");
  const requestId = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: request, isLoading: reqLoading } = useGetRequest(requestId, { query: { enabled: !!requestId, queryKey: getGetRequestQueryKey(requestId) } });
  const { data: offers, isLoading: offersLoading } = useGetRequestOffers(requestId, { query: { enabled: !!requestId, queryKey: getGetRequestOffersQueryKey(requestId) } });

  const { mutate: acceptOffer, isPending } = useAcceptOffer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/requests", requestId] });
        queryClient.invalidateQueries({ queryKey: ["/api/requests", requestId, "offers"] });
      }
    }
  });

  const [sortConfig, setSortConfig] = useState<{ key: "profitRate" | "monthlyInstallment" | "totalAmount", direction: "asc" | "desc" }>({
    key: "profitRate",
    direction: "asc"
  });

  if (reqLoading) return (
    <div className="p-20 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-full bg-muted animate-pulse mx-auto mb-4" />
      <p className="text-muted-foreground animate-pulse">جارٍ التحميل...</p>
    </div>
  );
  if (!request) return <div className="p-20 text-center" dir="rtl">الطلب غير موجود.</div>;

  const isRequestActive = request.status === 'active' || request.status === 'pending';
  const allOffers = offers ? [...offers] : [];
  const activeOffers = allOffers.filter(o => o.status !== "rejected");
  const sortedOffers = [...activeOffers].sort((a, b) => a.profitRate - b.profitRate);
  const bestOfferId = sortedOffers[0]?.id;

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

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "outline" }> = {
    pending: { label: "قيد المراجعة", variant: "warning" },
    active: { label: "يستقبل عروض", variant: "secondary" },
    awaiting_admin: { label: "بانتظار اعتماد الإدارة", variant: "warning" },
    approved: { label: "تمت الموافقة", variant: "success" },
    closed: { label: "مغلق", variant: "outline" },
  };
  const statusInfo = statusConfig[request.status] ?? { label: request.status, variant: "outline" };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">

      <Link href="/">
        <Button variant="ghost" className="mb-8 -ms-4 text-muted-foreground hover:text-foreground gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Button>
      </Link>

      {/* Request Summary */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-extrabold">طلب تمويل #{request.id}</h1>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <p className="text-muted-foreground">تفاصيل طلبك والعروض المقدّمة من المستشارين المعتمدين</p>
      </div>

      <RequestTimeline request={request} offers={allOffers} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-6">
        {/* Info Card */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "جهة العمل", value: request.employer, icon: Building },
            { label: "الراتب الشهري", value: formatCurrency(request.salary), icon: TrendingDown },
            { label: "البنك الحالي", value: request.bankName, icon: FileText },
            { label: "الأشهر المتبقية", value: `${request.remainingMonths} شهر`, icon: Calendar },
            { label: "حالة الطلب", value: statusInfo.label, icon: Clock },
            { label: "عدد العروض", value: `${request.offersCount} عرض`, icon: Trophy },
          ].map((item, i) => (
            <Card key={i} className="bg-white border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
                <p className="font-bold text-foreground text-sm">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Debt Highlight */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-transparent shadow-xl">
          <CardContent className="p-8 text-center flex flex-col justify-center h-full">
            <p className="text-primary-foreground/70 text-sm mb-2 font-medium">مبلغ المديونية الحالي</p>
            <h2 className="text-3xl font-black mb-4">{formatCurrency(request.currentDebt)}</h2>
            {sortedOffers[0] && (
              <>
                <div className="h-px bg-white/20 mb-4" />
                <p className="text-primary-foreground/70 text-xs mb-1">أفضل عرض متاح</p>
                <p className="text-2xl font-black text-white">{sortedOffers[0].profitRate}٪</p>
                <p className="text-primary-foreground/60 text-xs mt-1">نسبة ربح</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offers */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          عروض المستشارين
          <Badge variant="outline" className="bg-white font-bold">{sortedOffers.length} عرض</Badge>
        </h2>
      </div>

      {offersLoading ? (
        <div className="grid gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : sortedOffers.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد عروض حتى الآن</h3>
            <p className="text-muted-foreground text-sm">
              يراجع المستشارون طلبك حالياً. ستصلك العروض خلال ٢٤–٧٢ ساعة.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {/* Comparison Table / Sortable Grid */}
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm mb-4">
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
                    const isChosen = offer.status === 'client_accepted' || offer.status === 'approved';
                    
                    return (
                      <tr key={offer.id} className={`hover:bg-muted/20 transition-colors ${isChosen ? 'bg-emerald-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-bold flex items-center gap-2">
                            {offer.advisorName}
                            {isChosen && <Badge variant="default" className="bg-emerald-600">تم الاختيار</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">{offer.advisorCompany}</div>
                          {((offer as { features?: string[] }).features ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {((offer as { features?: string[] }).features ?? []).map((f) => {
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
                          {offer.status === 'approved' ? (
                            <div className="text-xs font-bold text-emerald-600">معتمد</div>
                          ) : offer.status === 'client_accepted' ? (
                            <div className="text-xs font-bold text-amber-600">بانتظار الإدارة</div>
                          ) : isRequestActive ? (
                            <Button
                              onClick={() => acceptOffer({ id: offer.id })}
                              disabled={isPending}
                              variant={isBestRate ? "default" : "outline"}
                              size="sm"
                              className="font-bold"
                            >
                              اختيار
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <h5 className="font-bold text-sm text-muted-foreground">تفاصيل العروض</h5>
          {sortedTableOffers.map((offer, rank) => {
            const isBest = offer.id === bestOfferId && sortedOffers.length > 1;
            const isChosen = offer.status === 'client_accepted' || offer.status === 'approved';
            const saving = savingsAmount(request.currentDebt, request.remainingMonths, offer.totalAmount);

            return (
              <Card
                key={offer.id}
                className={`transition-all duration-300 relative ${
                  isChosen
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-50 shadow-lg"
                    : isBest
                    ? "border-primary ring-2 ring-primary/15 shadow-lg"
                    : "hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {isBest && !isChosen && (
                  <div className="absolute -top-3 right-6 flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-md">
                    <Trophy className="w-3 h-3" />
                    أفضل عرض
                  </div>
                )}
                {isChosen && (
                  <div className="absolute -top-3 right-6 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    {offer.status === 'approved' ? 'تم اعتماد هذا العرض' : 'اخترتَ هذا العرض'}
                  </div>
                )}

                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      rank === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      #{rank + 1}
                    </div>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-5">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">المستشار</p>
                        <p className="font-bold text-sm">{offer.advisorName}</p>
                        <p className="text-xs text-muted-foreground">{offer.advisorCompany}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">نسبة الربح</p>
                        <div className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-primary" />
                          <p className="font-black text-xl text-primary">{offer.profitRate}٪</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">القسط الشهري</p>
                        <p className="font-bold">{formatCurrency(offer.monthlyInstallment)}</p>
                        <p className="text-xs text-muted-foreground">{offer.durationMonths} شهر</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">إجمالي التمويل</p>
                        <p className="font-bold">{formatCurrency(offer.totalAmount)}</p>
                        {saving > 0 && (
                          <p className="text-xs font-semibold text-green-600 mt-0.5">
                            توفير {formatCurrency(saving)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="w-full md:w-auto flex-shrink-0">
                      {offer.status === 'approved' ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          معتمد
                        </div>
                      ) : offer.status === 'client_accepted' ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-200">
                          <Clock className="w-4 h-4" />
                          بانتظار الإدارة
                        </div>
                      ) : isRequestActive ? (
                        <Button
                          onClick={() => acceptOffer({ id: offer.id })}
                          disabled={isPending}
                          variant={isBest ? "default" : "outline"}
                          className="w-full md:w-40 font-bold"
                        >
                          اختيار هذا العرض
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {offer.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">ملاحظة المستشار: </span>
                        {offer.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
