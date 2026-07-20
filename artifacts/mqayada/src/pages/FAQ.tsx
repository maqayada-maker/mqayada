import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, GraduationCap } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "هل منصة مقايضة مرخصة؟",
    a: "المنصة حالياً في مرحلة التوعية المالية والمشاركة في المسابقات، وجارٍ العمل على استكمال متطلبات الترخيص من الجهات المختصة. خلال هذه المرحلة نقدم محتوى توعوياً وأسعاراً استرشادية، وبعد الحصول على الترخيص سيتم تفعيل الربط المباشر مع المستشارين المرخصين لتقديم العروض الفعلية.",
  },
  {
    q: "هل استخدام المنصة مجاني؟",
    a: "نعم، التسجيل ورفع الطلبات ومقارنة العروض ومتابعة الأسعار كلها مجانية للعملاء بالكامل. لا توجد أي رسوم خفية.",
  },
  {
    q: "كيف تعمل فكرة «المقايضة»؟",
    a: "ترفع طلبك ببيانات تمويلك الحالي، فيتنافس المستشارون على تقديم أفضل عرض إعادة تمويل لك بنسبة أقل. أنت تقارن العروض جنباً إلى جنب وتختار الأنسب، ثم تتواصل مباشرة مع المستشار لإتمام الإجراءات.",
  },
  {
    q: "من هم المستشارون على المنصة؟",
    a: "مستشارون ماليون يتقدمون بطلب انضمام وتُراجع ملفاتهم إدارياً وفق معايير الانضمام المعلنة. بعد اكتمال مرحلة الترخيص، سيقتصر تقديم العروض الفعلية على المستشارين المستوفين للمتطلبات النظامية.",
  },
  {
    q: "هل الأسعار المعروضة في «أفضل عرض سعر» ملزمة للبنوك؟",
    a: "لا — هي أسعار استرشادية مأخوذة من آخر تحديثات أسعار البنوك وتُعرض لغرض التوعية والمقارنة. العرض النهائي يعتمد على ملفك الائتماني وسياسة جهة التمويل وقت التقديم.",
  },
  {
    q: "كيف تُحمى بياناتي الشخصية؟",
    a: "بياناتك تُخزّن بشكل آمن وتُستخدم فقط لغرض معالجة طلبك وعرضه على المستشارين المعنيين. لا نبيع بياناتك لأي طرف ثالث. يمكنك الاطلاع على التفاصيل الكاملة في سياسة الخصوصية.",
  },
  {
    q: "ما هو تنبيه السعر المستهدف وكيف أفعّله؟",
    a: "من تبويب «أفضل عرض سعر» في لوحتك، حدّد النسبة التي تتمناها (مثلاً 3.5٪). عند نزول سعر أي بنك إلى هدفك أو أقل، يصلك إشعار فوري على المنصة وإشعار متصفح إذا كانت الإشعارات مفعّلة.",
  },
  {
    q: "كيف أتابع حالة طلبي؟",
    a: "من لوحة «طلباتي» ترى حالة كل طلب لحظياً: قيد الانتظار، نشط مع عدد العروض المستلمة، أو معتمد. عند وصول عرض جديد أو اعتماد طلبك يصلك تنبيه في جرس الإشعارات.",
  },
  {
    q: "هل يمكنني إلغاء طلبي أو تعديله؟",
    a: "نعم، يمكنك إدارة طلباتك من لوحتك. وإذا واجهت أي مشكلة يمكنك رفع شكوى أو ملاحظة من نفس اللوحة وسيتابعها فريق الإدارة.",
  },
];

function FaqCard({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full text-right p-5 flex items-center gap-3 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="flex-1 font-bold text-base">{item.q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <CardContent className="pt-0 pb-5 px-5">
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed border-t border-border pt-4">{item.a}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
          <HelpCircle className="w-4 h-4" />
          الأسئلة الشائعة
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">كل ما تريد معرفته عن مقايضة</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          إجابات مباشرة وشفافة عن الترخيص، الخصوصية، وآلية عمل المنصة.
        </p>
      </div>

      <div className="space-y-3 mb-10">
        {FAQS.map((f, i) => <FaqCard key={i} item={f} />)}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <GraduationCap className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-extrabold text-lg mb-1">تريد أن تفهم التمويل أكثر؟</h3>
          <p className="text-sm text-muted-foreground mb-4">زر ركن التوعية المالية — مقالات مبسطة عن قراءة العروض والنسب والمقارنة الذكية.</p>
          <Link href="/awareness">
            <Button className="gap-1.5">ركن التوعية المالية <ArrowLeft className="w-4 h-4" /></Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
