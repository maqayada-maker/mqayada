export default function MarketSize() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          محفظة قابلة لإعادة التمويل تتجاوز 570 مليار ريال
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4.5vh] flex flex-col gap-[3.4vh]">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-[2.5vw] font-semibold text-text">
                السوق الكلي (TAM)
              </span>
              <span className="text-[2.5vw] font-extrabold text-text">
                ≈ 1,500 مليار ريال
              </span>
            </div>
            <div className="mt-[1.4vh] h-[5.5vh] w-full overflow-hidden rounded-[0.5vw] bg-line">
              <div
                className="h-full rounded-[0.5vw] bg-primary/35"
                style={{ width: "100%" }}
              />
            </div>
            <p className="mt-[1vh] text-[2.2vw] text-muted">
              إجمالي التمويل الاستهلاكي في المملكة
            </p>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <span className="text-[2.5vw] font-semibold text-text">
                السوق القابل للخدمة (SAM)
              </span>
              <span className="text-[2.5vw] font-extrabold text-primary">
                ≈ 570 مليار ريال
              </span>
            </div>
            <div className="mt-[1.4vh] h-[5.5vh] w-full overflow-hidden rounded-[0.5vw] bg-line">
              <div
                className="h-full rounded-[0.5vw] bg-primary"
                style={{ width: "38%" }}
              />
            </div>
            <p className="mt-[1vh] text-[2.2vw] text-muted">
              قروض استهلاكية بنكية (469.8 مليار) وائتمان شركات التمويل (99.4
              مليار)
            </p>
          </div>
        </div>

        <div className="mt-[3.6vh] flex items-center gap-[1.6vw] rounded-[0.6vw] border-r-[0.6vw] border-accent bg-panel px-[2.4vw] py-[2vh]">
          <span className="text-[2.4vw] font-extrabold text-accent">
            المستهدف الأولي (SOM)
          </span>
          <span className="text-[2.3vw] leading-[1.35] text-text">
            حصة من عمليات إعادة التمويل القابلة للتحويل عبر الجهات المرخّصة.
          </span>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          المصدر: البنك المركزي السعودي (الربع الثاني 2025)؛ IMARC (2025)
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 7 / 17</span>
      </div>
    </div>
  );
}
