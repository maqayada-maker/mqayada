export default function GoToMarket() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          إطلاق مرحلي يبدأ بشراكات الجهات التمويلية ثم التوسّع الرقمي
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid grid-cols-3 gap-[2.4vw]">
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.2vw]">
            <span className="text-[2.2vw] font-semibold text-accent">
              المرحلة الأولى
            </span>
            <p className="mt-[1.8vh] text-[2.4vw] leading-[1.4] text-text">
              التعاقد مع جهتين تمويليتين مرخّصتين على الأقل قبل الإطلاق.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.2vw]">
            <span className="text-[2.2vw] font-semibold text-accent">
              المرحلة الثانية
            </span>
            <p className="mt-[1.8vh] text-[2.4vw] leading-[1.4] text-text">
              إطلاق تجريبي مُدار ضمن البيئة التشريعية للبنك المركزي.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.2vw]">
            <span className="text-[2.2vw] font-semibold text-accent">
              المرحلة الثالثة
            </span>
            <p className="mt-[1.8vh] text-[2.4vw] leading-[1.4] text-text">
              تسويق رقمي مستهدف للموظفين وأصحاب الأعمال الصغيرة.
            </p>
          </div>
        </div>

        <div className="mt-[4.5vh] rounded-[0.8vw] bg-panel border border-line p-[2.2vw]">
          <p className="text-[2.4vw] leading-[1.5] text-text">
            <span className="font-extrabold text-primary">القنوات: </span>
            تسويق الأداء، وشراكات أصحاب العمل، والمحتوى التثقيفي المالي.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          توفّر الجهات أولاً يضمن عروضاً حقيقية للعملاء عند الإطلاق
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 13 / 17</span>
      </div>
    </div>
  );
}
