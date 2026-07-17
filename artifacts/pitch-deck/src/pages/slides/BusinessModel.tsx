export default function BusinessModel() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          مصدرا دخل: عمولة نجاح من الجهة التمويلية واشتراكات
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4.5vh] grid grid-cols-2 gap-[3vw]">
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.6vw] font-extrabold text-primary">
              عمولة النجاح
            </p>
            <p className="mt-[2vh] text-[2.4vw] leading-[1.4] text-muted">
              0.5–1% من قيمة التمويل، تُحصّل من الجهة الفائزة عند الإتمام فقط.
            </p>
          </div>
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.4vw]">
            <p className="text-[2.6vw] font-extrabold text-primary">الاشتراكات</p>
            <p className="mt-[2vh] text-[2.4vw] leading-[1.4] text-muted">
              وصول مميّز للطلبات وأدوات تحليلية متقدمة للجهات التمويلية.
            </p>
          </div>
        </div>

        <div className="mt-[4vh] flex flex-col gap-[2.4vh]">
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.4vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-accent" />
            <p className="text-[2.6vw] font-semibold leading-[1.4] text-text">
              لا رسوم على العميل إطلاقاً، ما يعزّز الثقة وحجم الطلب.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.4vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-accent" />
            <p className="text-[2.6vw] font-semibold leading-[1.4] text-text">
              نموذج متوافق مع المصلحة: لا دخل إلا عند نجاح صفقة فعلية للعميل.
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <span className="mt-[1.4vh] block h-[0.9vw] w-[0.9vw] shrink-0 rounded-[0.15vw] bg-accent" />
            <p className="text-[2.6vw] font-semibold leading-[1.4] text-text">
              لا تتحمّل المنصة رسوم الاستعلام الائتماني (سمة وسمتي)؛ تتحمّلها
              الجهة التمويلية المتعاملة مع العميل وفق تشريعات ساما.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          دخل مرتبط بالأداء يحفّز جودة العروض المقدّمة للعميل
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 9 / 17</span>
      </div>
    </div>
  );
}
