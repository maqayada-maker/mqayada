import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function VerifyEmail() {
  usePageMeta({
    title: "تأكيد البريد الإلكتروني",
    description: "أكّد بريدك الإلكتروني لاستكمال تسجيلك في منصة مقايضة والبدء في استخدام الخدمة.",
    path: "/verify-email",
  });

  const [location] = useLocation();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رمز التحقق غير موجود أو غير صالح.");
      return;
    }
    fetch(`${BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async res => {
        const data = await res.json();
        if (data.alreadyVerified) {
          setStatus("already");
          setMessage(data.message);
        } else if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error ?? "حدث خطأ أثناء التحقق.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-10 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2">جارٍ التحقق...</h2>
              <p className="text-muted-foreground text-sm">يرجى الانتظار لحظة</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-emerald-700">تم التحقق بنجاح!</h2>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <Link href="/login">
                <Button className="w-full">تسجيل الدخول الآن</Button>
              </Link>
            </>
          )}

          {status === "already" && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-9 h-9 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">البريد مؤكّد مسبقاً</h2>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <Link href="/login">
                <Button variant="outline" className="w-full">الذهاب لتسجيل الدخول</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-600">فشل التحقق</h2>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <Link href="/">
                <Button variant="outline" className="w-full">العودة للرئيسية</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
