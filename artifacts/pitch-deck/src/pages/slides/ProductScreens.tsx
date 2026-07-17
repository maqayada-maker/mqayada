function Chrome({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-[#eef2f7] px-[1.4vw] py-[0.9vh]">
      <span className="text-[1.7vw] font-extrabold text-primary">{label}</span>
      <div className="flex items-center gap-[0.6vw]">
        <span className="block h-[1vw] w-[1vw] rounded-full bg-[#f87171]" />
        <span className="block h-[1vw] w-[1vw] rounded-full bg-[#fbbf24]" />
        <span className="block h-[1vw] w-[1vw] rounded-full bg-[#34d399]" />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-[0.5vw] border border-line bg-bg px-[0.6vw] py-[0.85vh]">
      <span className="text-[2vw] font-extrabold leading-none text-primary">
        {value}
      </span>
      <span className="mt-[0.7vh] text-[1.3vw] leading-tight text-muted">
        {label}
      </span>
    </div>
  );
}

export default function ProductScreens() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[5vw] pt-[3.8vh] pb-[7.5vh]">
        <h2 className="text-[3.1vw] font-extrabold leading-[1.15] text-text">
          المنتج في الواقع: تجربة حيّة لكل طرف
        </h2>
        <div className="mt-[1.2vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[1.2vh] grid grid-cols-2 items-start gap-x-[1.6vw] gap-y-[1vh]">
          {/* 1) Client offers */}
          <div className="flex flex-col overflow-hidden rounded-[0.9vw] border border-line bg-panel shadow-[0_1vh_3vh_rgba(15,23,41,0.08)]">
            <Chrome label="بوابة العميل · مقارنة العروض" />
            <div className="flex flex-1 flex-col gap-[1vh] p-[1.1vw]">
              <div className="rounded-[0.6vw] border-2 border-accent bg-accent/5 p-[1.1vw]">
                <div className="flex items-center justify-between">
                  <span className="text-[1.7vw] font-extrabold text-text">
                    مصرف الراجحي
                  </span>
                  <span className="rounded-full bg-accent px-[0.9vw] py-[0.3vh] text-[1.3vw] font-bold text-white">
                    العرض الأفضل
                  </span>
                </div>
                <div className="mt-[1vh] flex gap-[0.7vw]">
                  <Kpi label="نسبة الربح" value="2.5%" />
                  <Kpi label="القسط الشهري" value="2,500" />
                  <Kpi label="المدة" value="60 ش" />
                </div>
                <div className="mt-[1vh] rounded-[0.5vw] bg-[#e7f6ee] px-[1vw] py-[0.8vh] text-[1.4vw] font-semibold text-[#0f9d58]">
                  يوفّر لك 5,000 ر.س مقارنة بعرض بنكك الحالي
                </div>
              </div>
              <div className="mt-auto rounded-[0.6vw] bg-primary py-[0.9vh] text-center text-[1.6vw] font-bold text-white">
                تأكيد الاختيار وإرسال
              </div>
            </div>
          </div>

          {/* 2) Advisor */}
          <div className="flex flex-col overflow-hidden rounded-[0.9vw] border border-line bg-panel shadow-[0_1vh_3vh_rgba(15,23,41,0.08)]">
            <Chrome label="بوابة الجهة التمويلية · المستشار" />
            <div className="flex flex-1 flex-col gap-[1vh] p-[1.1vw]">
              <div className="flex gap-[0.7vw]">
                <Kpi label="العروض المُرسلة" value="45" />
                <Kpi label="الصفقات" value="12" />
                <Kpi label="معدل التحويل" value="26.7%" />
              </div>
              <div className="rounded-[0.6vw] border border-line bg-bg p-[1.1vw]">
                <div className="flex items-center justify-between">
                  <span className="text-[1.6vw] font-bold text-text">
                    طلب وارد · REQ-1234
                  </span>
                  <span className="rounded-full bg-primary/10 px-[0.8vw] py-[0.3vh] text-[1.3vw] font-bold text-primary">
                    وزارة الصحة
                  </span>
                </div>
                <div className="mt-[0.9vh] flex justify-between text-[1.4vw] text-muted">
                  <span>الراتب 15,000 ر.س</span>
                  <span>نسبة المديونية 45%</span>
                </div>
              </div>
              <div className="mt-auto rounded-[0.6vw] bg-primary py-[0.9vh] text-center text-[1.6vw] font-bold text-white">
                قدّم عرضاً تنافسياً
              </div>
            </div>
          </div>

          {/* 3) Supervisor */}
          <div className="flex flex-col overflow-hidden rounded-[0.9vw] border border-line bg-panel shadow-[0_1vh_3vh_rgba(15,23,41,0.08)]">
            <Chrome label="إشراف الفريق · لوحة المشرف" />
            <div className="flex flex-1 flex-col gap-[1vh] p-[1.1vw]">
              <div className="flex gap-[0.7vw]">
                <Kpi label="متوسط تقييم الفريق" value="4.8" />
                <Kpi label="التمويلات المعتمدة" value="5.2M" />
              </div>
              <div className="overflow-hidden rounded-[0.6vw] border border-line">
                <div className="flex items-center justify-between bg-[#eef2f7] px-[1vw] py-[0.55vh] text-[1.3vw] font-bold text-muted">
                  <span className="flex-1">المستشار</span>
                  <span className="w-[6vw] text-center">عروض</span>
                  <span className="w-[7vw] text-center">الإنجاز</span>
                </div>
                <div className="flex items-center justify-between border-t border-line bg-panel px-[1vw] py-[0.55vh] text-[1.4vw] text-text">
                  <span className="flex-1">سعد الغامدي</span>
                  <span className="w-[6vw] text-center">120</span>
                  <span className="w-[7vw] text-center font-bold text-accent">85%</span>
                </div>
                <div className="flex items-center justify-between border-t border-line bg-panel px-[1vw] py-[0.55vh] text-[1.4vw] text-text">
                  <span className="flex-1">نورة العتيبي</span>
                  <span className="w-[6vw] text-center">98</span>
                  <span className="w-[7vw] text-center font-bold text-accent">78%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4) Calculator */}
          <div className="flex flex-col overflow-hidden rounded-[0.9vw] border border-line bg-panel shadow-[0_1vh_3vh_rgba(15,23,41,0.08)]">
            <Chrome label="حاسبة التمويل · متاحة للجميع" />
            <div className="flex flex-1 gap-[1vw] p-[1.1vw]">
              <div className="flex flex-1 flex-col justify-center gap-[0.9vh]">
                <div className="flex items-center justify-between rounded-[0.5vw] border border-line bg-bg px-[1vw] py-[0.8vh] text-[1.4vw]">
                  <span className="text-muted">مبلغ التمويل</span>
                  <span className="font-bold text-text">100,000</span>
                </div>
                <div className="flex items-center justify-between rounded-[0.5vw] border border-line bg-bg px-[1vw] py-[0.8vh] text-[1.4vw]">
                  <span className="text-muted">نسبة الربح</span>
                  <span className="font-bold text-text">2.5%</span>
                </div>
                <div className="flex items-center justify-between rounded-[0.5vw] border border-line bg-bg px-[1vw] py-[0.8vh] text-[1.4vw]">
                  <span className="text-muted">المدة</span>
                  <span className="font-bold text-text">60 شهر</span>
                </div>
              </div>
              <div className="flex w-[42%] flex-col justify-center rounded-[0.6vw] bg-primary p-[1.2vw] text-white">
                <span className="text-[1.4vw] opacity-90">القسط الشهري التقديري</span>
                <span className="mt-[0.3vh] text-[2.6vw] font-extrabold leading-none">
                  1,875
                </span>
                <span className="text-[1.3vw] opacity-90">ر.س / شهرياً</span>
                <div className="mt-[1vh] border-t border-white/25 pt-[0.8vh] text-[1.4vw]">
                  الإجمالي المستحق 112,500 ر.س
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[5vw] left-[5vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          واجهات متكاملة لكل دور: العميل، المستشار، المشرف، والأدوات العامة
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">
          مقايضة · 6 / 17
        </span>
      </div>
    </div>
  );
}
