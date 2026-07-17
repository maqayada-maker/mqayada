export default function Closing() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden bg-bg font-body text-text"
    >
      <div className="absolute top-0 right-0 left-0 h-[0.9vh] bg-primary" />
      <div className="absolute top-[0.9vh] right-0 h-[0.5vh] w-[32vw] bg-accent" />

      <div className="absolute inset-0 flex flex-col justify-center px-[9vw]">
        <p className="text-[2.3vw] font-semibold tracking-[0.25em] text-primary">
          مقايضة
        </p>
        <h1
          className="mt-[2.5vh] max-w-[78vw] text-[6vw] font-extrabold leading-[1.1] text-text"
          style={{ textWrap: "balance" }}
        >
          حين تتنافس الجهات، يربح العميل
        </h1>
        <div className="mt-[3vh] h-[0.6vh] w-[15vw] rounded-full bg-accent" />

        <div className="mt-[5vh] flex flex-col gap-[2vh]">
          <p className="text-[2.6vw] font-semibold text-text">
            للتواصل: maqayada@maqayada.com
          </p>
          <p className="text-[2.6vw] text-muted">الموقع: maqayada.com</p>
        </div>
      </div>

      <div className="absolute bottom-[6vh] right-[9vw] left-[9vw] flex items-end justify-between">
        <span className="text-[2.2vw] font-semibold text-muted">
          وثيقة سرية — جميع الحقوق محفوظة 2026
        </span>
        <span className="text-[2.2vw] font-semibold tracking-[0.2em] text-muted">
          مقايضة
        </span>
      </div>
    </div>
  );
}
