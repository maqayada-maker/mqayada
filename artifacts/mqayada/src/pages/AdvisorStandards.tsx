import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

const criteria = [
  {
    category: "الانتماء المؤسسي والتفويض النظامي",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
    items: [
      "الانتماء إلى جهة مرخّصة من البنك المركزي السعودي (ساما) أو أي جهة رقابية مختصة",
      "التفويض النظامي لممارسة النشاط ذي الصلة بالتمويل أو الاستشارات المالية في المملكة العربية السعودية",
      "سريان الصفة النظامية والمهنية وعدم إيقافها أو إلغائها من أي جهة مختصة",
    ],
  },
  {
    category: "الامتثال التنظيمي والمهني",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
    items: [
      "الالتزام بالأنظمة والتعليمات ذات العلاقة الصادرة عن الجهات الرقابية السعودية",
      "الامتثال لمتطلبات مكافحة غسل الأموال وتمويل الإرهاب وفق الأطر التنظيمية المعمول بها",
      "الالتزام باشتراطات حماية بيانات العملاء وضمان سريتها وفق الأنظمة النافذة",
      "عدم صدور إجراءات تنظيمية أو قضائية بحق المستشار تؤثر على أهليته المهنية",
    ],
  },
  {
    category: "الإفصاح والشفافية",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
    items: [
      "الإفصاح بشفافية كاملة عن الرسوم وأي عمولات أو مبالغ مستحقة للعملاء",
      "الإفصاح الفوري عن أي تعارض مصالح محتمل مع العملاء المقدّمين عبر المنصة",
      "تزويد المنصة بالمستندات النظامية المطلوبة لإثبات الأهلية والتفويض المهني",
    ],
  },
  {
    category: "الامتثال لسياسات المنصة",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
    items: [
      "الامتثال لسياسات المنصة الخاصة بحماية العملاء ومعالجة شكاواهم",
      "الالتزام بمستويات الخدمة المحددة من حيث وقت الاستجابة وجودة العروض المقدّمة",
      "الالتزام بأي تحديثات أو تعليمات تصدرها إدارة المنصة وفق ما تقتضيه المتطلبات التنظيمية",
    ],
  },
];

const process = [
  { step: "١", title: "تقديم الطلب", desc: "أكمل نموذج التسجيل وأدخل بياناتك المهنية ومعلومات جهتك." },
  { step: "٢", title: "المراجعة", desc: "تراجع إدارة المنصة بياناتك خلال ٢–٥ أيام عمل." },
  { step: "٣", title: "التحقق", desc: "نتحقق من الصفة النظامية والمهنية وسريانها مع الجهات المختصة." },
  { step: "٤", title: "التفعيل", desc: "يُفعَّل حسابك وتبدأ استقبال ملفات العملاء فوراً." },
];

export default function AdvisorStandards() {
  usePageMeta({
    title: "معايير الانضمام للمستشارين الماليين",
    description: "تعرّف على شروط ومعايير انضمام المستشارين الماليين إلى منصة مقايضة. نقبل فقط المستشارين الموظفين في بنوك سعودية مرخّصة من ساما.",
    path: "/advisor-standards",
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-gradient-to-bl from-primary/5 via-background to-background border-b border-border/50 pt-16 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            وفق أنظمة البنك المركزي السعودي (ساما)
          </span>
          <h1 className="text-4xl font-black text-foreground mb-4">شروط الانضمام كمستشار</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            تشترط منصة مقايضة أن يكون كل مستشار منتميًا إلى جهة مرخّصة أو مخوّلًا نظاميًا لممارسة النشاط ذي الصلة في المملكة، وأن تكون صفته النظامية والمهنية سارية وغير موقوفة.
          </p>
        </div>
      </div>

      {/* Criteria */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        {criteria.map((section) => (
          <div key={section.category} className={`rounded-2xl border ${section.border} bg-white overflow-hidden`}>
            <div className={`flex items-center gap-3 px-6 py-4 ${section.color} bg-opacity-30 border-b ${section.border}`}>
              <span className={`p-2 rounded-xl ${section.color} bg-opacity-100`}>{section.icon}</span>
              <h2 className="font-bold text-foreground text-base">{section.category}</h2>
            </div>
            <ul className="divide-y divide-border/50">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-4 text-sm text-foreground leading-relaxed">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Process */}
      <div className="bg-muted/40 border-y border-border/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-foreground text-center mb-10">مراحل قبول المستشار</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {process.map((p) => (
              <div key={p.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center mx-auto mb-3">
                  {p.step}
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-900 leading-relaxed">
          <strong className="block mb-1">تنبيه مهم:</strong>
          تحتفظ منصة مقايضة بالحق في إيقاف أو إلغاء عضوية أي مستشار في حال توقف صفته النظامية أو المهنية، أو ثبوت مخالفته لأي من الشروط أعلاه، أو صدور إجراء تنظيمي بحقه من ساما أو الجهات الرقابية المختصة.
        </div>

        <div className="mt-10 text-center">
          <Link href="/register">
            <Button size="lg" className="px-12 text-base">
              سجّل الآن كمستشار
            </Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">سيتم مراجعة طلبك خلال ٢–٥ أيام عمل</p>
        </div>
      </div>

    </div>
  );
}
