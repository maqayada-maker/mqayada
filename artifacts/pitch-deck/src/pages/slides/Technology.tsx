export default function Technology() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2
          className="text-[3.1vw] font-extrabold leading-[1.15] text-text"
          style={{ textWrap: "balance" }}
        >
          بنية سحابية آمنة قائمة على المطابقة الفورية وإخفاء الهوية
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid flex-1 grid-cols-2 grid-rows-2 gap-[2.6vw]">
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.5vw] font-extrabold text-primary">
              محرك مطابقة فوري
            </p>
            <p className="mt-[1.8vh] text-[2.3vw] leading-[1.4] text-muted">
              ربط آني بين طلبات العملاء وعروض الجهات التمويلية.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.5vw] font-extrabold text-primary">
              طبقة إخفاء الهوية
            </p>
            <p className="mt-[1.8vh] text-[2.3vw] leading-[1.4] text-muted">
              تحمي بيانات العميل بالكامل حتى لحظة قبول العرض.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.5vw] font-extrabold text-primary">
              واجهات برمجية آمنة
            </p>
            <p className="mt-[1.8vh] text-[2.3vw] leading-[1.4] text-muted">
              للتكامل مع أنظمة الجهات والسجل الائتماني وخدمات التحقق.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.5vw] font-extrabold text-primary">
              ترتيب ذكي للعروض
            </p>
            <p className="mt-[1.8vh] text-[2.3vw] leading-[1.4] text-muted">
              يرتّب العروض وفق أولويات العميل: القسط والمدة والتكلفة الإجمالية.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          الأمان والخصوصية مصمّمان في صميم البنية التقنية
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 15 / 17</span>
      </div>
    </div>
  );
}
