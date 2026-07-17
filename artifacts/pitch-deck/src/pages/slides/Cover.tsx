export default function Cover() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 left-0 h-[0.9vh] bg-primary" />
      <div className="absolute top-[0.9vh] right-0 h-[0.5vh] w-[32vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col justify-center px-[9vw]">
        <p className="text-[2.3vw] font-semibold tracking-[0.25em] text-primary">
          عرض تقديمي للمستثمرين · 2026
        </p>
        <h1 className="mt-[2vh] text-[12vw] font-extrabold leading-[0.95] text-text">
          مقايضة
        </h1>
        <div className="mt-[2.5vh] h-[0.6vh] w-[15vw] rounded-full bg-accent" />
        <p
          className="mt-[3.8vh] max-w-[64vw] text-[3vw] font-semibold leading-[1.45] text-text"
          style={{ textWrap: "balance" }}
        >
          السوق الرقمي العكسي لإعادة تمويل وهيكلة الديون في المملكة العربية
          السعودية
        </p>
      </div>

      <div className="absolute bottom-[6vh] right-[9vw] left-[9vw] flex items-end justify-between">
        <span className="text-[2.2vw] font-semibold text-muted">maqayada.com</span>
        <span className="text-[2.2vw] font-semibold tracking-[0.2em] text-muted">
          وثيقة سرية
        </span>
      </div>
    </div>
  );
}
