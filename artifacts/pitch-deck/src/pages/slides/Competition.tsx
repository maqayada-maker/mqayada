function Yes() {
  return <span className="text-[2.6vw] font-extrabold text-primary">✓</span>;
}
function No() {
  return <span className="text-[2.4vw] text-muted">✕</span>;
}
function Partial() {
  return <span className="text-[2.2vw] font-semibold text-muted">جزئي</span>;
}

export default function Competition() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 h-[0.7vh] w-[24vw] bg-primary" />
      <div className="absolute top-0 right-[24vw] h-[0.7vh] w-[6vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col px-[6vw] pt-[8vh] pb-[10vh]">
        <h2
          className="text-[3vw] font-extrabold leading-[1.15] text-text"
          style={{ textWrap: "balance" }}
        >
          مقايضة وحدها تجمع السوق العكسي وإخفاء الهوية والتركيز على إعادة التمويل
        </h2>
        <div className="mt-[1.4vh] h-[0.45vh] w-[9vw] rounded-full bg-accent" />

        <div className="mt-[4.5vh] overflow-hidden rounded-[0.8vw] border border-line">
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr] items-center bg-text/90 text-bg">
            <div className="px-[1.4vw] py-[2.2vh] text-[2.3vw] font-semibold">
              المعيار
            </div>
            <div className="px-[0.4vw] py-[2.2vh] text-center text-[2.2vw] font-semibold leading-[1.2]">
              سوق عكسي
            </div>
            <div className="px-[0.4vw] py-[2.2vh] text-center text-[2.2vw] font-semibold leading-[1.2]">
              إخفاء الهوية
            </div>
            <div className="px-[0.4vw] py-[2.2vh] text-center text-[2.2vw] font-semibold leading-[1.2]">
              إعادة التمويل
            </div>
            <div className="px-[0.4vw] py-[2.2vh] text-center text-[2.2vw] font-semibold leading-[1.2]">
              الحياد
            </div>
            <div className="px-[0.4vw] py-[2.2vh] text-center text-[2.2vw] font-semibold leading-[1.2]">
              بلا رسوم
            </div>
          </div>

          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-line bg-panel">
            <div className="px-[1.4vw] py-[2.4vh] text-[2.2vw] text-text">
              منصات مقارنة الأسعار
            </div>
            <div className="py-[2.4vh] text-center"><Partial /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><Partial /></div>
            <div className="py-[2.4vh] text-center"><Partial /></div>
            <div className="py-[2.4vh] text-center"><Yes /></div>
          </div>

          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-line bg-bg">
            <div className="px-[1.4vw] py-[2.4vh] text-[2.2vw] text-text">
              الوسطاء التقليديون
            </div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><Partial /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
          </div>

          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-line bg-panel">
            <div className="px-[1.4vw] py-[2.4vh] text-[2.2vw] text-text">
              التعامل المباشر مع البنوك
            </div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><No /></div>
            <div className="py-[2.4vh] text-center"><Yes /></div>
          </div>

          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr] items-center border-t-2 border-accent bg-accent/10">
            <div className="px-[1.4vw] py-[2.6vh] text-[2.4vw] font-extrabold text-text">
              مقايضة
            </div>
            <div className="py-[2.6vh] text-center"><Yes /></div>
            <div className="py-[2.6vh] text-center"><Yes /></div>
            <div className="py-[2.6vh] text-center"><Yes /></div>
            <div className="py-[2.6vh] text-center"><Yes /></div>
            <div className="py-[2.6vh] text-center"><Yes /></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6vh] right-[6vw] left-[6vw] flex items-center justify-between">
        <span className="text-[2.2vw] text-muted">
          تموضع متمايز يجمع المنافسة وحماية الهوية والحياد في منصة واحدة
        </span>
        <span className="text-[2.2vw] font-semibold text-muted">مقايضة · 12 / 17</span>
      </div>
    </div>
  );
}
