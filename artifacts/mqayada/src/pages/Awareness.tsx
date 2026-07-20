import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ChevronDown, ChevronUp, GraduationCap, HeartPulse,
  HelpCircle, Calculator, ArrowLeft, Lightbulb,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string;
  body: string[];
}

const ARTICLES: Article[] = [
  {
    id: "read-offer",
    title: "كيف تقرأ عرض التمويل بشكل صحيح؟",
    summary: "لا تنظر إلى القسط الشهري فقط — هذه العناصر الأربعة تحدد التكلفة الحقيقية.",
    body: [
      "عند استلام أي عرض تمويلي، ركّز على أربعة عناصر: نسبة الربح السنوية، معدل النسبة السنوي (APR) الذي يشمل الرسوم، إجمالي المبلغ الذي ستدفعه في نهاية المدة، والرسوم الإدارية.",
      "القسط الشهري المنخفض قد يخفي مدة أطول وتكلفة إجمالية أعلى. قارن دائماً «إجمالي ما ستدفعه» بين العروض وليس القسط فقط.",
      "اطلب من جهة التمويل جدول السداد التفصيلي قبل التوقيع — من حقك معرفة نصيب كل قسط من أصل المبلغ والأرباح.",
    ],
  },
  {
    id: "flat-vs-declining",
    title: "الفرق بين النسبة الثابتة والمتناقصة",
    summary: "نفس الرقم قد يعني تكلفة مختلفة تماماً حسب طريقة الاحتساب.",
    body: [
      "النسبة الثابتة تُحسب على كامل مبلغ التمويل طوال المدة، حتى بعد سدادك جزءاً كبيراً منه. النسبة المتناقصة تُحسب على الرصيد المتبقي فقط، فتقل الأرباح كلما سددت.",
      "قاعدة تقريبية: نسبة ثابتة 4٪ تعادل تقريباً نسبة متناقصة تتراوح بين 7٪ و8٪ — لذلك لا تقارن نسبة ثابتة بمتناقصة مباشرة.",
      "اسأل دائماً: «هل هذه النسبة ثابتة أم متناقصة؟» ثم اطلب معدل النسبة السنوي (APR) لتوحيد أساس المقارنة.",
    ],
  },
  {
    id: "when-refinance",
    title: "متى تستحق مقايضة (إعادة تمويل) مديونيتك؟",
    summary: "ليست كل مقايضة مربحة — إليك متى تكون الخطوة صحيحة.",
    body: [
      "المقايضة تستحق عندما يكون الفرق بين نسبتك الحالية والنسبة الجديدة كبيراً بما يكفي لتغطية أي رسوم سداد مبكر أو رسوم إدارية جديدة، ويبقى بعدها توفير حقيقي.",
      "كلما كانت المدة المتبقية أطول والمبلغ المتبقي أكبر، زادت جدوى المقايضة حتى مع فرق نسبة صغير.",
      "استخدم حاسبة التوفير في المنصة لتقدير التوفير المتوقع بأرقامك الفعلية قبل اتخاذ القرار، ولا تنسَ سؤال جهة تمويلك الحالية عن رسوم السداد المبكر.",
    ],
  },
  {
    id: "dbr",
    title: "نسبة الاستقطاع الشهري — خط الأمان لالتزاماتك",
    summary: "كم يجب ألا تتجاوز أقساطك من راتبك الشهري؟",
    body: [
      "نسبة الاستقطاع (DBR) هي مجموع أقساطك الشهرية مقسوماً على دخلك الشهري. الجهات التنظيمية في المملكة تضع حدوداً قصوى لهذه النسبة لحماية المقترضين.",
      "كقاعدة عامة، حافظ على التزاماتك الشهرية تحت 33٪ من دخلك إن أمكن — هذا يترك مساحة للطوارئ والادخار.",
      "قبل أي تمويل جديد، اجمع كل أقساطك الحالية (تمويل شخصي، عقاري، بطاقات ائتمانية) واحسب النسبة بنفسك. إذا اقتربت من الحد الأعلى، فكّر في المقايضة لتخفيض القسط بدل تمويل إضافي.",
    ],
  },
  {
    id: "your-rights",
    title: "حقوقك عند التعامل مع جهات التمويل",
    summary: "أهم الحقوق التي كفلتها لك الأنظمة ولوائح حماية العملاء.",
    body: [
      "من حقك الحصول على نسخة كاملة من العقد وملحقاته، وفهم كل بند قبل التوقيع، ومهلة كافية لمراجعة العرض دون ضغط.",
      "من حقك معرفة معدل النسبة السنوي (APR) وكامل الرسوم مقدماً، وأي تغيير على شروط العقد يجب إشعارك به.",
      "عند أي خلاف، ابدأ بقنوات الشكاوى لدى جهة التمويل نفسها، وإن لم يُحل يمكنك التصعيد للجهات التنظيمية المختصة بحماية عملاء القطاع المالي.",
    ],
  },
  {
    id: "common-mistakes",
    title: "أخطاء شائعة عند مقارنة عروض التمويل",
    summary: "خمسة أخطاء يقع فيها كثيرون — تجنبها لتقارن بذكاء.",
    body: [
      "الخطأ الأول: مقارنة القسط الشهري فقط وتجاهل المدة والتكلفة الإجمالية. الخطأ الثاني: مقارنة نسبة ثابتة بنسبة متناقصة دون توحيد الأساس.",
      "الخطأ الثالث: تجاهل الرسوم الإدارية ورسوم السداد المبكر — قد تلتهم جزءاً كبيراً من التوفير. الخطأ الرابع: التوقيع على أول عرض دون مقارنة عدة جهات.",
      "الخطأ الخامس: عدم قراءة بند التأمين المصاحب للتمويل — أحياناً تكون تكلفته مضمّنة في القسط وترفع التكلفة الفعلية. اطلب تفصيلها دائماً.",
    ],
  },
];

function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full text-right p-5 sm:p-6 flex items-start gap-4 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base sm:text-lg mb-1">{article.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />}
      </button>
      {open && (
        <CardContent className="pt-0 pb-6 px-5 sm:px-6">
          <div className="border-t border-border pt-4 space-y-3 pr-14">
            {article.body.map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-foreground/80 leading-relaxed">{p}</p>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Awareness() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
          <GraduationCap className="w-4 h-4" />
          ركن التوعية المالية
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">افهم تمويلك قبل أن توقّع</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          محتوى توعوي مبسّط يساعدك على قراءة العروض ومقارنتها واتخاذ قرارات مالية أذكى —
          جزء من رسالة منصة مقايضة في مرحلة التوعية المالية.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {ARTICLES.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center">
            <HeartPulse className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-extrabold mb-1">مؤشر صحتك المالية</h3>
            <p className="text-sm text-muted-foreground mb-4">اختبار سريع من 6 أسئلة يعطيك درجة وتوصيات عملية.</p>
            <Link href="/financial-health">
              <Button variant="outline" className="w-full gap-1.5">ابدأ الاختبار <ArrowLeft className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center">
            <Calculator className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-extrabold mb-1">حاسبة التوفير</h3>
            <p className="text-sm text-muted-foreground mb-4">شاهد كم قد توفر عند مقايضة تمويلك الحالي.</p>
            <Link href="/#calculator">
              <Button variant="outline" className="w-full gap-1.5">جرّب الحاسبة <ArrowLeft className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center">
            <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-extrabold mb-1">الأسئلة الشائعة</h3>
            <p className="text-sm text-muted-foreground mb-4">إجابات مباشرة عن الترخيص والخصوصية وآلية عمل المنصة.</p>
            <Link href="/faq">
              <Button variant="outline" className="w-full gap-1.5">تصفح الأسئلة <ArrowLeft className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-900 leading-relaxed flex items-start gap-3">
        <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          هذا المحتوى توعوي عام ولا يُعد استشارة مالية أو ائتمانية شخصية.
          لكل حالة ظروفها — استشر مختصاً مرخصاً قبل اتخاذ قرارات تمويلية كبيرة.
        </p>
      </div>
    </div>
  );
}
