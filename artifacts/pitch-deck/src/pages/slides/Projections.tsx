export default function Projections() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          مسار نمو من المرحلة التجريبية إلى التعادل في السنة الثالثة
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid flex-1 grid-cols-3 items-end gap-[2.6vw] pb-[1vh]">
          <div className="flex h-[40vh] flex-col justify-between rounded-[0.8vw] border border-line bg-panel p-[2vw]">
            <div>
              <span className="text-[2.3vw] font-semibold text-accent">
                السنة الأولى
              </span>
              <p className="mt-[1.4vh] text-[3.4vw] font-extrabold leading-none text-text">
                500–1,000
              </p>
              <p className="mt-[1vh] text-[2.2vw] text-muted">مستخدم</p>
            </div>
            <p className="text-[2.2vw] leading-[1.35] text-text">
              مرحلة تجريبية مُدارة
            </p>
          </div>

          <div className="flex h-[48vh] flex-col justify-between rounded-[0.8vw] border border-line bg-panel p-[2vw]">
            <div>
              <span className="text-[2.3vw] font-semibold text-accent">
                السنة الثانية
              </span>
              <p className="mt-[1.4vh] text-[3.4vw] font-extrabold leading-none text-text">
                10,000
              </p>
              <p className="mt-[1vh] text-[2.2vw] text-muted">مستخدم</p>
            </div>
            <p className="text-[2.2vw] leading-[1.35] text-text">توسّع تجاري</p>
          </div>

          <div className="flex h-[56vh] flex-col justify-between rounded-[0.8vw] border-2 border-accent bg-accent/10 p-[2vw]">
            <div>
              <span className="text-[2.3vw] font-semibold text-accent">
                السنة الثالثة
              </span>
              <p className="mt-[1.4vh] text-[3.4vw] font-extrabold leading-none text-text">
                +50,000
              </p>
              <p className="mt-[1vh] text-[2.2vw] text-muted">مستخدم</p>
            </div>
            <p className="text-[2.2vw] font-semibold leading-[1.35] text-accent">
              تحقيق التعادل المالي
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          ملاحظة: توقعات تخطيطية قائمة على افتراضات تُحدَّث ببيانات فعلية
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 11 / 17</span>
      </div>
    </div>
  );
}
