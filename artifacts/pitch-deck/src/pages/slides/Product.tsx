export default function Product() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[7vw] pt-[8vh] pb-[10vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          منصة محايدة تخدم طرفي السوق عبر واجهتين متكاملتين
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[5vh] grid flex-1 grid-cols-2 gap-[3vw]">
          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.6vw]">
            <p className="text-[2.7vw] font-extrabold text-primary">
              بوابة العميل
            </p>
            <div className="mt-[3vh] flex flex-col gap-[2.4vh]">
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  طلب موحّد لإعادة التمويل
                </p>
              </div>
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  مقارنة ذكية للعروض
                </p>
              </div>
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  تتبّع حالة الطلب لحظياً
                </p>
              </div>
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-accent" />
                <p className="text-[2.5vw] font-semibold leading-[1.4] text-text">
                  حماية كاملة للهوية حتى القبول
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-[0.8vw] border border-line bg-panel p-[2.6vw]">
            <p className="text-[2.7vw] font-extrabold text-primary">
              بوابة الجهة التمويلية
            </p>
            <div className="mt-[3vh] flex flex-col gap-[2.4vh]">
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  وصول لطلبات حقيقية ومؤهّلة
                </p>
              </div>
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  تقديم عروض تنافسية
                </p>
              </div>
              <div className="flex items-start gap-[1.2vw]">
                <span className="mt-[1.4vh] block h-[0.8vw] w-[0.8vw] shrink-0 rounded-[0.15vw] bg-primary" />
                <p className="text-[2.5vw] leading-[1.4] text-text">
                  لوحة تحليلات وأداء
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[7vw] left-[7vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          حياد المنصة عن الجهات أساسٌ لبناء ثقة الطرفين
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 5 / 17</span>
      </div>
    </div>
  );
}
