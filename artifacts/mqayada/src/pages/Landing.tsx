import { useState, useEffect } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { markDealSeen } from "@/lib/dealsSeen";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FileText, Users, Scale, CheckCircle, ShieldCheck, TrendingUp, Lock, Sparkles,
  ChevronDown, ChevronUp, ArrowLeft, BarChart3, Award, Megaphone, ExternalLink, Building2, Calculator,
  Brain, Heart, GraduationCap, Trophy, Network
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BestPriceAd {
  id: number;
  product: string;
  bankName: string;
  profitRate: number;
  sponsorshipAmount: number;
}

interface Sponsor {
  id: number;
  name: string;
  logoUrl: string | null;
  website: string | null;
}


const faqs = [
  {
    q: "هل خدمة المنصة مجانية؟",
    a: "نعم، تقديم الطلب والحصول على العروض مجاني تماماً للعميل. لا رسوم مقدّمة ولا اشتراكات — نحن نربح من رسوم صغيرة تدفعها المؤسسات المالية فقط عند إتمام الصفقة."
  },
  {
    q: "كيف تُحمى بياناتي الشخصية؟",
    a: "هويتك تبقى مجهولة تماماً طوال مرحلة العروض. المستشارون يرون ملفك المالي فقط (الراتب، المديونية، المدة) — دون اسمك أو رقم جوالك أو أي بيانات شخصية. لا تُشارَك بياناتك الكاملة إلا بعد موافقتك الصريحة وبعد مراجعة الإدارة."
  },
  {
    q: "من هم المستشارون على المنصة؟",
    a: "جميع المستشارين على منصة مقايضة موظفون في البنوك السعودية العاملة والمرخّصة من ساما. كل مستشار يمر بعملية تحقق دقيقة قبل الانضمام."
  },
  {
    q: "كم من الوقت يستغرق الحصول على عروض؟",
    a: "في الغالب تبدأ العروض تصل خلال ٢٤-٧٢ ساعة من تقديم طلبك. المستشارون يتنافسون على الفور لتقديم أفضل عروضهم."
  },
  {
    q: "هل أنا ملزم بقبول أي عرض؟",
    a: "لا، بالطبع لا. أنت حر تماماً في رفض جميع العروض إن لم تناسبك. لا يوجد أي التزام أو ضغط من أي طرف."
  },
  {
    q: "ما أنواع التمويل التي تغطيها المنصة؟",
    a: "تغطي المنصة إعادة تمويل القروض الشخصية، والتمويل العقاري، وتوحيد المديونيات، وتمويل السيارات — لجميع المواطنين والمقيمين العاملين في القطاعين الحكومي والخاص."
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-right gap-4 hover:text-primary transition-colors"
      >
        <span className="font-bold text-base text-foreground">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>
      <p
        className="text-muted-foreground leading-relaxed text-sm overflow-hidden transition-all duration-200"
        style={open ? { maxHeight: "500px", paddingBottom: "1.25rem", visibility: "visible" } : { maxHeight: 0, paddingBottom: 0, visibility: "hidden" }}
        aria-hidden={!open}
      >
        {a}
      </p>
    </div>
  );
}

function FinancingCalculator() {
  const [principal, setPrincipal] = useState<string>("300000");
  const [currentRate, setCurrentRate] = useState<string>("4");
  const [newRate, setNewRate] = useState<string>("2.5");
  const [months, setMonths] = useState<string>("60");

  const p = parseFloat(principal) || 0;
  const rOld = parseFloat(currentRate) || 0;
  const rNew = parseFloat(newRate) || 0;
  const m = parseInt(months) || 0;

  let currentInstallment = 0;
  let newInstallment = 0;
  let monthlyDiff = 0;
  let totalSavings = 0;

  if (p > 0 && rOld >= 0 && rNew >= 0 && m > 0) {
    const totalOld = p + p * (rOld / 100) * (m / 12);
    const totalNew = p + p * (rNew / 100) * (m / 12);
    currentInstallment = totalOld / m;
    newInstallment = totalNew / m;
    monthlyDiff = Math.max(0, currentInstallment - newInstallment);
    totalSavings = Math.max(0, totalOld - totalNew);
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <section className="py-24 bg-muted/30 border-y border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <Calculator className="w-4 h-4" />
            حاسبة التوفير
          </p>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">كم ستوفر عند مقايضة تمويلك؟</h2>
          <p className="text-xl text-muted-foreground">أدخل بيانات مديونيتك الحالية وشاهد الفرق عندما تتنافس البنوك على تقديم نسبة أفضل لك.</p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="principal" className="text-base font-bold">المبلغ المتبقي من المديونية (ر.س)</Label>
                <Input 
                  id="principal" 
                  type="number" 
                  step="any"
                  inputMode="decimal"
                  value={principal} 
                  onChange={(e) => setPrincipal(e.target.value)} 
                  className="text-lg h-14"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="months" className="text-base font-bold">الأشهر المتبقية</Label>
                <Input 
                  id="months" 
                  type="number" 
                  step="1"
                  inputMode="numeric"
                  value={months} 
                  onChange={(e) => setMonths(e.target.value)} 
                  className="text-lg h-14"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="currentRate" className="text-base font-bold">نسبتك الحالية (٪)</Label>
                  <Input 
                    id="currentRate" 
                    type="number" 
                    step="any"
                    inputMode="decimal"
                    value={currentRate} 
                    onChange={(e) => setCurrentRate(e.target.value)} 
                    className="text-lg h-14"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="newRate" className="text-base font-bold">النسبة بعد المقايضة (٪)</Label>
                  <Input 
                    id="newRate" 
                    type="number" 
                    step="any"
                    inputMode="decimal"
                    value={newRate} 
                    onChange={(e) => setNewRate(e.target.value)} 
                    className="text-lg h-14"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                النسبة بعد المقايضة تقديرية — على المنصة يتنافس المستشارون فعلياً على تقديم أقل نسبة ممكنة لملفك.
              </p>
            </div>

            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col justify-center">
              <div className="space-y-8">
                <div>
                  <p className="text-muted-foreground text-sm font-semibold mb-2">إجمالي التوفير المتوقع</p>
                  <p className="text-5xl font-black text-primary tracking-tight">{formatCurrency(totalSavings)} <span className="text-xl font-bold text-primary/70">ر.س</span></p>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-primary/10">
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold mb-2">قسطك الحالي</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(currentInstallment)} ر.س</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold mb-2">قسطك بعد المقايضة</p>
                    <p className={`text-xl font-bold ${newInstallment <= currentInstallment ? "text-emerald-600" : "text-foreground"}`}>{formatCurrency(newInstallment)} ر.س</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
                  <p className="text-sm font-bold text-emerald-700">
                    توفير شهري يصل إلى {formatCurrency(monthlyDiff)} ر.س
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-primary/10">
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  * هذه الأرقام استرشادية فقط بناءً على نسبة ربح ثابتة، ولا تعتبر عرضاً تمويلياً ملزماً.
                </p>
                <Link href="/apply">
                  <Button size="lg" className="w-full gap-2 h-14 text-lg rounded-2xl">
                    احصل على عروض فعلية
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const hackathonTracks = [
  {
    icon: Brain,
    title: "الذكاء الاصطناعي التوليدي للتقنية المالية",
    desc: "حلول تعتمد على التوليد الذكي مثل المساعدين الماليين والتقارير.",
    covered: "مساعد مالي ذكي يحلّل العروض المقدّمة للعميل ويوصي بالأنسب له مع شرح الأسباب والتنبيهات.",
    future: "توليد تقارير مالية شخصية، ومحادثة ذكية تجيب عن أسئلة العميل حول التمويل وإعادة الهيكلة.",
  },
  {
    icon: Heart,
    title: "تجربة العميل",
    desc: "تحسين تجربة المستخدم عبر التخصيص والتحليل الذكي.",
    covered: "مقارنة العروض جنباً إلى جنب، تتبّع حالة الطلب لحظياً، تواصل فوري مع المستشار، وحاسبة تمويل تفاعلية.",
    future: "واجهة تتكيّف مع سلوك العميل وتنبيهات ذكية بأفضل توقيت لإعادة التمويل.",
  },
  {
    icon: ShieldCheck,
    title: "التشريعات المالية",
    desc: "حلول للامتثال وإدارة المخاطر واكتشاف الاحتيال.",
    covered: "التحقق من هوية المستشارين، إخفاء هوية العميل طوال مرحلة العروض، تحذيرات أمنية، وإشراف إداري على كل صفقة.",
    future: "كشف آلي للعروض المشبوهة ومطابقة الإجراءات مع ضوابط ساما.",
  },
  {
    icon: GraduationCap,
    title: "التعليم المالي",
    desc: "منصات لرفع الوعي المالي باستخدام الذكاء الاصطناعي.",
    covered: "حاسبة تمويل توضيحية وقسم أسئلة شائعة يشرح المفاهيم المالية ببساطة.",
    future: "محتوى تعليمي مخصّص بالذكاء الاصطناعي يوضّح الفروق بين العروض ومخاطر المديونية.",
  },
  {
    icon: Network,
    title: "المصرفية المفتوحة",
    desc: "دمج وتحليل البيانات المالية من مصادر متعددة.",
    covered: "تجميع عروض من عدة بنوك ومستشارين في مكان واحد لمقارنة شفافة وفورية.",
    future: "ربط بيانات الحسابات عبر واجهات البنوك المفتوحة للتحقق التلقائي من الدخل والالتزامات.",
  },
  {
    icon: Trophy,
    title: "التلعيب",
    desc: "استخدام الألعاب لتحفيز السلوك المالي.",
    covered: "لوحة متصدرين ومستهدفات ونظام أداء للمستشارين يحفّز المنافسة على تقديم أفضل العروض للعميل.",
    future: "شارات ومستويات ومكافآت للعملاء عند اتخاذ قرارات مالية أذكى.",
  },
];

function HackathonTracks() {
  return (
    <section id="hackathon" className="py-24 bg-muted/30 border-y border-border/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            هاكاثون أمد
          </p>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">مساراتنا في هاكاثون أمد</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            تشارك منصة مقايضة في المسارات الستة للهاكاثون. لكل مسار نوضّح ما تغطيه المنصة اليوم
            والمقترحات التي يمكن تغطيتها مستقبلاً.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathonTracks.map((t, idx) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="flex flex-col rounded-3xl bg-white border border-border/60 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <t.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold leading-tight text-foreground">{t.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
              <div className="space-y-3 mt-auto">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> ما تغطيه المنصة الآن
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{t.covered}</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" /> مقترحات مستقبلية
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{t.future}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  usePageMeta({
    title: "سوق التمويل الشخصي في السعودية",
    description: "قارن عروض التمويل الشخصي والعقاري من أفضل البنوك السعودية عبر منصة مقايضة. تقديم مجاني، سرية تامة، ومستشارون معتمدون من ساما.",
    path: "/",
  });


  const [bestPriceAds, setBestPriceAds] = useState<BestPriceAd[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/best-price-ads`).then(r => r.ok ? r.json() : []).then(setBestPriceAds).catch(() => {});
    fetch(`${BASE_URL}/api/sponsors`).then(r => r.ok ? r.json() : []).then(setSponsors).catch(() => {});
  }, []);

  // The homepage shows the best-price ads, so visiting it marks them seen for signed-in clients.
  useEffect(() => {
    markDealSeen("best_price");
  }, []);

  const steps = [
    {
      title: "طلب مجهول الهوية",
      desc: "أدخل بياناتك المالية والوظيفية بسرية. هويتك محمية — المستشارون يرون ملفك المالي فقط.",
      icon: FileText,
    },
    {
      title: "مزايدة تنافسية",
      desc: "يتنافس المستشارون المعتمدون على تقديم أفضل العروض لطلبك المجهول.",
      icon: Users,
    },
    {
      title: "مقارنة ذكية",
      desc: "قارن العروض بسهولة في لوحتك. تحليلاتنا تُوضح التوفير الفعلي من كل عرض.",
      icon: Scale,
    },
    {
      title: "تواصل مباشر وآمن",
      desc: "بعد اختيارك للعرض، تصل بياناتك مباشرة للمستشار ليتواصل معك ويُتمّ التمويل.",
      icon: CheckCircle,
    },
  ];

  const comparison = [
    { feature: "عدد العروض المتاحة", with: "٥–٢٠ عرض تنافسي", without: "١–٢ عروض من بنكك الحالي" },
    { feature: "الجهد المبذول", with: "طلب واحد فقط", without: "زيارات متعددة للبنوك" },
    { feature: "خصوصية البيانات", with: "مجهول الهوية بالكامل", without: "بياناتك الكاملة لدى كل بنك" },
    { feature: "الشفافية", with: "مقارنة لحظية بين العروض", without: "صعوبة المقارنة الدقيقة" },
    { feature: "الرقابة والموثوقية", with: "إشراف إدارة المنصة", without: "لا رقابة مستقلة" },
    { feature: "التكلفة على العميل", with: "مجانية تماماً", without: "قد تكون هناك رسوم استشارية" },
  ];

  const ldJson = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "منصة مقايضة",
      "alternateName": "Maqayada",
      "url": "https://www.maqayada.com",
      "logo": "https://www.maqayada.com/images/logo.png",
      "description": "سوق التمويل الشخصي الأول في المملكة العربية السعودية — يتنافس المستشارون الماليون المعتمدون من ساما على تقديم أفضل عروض التمويل لك بسرية تامة.",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "maqayada@maqayada.com",
        "contactType": "customer service",
        "areaServed": "SA",
        "availableLanguage": "Arabic"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Saudi Arabia"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": a
        }
      }))
    }
  ]);

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="w-full h-full object-cover opacity-20 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6 tracking-wide">
              <Sparkles className="w-4 h-4" />
              السوق الأول في المملكة لمقايضة التمويل
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              تفاوض بذكاء.
              <br />
              <span className="text-gradient">وفّر أكثر.</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              منصة مقايضة توصّلك بمستشارين ماليين معتمدين يتنافسون على أفضل عروض التمويل لك —{" "}
              <strong className="text-foreground/80">بسرية تامة وبدون عناء.</strong>
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" className="w-full sm:w-auto px-12 text-lg gap-2">
                  ابدأ مجاناً — هويتك محمية
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/disclaimer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-12 text-lg bg-white">
                  تطبق الشروط والأحكام
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              لا رسوم مقدّمة · لا بيانات شخصية تُشارَك دون موافقتك · مجهول الهوية طوال مرحلة العروض
            </p>
            <a
              href="#hackathon"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              نشارك في هاكاثون أمد — تعرّف على مساراتنا الستة
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>


      {/* ── Hackathon Amd tracks ── */}
      <HackathonTracks />

      {/* ── Best Price Ads ── */}
      {bestPriceAds.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                <Award className="w-4 h-4" />
                أفضل الأسعار اليوم
              </p>
              <h2 className="text-4xl font-extrabold text-foreground mb-4">عروض بأقل نسب الربح</h2>
              <p className="text-xl text-muted-foreground">أبرز عروض التمويل المتاحة حالياً من البنوك السعودية.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestPriceAds.map((ad, idx) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative p-6 rounded-3xl bg-white border border-border/60 hover:shadow-xl transition-all duration-300 group overflow-hidden"
                >
                  {ad.sponsorshipAmount > 0 && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      عرض مُموّل
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{ad.bankName}</p>
                  <h3 className="text-lg font-bold text-foreground mb-3">{ad.product}</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-primary">{ad.profitRate}٪</span>
                    <span className="text-sm text-muted-foreground">نسبة الربح</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/apply">
                <Button size="lg" className="px-10 gap-2">
                  احصل على عرضك الخاص
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Financing Calculator ── */}
      <FinancingCalculator />

      {/* ── How it works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-xl text-muted-foreground">أربع خطوات مصمّمة لضمان أمانك وأفضل نتيجة.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative p-8 rounded-3xl bg-background border border-border/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="absolute -top-6 -right-4 text-7xl font-black text-primary/5 select-none pointer-events-none group-hover:scale-110 transition-transform">
                  0{idx + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform">
                  <step.icon size={28} />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-4 py-1.5 rounded-full mb-4">المقارنة</p>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">مقايضة مقابل الطريقة التقليدية</h2>
            <p className="text-xl text-muted-foreground">الفرق واضح — ولصالحك دائماً.</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border shadow-lg">
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-5 font-bold text-muted-foreground text-sm">الميزة</div>
              <div className="p-5 font-black text-primary text-center bg-primary/5 border-x border-border">
                <Sparkles className="w-4 h-4 inline mb-1 mr-1" />
                مع مقايضة
              </div>
              <div className="p-5 font-bold text-muted-foreground text-center text-sm">بدون مقايضة</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                <div className="p-5 text-sm font-semibold text-foreground">{row.feature}</div>
                <div className="p-5 text-center bg-primary/5 border-x border-border">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {row.with}
                  </span>
                </div>
                <div className="p-5 text-center">
                  <span className="text-sm text-muted-foreground">{row.without}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — Why Choose Us ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-4 py-1.5 rounded-full mb-4">المميزات</p>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">لماذا تختار منصة مقايضة؟</h2>
            <p className="text-xl text-muted-foreground">ليست منصة تمويل عادية — بل سوق ذكي يعمل لصالحك.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "تنافس استثنائي",
                desc: "بدلاً من التسوق بين البنوك واحداً تلو الآخر، يتنافس عشرات المستشارين المعتمدين على كسب ملفك. هذا التنافس المباشر هو ما يضمن حصولك على أفضل نسبة ربح.",
                icon: TrendingUp,
                color: "from-blue-500 to-primary",
              },
              {
                title: "ذكاء يُبسّط القرار",
                desc: "تحلّل منصتنا كل عرض مقدّم لك، وتُقيّم مدى ملاءمته لوضعك، وتعرض لك توفيرك الفعلي — حتى يكون قرارك مبنياً على بيانات لا تخمينات.",
                icon: BarChart3,
                color: "from-purple-500 to-violet-600",
              },
              {
                title: "أمان لا تهاون فيه",
                desc: "هويتك مجهولة طوال مرحلة العروض. بياناتك لا تُشارَك إلا بعد موافقتك الصريحة وبعد مراجعة بشرية من إدارة المنصة.",
                icon: Lock,
                color: "from-emerald-500 to-teal-600",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className={`w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <feature.icon size={34} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Official Sponsors ── */}
      <section className="py-20 bg-background border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <Building2 className="w-4 h-4" />
              شركاؤنا
            </p>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">الرعاة الرسميون</h2>
            <p className="text-xl text-muted-foreground">جهات تثق بمنصة مقايضة وتدعم رحلتك نحو أفضل تمويل.</p>
          </div>

          {sponsors.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
              {sponsors.map((s) => {
                const card = (
                  <div className="flex items-center justify-center h-28 w-48 rounded-2xl bg-white border border-border/60 hover:shadow-lg transition-all p-5 group">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className="max-h-16 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <span className="text-lg font-bold text-foreground text-center">{s.name}</span>
                    )}
                  </div>
                );
                return s.website ? (
                  <a key={s.id} href={s.website} target="_blank" rel="noopener noreferrer" title={s.name}>{card}</a>
                ) : (
                  <div key={s.id} title={s.name}>{card}</div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mb-12">كن أول الرعاة الرسميين لمنصة مقايضة.</p>
          )}

          <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 p-8 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5 text-primary">
              <Megaphone size={28} />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-3">أعلن معنا</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              وصّل علامتك التجارية لآلاف الباحثين عن التمويل في المملكة. كن راعياً رسمياً أو اعرض منتجاتك في أبرز مساحات المنصة.
            </p>
            <a href="mailto:maqayada@maqayada.com?subject=طلب%20إعلان%20على%20منصة%20مقايضة">
              <Button size="lg" className="px-10 gap-2">
                <Megaphone className="w-5 h-5" />
                تواصل معنا للإعلان
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary bg-primary/10 inline-block px-4 py-1.5 rounded-full mb-4">الأسئلة الشائعة</p>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">أجوبة على أكثر أسئلتك شيوعاً</h2>
          </div>
          <div className="bg-background rounded-3xl border border-border p-2 px-6">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
