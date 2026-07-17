export default function Problem() {
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
          إعادة التمويل اليوم مكلفة وغير شفافة ومنحازة لمصلحة المموّل
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4vh] flex flex-1 flex-col justify-center gap-[2.6vh]">
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.5vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-primary" />
            <p className="text-[2.7vw] leading-[1.4] text-text">
              العميل يبحث يدوياً ويفاوض كل جهة على حدة دون مرجع موحّد للمقارنة.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.5vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-primary" />
            <p className="text-[2.7vw] leading-[1.4] text-text">
              عدم تماثل المعلومات: الجهة التمويلية تملك البيانات، والعميل يقبل ما
              يُعرض عليه.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.5vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-primary" />
            <p className="text-[2.7vw] leading-[1.4] text-text">
              مغادرة المموّل الحالي معقّدة ومكلفة بسبب ارتفاع تكاليف التحوّل.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.5vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-primary" />
            <p className="text-[2.7vw] leading-[1.4] text-text">
              بمجرد مشاركة بياناته، يُغرَق العميل بالمكالمات التسويقية.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.5vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-accent" />
            <p className="text-[2.7vw] font-semibold leading-[1.4] text-text">
              النتيجة: التزامات بشروط أعلى من اللازم، وارتفاع الدين الأسري إلى
              31.6% من الناتج المحلي.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          المصدر: البنك المركزي السعودي، الربع الثاني 2025
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 2 / 17</span>
      </div>
    </div>
  );
}
