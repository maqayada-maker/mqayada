export default function WhyNow() {
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
          نمو الائتمان وتوسّع التقنية المالية يخلقان لحظة الإطلاق المثالية
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid flex-1 grid-cols-2 grid-rows-2 gap-[2.4vw]">
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel px-[2.6vw] py-[2vh]">
            <span className="text-[4.6vw] font-extrabold leading-none text-primary">
              68
            </span>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.35] text-muted">
              شركة تمويل مرخّصة (سبتمبر 2025)، ارتفاعاً من 62 في 2024.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel px-[2.6vw] py-[2vh]">
            <span className="text-[4.6vw] font-extrabold leading-none text-primary">
              10.2%
            </span>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.35] text-muted">
              نمو سنوي لائتمان شركات التمويل، 77% منه للأفراد.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel px-[2.6vw] py-[2vh]">
            <span className="text-[4.6vw] font-extrabold leading-none text-accent">
              5.28 مليار $
            </span>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.35] text-muted">
              حجم سوق التقنية المالية المتوقع بحلول 2030 (من 2.85 مليار $).
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-[0.8vw] border border-line bg-panel px-[2.6vw] py-[2vh]">
            <span className="text-[4.6vw] font-extrabold leading-none text-accent">
              79%
            </span>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.35] text-muted">
              من المعاملات في المملكة أصبحت غير نقدية.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          المصدر: البنك المركزي السعودي؛ IMARC؛ تقارير القطاع (2025)
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 8 / 17</span>
      </div>
    </div>
  );
}
