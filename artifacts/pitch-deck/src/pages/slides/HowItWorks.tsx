export default function HowItWorks() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          أربع خطوات من الطلب إلى إتمام إعادة التمويل
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid flex-1 grid-cols-4 gap-[2vw]">
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2vw]">
            <span className="text-[4.5vw] font-extrabold leading-none text-primary">
              1
            </span>
            <p className="mt-[2.5vh] text-[2.5vw] font-semibold text-text">
              التقديم
            </p>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.4] text-muted">
              العميل يُدخل بياناته التمويلية ويحدّد أولوياته.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2vw]">
            <span className="text-[4.5vw] font-extrabold leading-none text-primary">
              2
            </span>
            <p className="mt-[2.5vh] text-[2.5vw] font-semibold text-text">
              المنافسة
            </p>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.4] text-muted">
              الجهات المرخّصة تقدّم عروضها خلال نافذة زمنية محددة.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2vw]">
            <span className="text-[4.5vw] font-extrabold leading-none text-primary">
              3
            </span>
            <p className="mt-[2.5vh] text-[2.5vw] font-semibold text-text">
              الاختيار
            </p>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.4] text-muted">
              العميل يقارن العروض المجهولة المصدر ويقبل الأنسب.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border-2 border-accent bg-panel p-[2vw]">
            <span className="text-[4.5vw] font-extrabold leading-none text-accent">
              4
            </span>
            <p className="mt-[2.5vh] text-[2.5vw] font-semibold text-text">
              الإتمام
            </p>
            <p className="mt-[1.6vh] text-[2.3vw] leading-[1.4] text-muted">
              تُكشف الهوية للطرفين لإكمال التعاقد، وتُحصّل المنصة عمولتها عند
              النجاح.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          رحلة موحّدة تحمي هوية العميل حتى لحظة القبول
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 4 / 17</span>
      </div>
    </div>
  );
}
