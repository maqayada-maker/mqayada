const BASE = import.meta.env.BASE_URL;

export default function Maintenance() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-10 sm:px-6 sm:py-16"
    >
      <div className="w-full max-w-2xl">
        {/* Letterhead */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <img
            src={`${BASE}images/logo.png`}
            alt="مقايضة"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain mb-3"
          />
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            منصة مقايضة
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">
            المملكة العربية السعودية
          </span>
        </div>

        {/* Official notice document */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-primary" />

          <div className="px-5 py-8 sm:px-12 sm:py-10">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <span className="px-4 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-bold tracking-wide">
                إشعار رسمي
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-center leading-snug mb-2">
              المنصة متوقفة مؤقتاً
            </h1>
            <p className="text-center text-sm sm:text-base text-primary font-semibold mb-6 sm:mb-8">
              نلتقيكم في هاكثون أمد ٢٠٢٦
            </p>

            <div className="h-px w-full bg-border mb-6 sm:mb-8" />

            <div className="space-y-4 sm:space-y-5 text-[15px] sm:text-base leading-loose text-foreground/90 text-right">
              <p>
                نفيدكم بأنه قد تقرّر إيقاف العمل بمنصة مقايضة بشكل مؤقت، وذلك خلال
                مرحلة تطوير المنصة والحصول على التراخيص المعتمدة من الجهات الرسمية
                في المملكة العربية السعودية.
              </p>
              <p>
                يأتي هذا الإجراء حرصاً منّا على تقديم أفضل خدمة للمستفيدين، وتحقيق
                أهداف مستشاري البنوك وشركات التمويل، ضمن إطارٍ نظاميٍّ موثوق
                لمقايضة وإعادة تمويل المديونيات.
              </p>
              <p>
                سنعاود استقبالكم فور اكتمال الاستعدادات وإعادة افتتاح المنصة. نشكر
                لكم حسن تفهّمكم وثقتكم الكريمة.
              </p>
            </div>

            <div className="h-px w-full bg-border my-6 sm:my-8" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">والله الموفق،</p>
              <p className="font-bold text-foreground">إدارة منصة مقايضة</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 sm:mt-8">
          © {new Date().getFullYear()} منصة مقايضة — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
