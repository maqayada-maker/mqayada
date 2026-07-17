export default function UnitEconomics() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          كل صفقة ناجحة تولّد عائداً موجباً بهامش مرتفع
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4vh] overflow-hidden rounded-[0.8vw] border border-line">
          <div className="flex items-center justify-between bg-panel px-[2.6vw] py-[2.2vh]">
            <span className="text-[2.5vw] text-text">متوسط قيمة التمويل المُعاد</span>
            <span className="text-[2.5vw] font-semibold text-text">150,000 ريال</span>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-bg px-[2.6vw] py-[2.2vh]">
            <span className="text-[2.5vw] text-text">عمولة المنصة (0.75%)</span>
            <span className="text-[2.5vw] font-semibold text-text">≈ 1,125 ريال</span>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-panel px-[2.6vw] py-[2.2vh]">
            <span className="text-[2.5vw] text-text">تكلفة الاستحواذ على العميل *</span>
            <span className="text-[2.5vw] font-semibold text-text">− 400 ريال</span>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-bg px-[2.6vw] py-[2.2vh]">
            <span className="text-[2.5vw] text-text">تكاليف تشغيلية لكل صفقة *</span>
            <span className="text-[2.5vw] font-semibold text-text">− 150 ريال</span>
          </div>
          <div className="flex items-center justify-between border-t-2 border-accent bg-accent/10 px-[2.6vw] py-[2.4vh]">
            <span className="text-[2.6vw] font-extrabold text-text">
              هامش المساهمة لكل صفقة
            </span>
            <span className="text-[2.6vw] font-extrabold text-accent">
              ≈ 575 ريال (≈ 51% من العمولة)
            </span>
          </div>
        </div>

        <p className="mt-[2.6vh] text-[2.2vw] leading-[1.4] text-muted">
          * افتراضات توضيحية تُعدّل وفق بيانات التشغيل الفعلية، ولا تشمل رسوم
          الاستعلام الائتماني (سمة وسمتي) إذ تتحمّلها الجهة التمويلية وفق تشريعات
          ساما.
        </p>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          ملاحظة: سيناريو توضيحي قائم على افتراضات، وليست أرقاماً فعلية
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 10 / 17</span>
      </div>
    </div>
  );
}
