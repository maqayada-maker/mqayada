import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HeartPulse, ArrowLeft, RefreshCcw, CheckCircle2, AlertTriangle, ShieldAlert, GraduationCap,
} from "lucide-react";

interface Option {
  label: string;
  points: number;
}

interface Question {
  q: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    q: "كم تبلغ نسبة أقساطك الشهرية من دخلك؟",
    options: [
      { label: "أقل من 20٪", points: 3 },
      { label: "بين 20٪ و 33٪", points: 2 },
      { label: "بين 33٪ و 50٪", points: 1 },
      { label: "أكثر من 50٪", points: 0 },
    ],
  },
  {
    q: "هل لديك مدخرات تغطي مصاريفك الأساسية عند الطوارئ؟",
    options: [
      { label: "نعم، 6 أشهر أو أكثر", points: 3 },
      { label: "تكفي 3-6 أشهر", points: 2 },
      { label: "تكفي أقل من 3 أشهر", points: 1 },
      { label: "لا توجد مدخرات", points: 0 },
    ],
  },
  {
    q: "هل تعرف نسبة الربح الفعلية (APR) على تمويلك الحالي؟",
    options: [
      { label: "نعم، وأعرف هل هي ثابتة أم متناقصة", points: 3 },
      { label: "أعرف النسبة تقريباً", points: 2 },
      { label: "لا أعرفها بدقة", points: 1 },
      { label: "ليس لدي فكرة", points: 0 },
    ],
  },
  {
    q: "كيف تتعامل مع بطاقتك الائتمانية؟",
    options: [
      { label: "أسدد كامل المبلغ شهرياً / لا أستخدم بطاقة", points: 3 },
      { label: "أسدد أكثر من الحد الأدنى غالباً", points: 2 },
      { label: "أسدد الحد الأدنى فقط", points: 1 },
      { label: "أتأخر في السداد أحياناً", points: 0 },
    ],
  },
  {
    q: "هل قارنت أكثر من عرض قبل آخر تمويل حصلت عليه؟",
    options: [
      { label: "نعم، قارنت 3 جهات أو أكثر", points: 3 },
      { label: "قارنت جهتين", points: 2 },
      { label: "اكتفيت بعرض واحد", points: 1 },
      { label: "لم أحصل على تمويل من قبل", points: 2 },
    ],
  },
  {
    q: "هل تدخر أو تستثمر جزءاً من دخلك شهرياً؟",
    options: [
      { label: "نعم، بانتظام (10٪ أو أكثر)", points: 3 },
      { label: "أدخر أحياناً حسب الظروف", points: 2 },
      { label: "نادراً", points: 1 },
      { label: "لا أدخر إطلاقاً", points: 0 },
    ],
  },
];

const MAX_POINTS = QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map(o => o.points)), 0);

function getResult(score: number) {
  const pct = Math.round((score / MAX_POINTS) * 100);
  if (pct >= 75) {
    return {
      pct,
      title: "صحتك المالية ممتازة",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      bar: "bg-emerald-500",
      advice: [
        "استمر على نفس النهج — التزاماتك تحت السيطرة ولديك وعي جيد بشروط تمويلك.",
        "راقب تبويب «أفضل عرض سعر» دورياً؛ حتى مع وضع ممتاز، مقايضة تمويل قديم بنسبة أقل قد توفر لك آلاف الريالات.",
        "فكّر في رفع نسبة الادخار أو تنويع استثماراتك لتعزيز أمانك المالي طويل المدى.",
      ],
    };
  }
  if (pct >= 45) {
    return {
      pct,
      title: "صحتك المالية جيدة — مع فرص للتحسين",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      bar: "bg-amber-500",
      advice: [
        "اعرف نسبة الربح الفعلية (APR) على كل التزاماتك — هذه أول خطوة لأي تحسين.",
        "إذا كانت أقساطك تتجاوز ثلث دخلك، ادرس مقايضة تمويلك الحالي بنسبة أقل لتخفيف القسط الشهري.",
        "ابدأ بمدخرات طوارئ صغيرة وثابتة (حتى 5٪ من الدخل) — الانتظام أهم من المبلغ.",
        "اقرأ مقالات ركن التوعية المالية عن مقارنة العروض وأخطاء المقارنة الشائعة.",
      ],
    };
  }
  return {
    pct,
    title: "صحتك المالية تحتاج انتباهاً عاجلاً",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    bar: "bg-red-500",
    advice: [
      "ابدأ بجرد كامل: كل أقساطك ونسبها وتواريخها — لا يمكن إصلاح ما لا تعرفه.",
      "إذا كانت أقساطك تستهلك نصف دخلك أو أكثر، فمقايضة التمويل بنسبة أقل قد تكون الخطوة الأهم لتخفيف الضغط الشهري.",
      "تجنب أي تمويل إضافي أو شراء بالتقسيط قبل ترتيب وضعك الحالي.",
      "سدد أكثر من الحد الأدنى لبطاقتك الائتمانية كلما أمكن — فوائدها من الأعلى في السوق.",
      "استعن بمحتوى ركن التوعية المالية لفهم حقوقك وخياراتك.",
    ],
  };
}

export default function FinancialHealth() {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const score = answers.reduce<number>((s, a, i) => s + (a !== null ? QUESTIONS[i].options[a].points : 0), 0);
  const result = getResult(score);
  const Icon = result.icon;

  const reset = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
          <HeartPulse className="w-4 h-4" />
          مؤشر الصحة المالية
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">قِس صحتك المالية في دقيقتين</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          6 أسئلة سريعة تعطيك درجة وتوصيات عملية — إجاباتك لا تُحفظ ولا تُرسل لأي جهة.
        </p>
      </div>

      {!submitted ? (
        <>
          <div className="space-y-5 mb-8">
            {QUESTIONS.map((q, qi) => (
              <Card key={qi}>
                <CardContent className="p-5 sm:p-6">
                  <p className="font-extrabold mb-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-black ml-2">{qi + 1}</span>
                    {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                          className={`text-right px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            size="lg"
            className="w-full h-14 text-lg rounded-2xl gap-2"
            disabled={!allAnswered}
            onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            {allAnswered ? "اعرض نتيجتي" : `أجب على جميع الأسئلة (${answers.filter(a => a !== null).length}/${QUESTIONS.length})`}
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <Card className={`border ${result.bg}`}>
            <CardContent className="p-6 sm:p-8 text-center">
              <Icon className={`w-12 h-12 mx-auto mb-4 ${result.color}`} />
              <p className="text-sm text-muted-foreground font-semibold mb-1">درجتك</p>
              <p className={`text-5xl font-black mb-2 ${result.color}`}>{result.pct}<span className="text-2xl">/100</span></p>
              <h2 className="text-xl font-extrabold mb-4">{result.title}</h2>
              <div className="w-full bg-white/70 rounded-full h-3 overflow-hidden border border-border" dir="ltr">
                <div className={`h-full ${result.bar} transition-all`} style={{ width: `${result.pct}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-extrabold text-lg mb-4">توصيات مخصصة لك</h3>
              <ul className="space-y-3">
                {result.advice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/awareness">
              <Button variant="outline" size="lg" className="w-full gap-1.5 rounded-2xl">
                <GraduationCap className="w-5 h-5" /> ركن التوعية المالية
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full gap-1.5 rounded-2xl" onClick={reset}>
              <RefreshCcw className="w-5 h-5" /> أعد الاختبار
            </Button>
          </div>

          <Link href="/apply">
            <Button size="lg" className="w-full h-14 text-lg rounded-2xl gap-2 mt-2">
              اطلب عروض مقايضة لتمويلك <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-8 text-center leading-relaxed">
        هذا الاختبار توعوي عام ولا يُعد استشارة مالية شخصية. النتيجة تقديرية بناءً على إجاباتك فقط.
      </p>
    </div>
  );
}
