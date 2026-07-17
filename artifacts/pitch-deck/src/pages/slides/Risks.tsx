export default function Risks() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          المخاطر الجوهرية الخمس لكلٍّ منها إجراء تخفيف قائم
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4vh] overflow-hidden rounded-[0.8vw] border border-line">
          <div className="grid grid-cols-[1fr_1.6fr] bg-text/90 text-bg">
            <div className="px-[2vw] py-[1.8vh] text-[2.3vw] font-semibold">
              المخاطرة
            </div>
            <div className="px-[2vw] py-[1.8vh] text-[2.3vw] font-semibold">
              إجراء التخفيف
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.6fr] border-t border-line bg-panel">
            <div className="px-[2vw] py-[2vh] text-[2.2vw] font-semibold text-text">
              تنظيمي
            </div>
            <div className="px-[2vw] py-[2vh] text-[2.2vw] leading-[1.35] text-muted">
              الانضمام إلى البيئة التجريبية والحصول على الموافقات المسبقة.
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.6fr] border-t border-line bg-bg">
            <div className="px-[2vw] py-[2vh] text-[2.2vw] font-semibold text-text">
              حماية البيانات
            </div>
            <div className="px-[2vw] py-[2vh] text-[2.2vw] leading-[1.35] text-muted">
              التشفير وإطار الأمن السيبراني واختبارات الاختراق الدورية.
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.6fr] border-t border-line bg-panel">
            <div className="px-[2vw] py-[2vh] text-[2.2vw] font-semibold text-text">
              اعتماد السوق
            </div>
            <div className="px-[2vw] py-[2vh] text-[2.2vw] leading-[1.35] text-muted">
              شراكات مبكرة مع جهتين تمويليتين لضمان عروض حقيقية.
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.6fr] border-t border-line bg-bg">
            <div className="px-[2vw] py-[2vh] text-[2.2vw] font-semibold text-text">
              تركّز الشركاء
            </div>
            <div className="px-[2vw] py-[2vh] text-[2.2vw] leading-[1.35] text-muted">
              تنويع تدريجي لقاعدة الجهات التمويلية المشاركة.
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.6fr] border-t border-line bg-panel">
            <div className="px-[2vw] py-[2vh] text-[2.2vw] font-semibold text-text">
              الاحتيال
            </div>
            <div className="px-[2vw] py-[2vh] text-[2.2vw] leading-[1.35] text-muted">
              التحقق من الهوية عبر «نفاذ» ومراجعة السجل الائتماني.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          إدارة استباقية للمخاطر عبر ضوابط تنظيمية وتقنية وتجارية
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 16 / 17</span>
      </div>
    </div>
  );
}
