import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

const sections = [
  {
    num: "١",
    title: "طبيعة المنصة والأساس النظامي",
    content: [
      "منصة مقايضة وسيط إلكتروني مرخّص تقتصر وظيفته على ربط طالبي التمويل بمستشارين ماليين معتمدين، دون أن تكون طرفاً في أي عملية تمويلية وفق تعريف نظام مراقبة شركات التمويل الصادر بالمرسوم الملكي رقم (م/51) لعام 1433هـ.",
      "لا تمتلك المنصة ترخيصاً بمزاولة أي نشاط إقراض أو تمويل أو استثمار بموجب الأنظمة الصادرة عن البنك المركزي السعودي (ساما) أو هيئة السوق المالية.",
      "يُشكّل هذا الإخلاء جزءاً لا يتجزأ من اتفاقية الاستخدام ويُفسَّر وفق أحكام النظام السعودي.",
    ],
  },
  {
    num: "٢",
    title: "عدم المسؤولية عن دقة العروض التمويلية",
    content: [
      "العروض التمويلية (نسب الأرباح، المبالغ، المدد، الأقساط، الرسوم) يُعدّها المستشارون والجهات الممولة وتقع مسؤولية دقتها عليهم وحدهم.",
      "أرقام العروض المعروضة تقديرية أولية غير ملزمة؛ التمويل الفعلي يخضع لتقييم الجهة الممولة وكشف بيانات العميل الحقيقية.",
      "لا تضمن المنصة توافق أي عرض مع احتياجات العميل أو ملاءمته وفق المعايير التي تحكمها أنظمة الإفصاح والشفافية.",
    ],
  },
  {
    num: "٣",
    title: "انتفاء الاستشارة المالية والشرعية والقانونية",
    content: [
      "لا يُشكّل أي محتوى أو معلومة أو عرض على المنصة استشارةً مالية أو شرعية أو قانونية مُلزِمة وفق نظام الاستشارات المالية.",
      "يتعين على المستخدم الرجوع إلى مستشار مالي مرخّص وفق أنظمة ساما وهيئة السوق المالية قبل اتخاذ أي قرار مالي.",
      "لا يُشكّل تواجد المستشار على المنصة توصيةً من المنصة به أو ضماناً لكفاءته أو التزامه.",
    ],
  },
  {
    num: "٤",
    title: "مسؤولية المستخدم عن البيانات والقرارات",
    content: [
      "يلتزم المستخدم بتقديم بيانات دقيقة وصحيحة، ويتحمل كامل المسؤولية النظامية عن أي بيانات مضللة يقدمها وفق نظام مكافحة الاحتيال المالي.",
      "المستخدم هو وحده المسؤول عن أي قرار تمويلي يتخذه بناءً على العروض المعروضة، وعليه المراجعة المستقلة للتفاصيل مع الجهة الممولة.",
      "تقديم طلب عبر المنصة لا يُعدّ موافقة من الجهة الممولة ولا يُرتّب أي حق للحصول على التمويل.",
    ],
  },
  {
    num: "٥",
    title: "أمن المعلومات والخصوصية",
    content: [
      "تلتزم المنصة بمعايير أمن المعلومات وفق أفضل الممارسات الدولية وتوجيهات هيئة الأمن السيبراني الوطنية (NCA).",
      "بياناتك الشخصية تُحمى وفق نظام حماية البيانات الشخصية السعودي — راجع سياسة الخصوصية للتفاصيل الكاملة.",
      "لا تستطيع المنصة ضمان أمن شبكات الاتصال العامة المستخدمة في الوصول إليها، ويقع على المستخدم مسؤولية حماية جهازه وبيانات دخوله.",
    ],
  },
  {
    num: "٦",
    title: "حدود المسؤولية وفق النظام",
    content: [
      "إلى الحد الذي يجيزه النظام السعودي، لا تتحمل المنصة مسؤولية أي أضرار مباشرة أو تبعية أو عرضية ناشئة عن استخدام أو عدم القدرة على استخدام الخدمة.",
      "لا تتحمل المنصة مسؤولية قرارات الجهات الممولة برفض الطلبات أو تعديل شروطها أو سحب عروضها.",
      "في حال تعارض إخلاء المسؤولية هذا مع أي نص نظامي ملزم لحماية المستهلك، يسري النص النظامي.",
    ],
  },
  {
    num: "٧",
    title: "التعديلات والنفاذ",
    content: [
      "تحتفظ المنصة بالحق في تعديل هذا الإخلاء مع نشر النسخة المحدّثة وتاريخ سريانها.",
      "استمرار المستخدم في استخدام المنصة بعد نشر التعديل يُعدّ قبولاً ضمنياً للنسخة المحدّثة.",
      "الشكاوى والنزاعات الناشئة تُحال لوزارة التجارة (mc.gov.sa) أو الجهة القضائية المختصة وفق طبيعة النزاع.",
    ],
  },
];

export default function Disclaimer() {
  usePageMeta({
    title: "إخلاء المسؤولية",
    description: "إخلاء المسؤولية القانوني لمنصة مقايضة. المنصة وسيط إلكتروني ولا تُعدّ جهة تمويل أو إقراض. اقرأ الشروط القانونية كاملة.",
    path: "/disclaimer",
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="bg-gradient-to-bl from-primary/5 via-background to-background border-b border-border/50 pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            وفق الأنظمة السعودية — نظام التجارة الإلكترونية ونظام مراقبة شركات التمويل
          </span>
          <h1 className="text-4xl font-black text-foreground mb-3">إخلاء المسؤولية</h1>
          <p className="text-muted-foreground text-sm">آخر تحديث: محرم ١٤٤٦هـ · يوليو ٢٠٢٤م</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        {sections.map((s) => (
          <div key={s.num} className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
              <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0">{s.num}</span>
              <h2 className="font-bold text-foreground text-sm">{s.title}</h2>
            </div>
            <ul className="divide-y divide-border/50">
              {s.content.map((line, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-4 text-sm text-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center pt-2">
          <Link href="/privacy"><span className="hover:text-primary cursor-pointer underline">سياسة الخصوصية</span></Link>
          <span>·</span>
          <Link href="/terms"><span className="hover:text-primary cursor-pointer underline">اتفاقية الاستخدام</span></Link>
          <span>·</span>
          <Link href="/"><span className="hover:text-primary cursor-pointer underline">الرئيسية</span></Link>
        </div>
      </div>
    </div>
  );
}
