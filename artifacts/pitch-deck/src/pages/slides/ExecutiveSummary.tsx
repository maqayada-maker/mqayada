export default function ExecutiveSummary() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.2vw] font-extrabold leading-[1.15] text-text">
          الملخص التنفيذي
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[3vh] flex flex-1 flex-col justify-center gap-[2vh]">
          <div className="flex items-start gap-[1.6vw]">
            <span className="w-[3vw] shrink-0 text-[2.6vw] font-extrabold text-primary">
              01
            </span>
            <p className="text-[2.6vw] leading-[1.3] text-text">
              مقايضة منصة رقمية محايدة تقلب معادلة التمويل: الجهات المرخّصة تتنافس
              لتقديم أفضل عرض لإعادة تمويل العميل.
            </p>
          </div>
          <div className="flex items-start gap-[1.6vw]">
            <span className="w-[3vw] shrink-0 text-[2.6vw] font-extrabold text-primary">
              02
            </span>
            <p className="text-[2.6vw] leading-[1.3] text-text">
              يبقى العميل مجهول الهوية حتى يقبل عرضاً، دون مكالمات تسويقية ودون
              رسوم مقدّمة عليه.
            </p>
          </div>
          <div className="flex items-start gap-[1.6vw]">
            <span className="w-[3vw] shrink-0 text-[2.6vw] font-extrabold text-primary">
              03
            </span>
            <p className="text-[2.6vw] leading-[1.3] text-text">
              السوق المستهدف محفظة قابلة لإعادة التمويل تتجاوز 570 مليار ريال،
              ضمن سوق ائتمان استهلاكي يقارب 1.5 تريليون ريال.
            </p>
          </div>
          <div className="flex items-start gap-[1.6vw]">
            <span className="w-[3vw] shrink-0 text-[2.6vw] font-extrabold text-primary">
              04
            </span>
            <p className="text-[2.6vw] leading-[1.3] text-text">
              نموذج الدخل عمولة نجاح من الجهة التمويلية بنسبة 0.5–1% إضافة إلى
              اشتراكات.
            </p>
          </div>
          <div className="flex items-start gap-[1.6vw]">
            <span className="w-[3vw] shrink-0 text-[2.6vw] font-extrabold text-primary">
              05
            </span>
            <p className="text-[2.6vw] leading-[1.3] text-text">
              المنصة في طور الانضمام إلى البيئة التشريعية التجريبية للبنك المركزي
              السعودي.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          المصدر: البنك المركزي السعودي؛ IMARC (2025)
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 1 / 17</span>
      </div>
    </div>
  );
}
