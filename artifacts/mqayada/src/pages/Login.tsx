import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, ApiError } from "@/contexts/AuthContext";
import { Clock, Mail, FileText } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginValues = z.infer<typeof loginSchema>;

const COOLDOWN_MS = 15 * 60 * 1000;

const ROLE_DESTINATION: Record<string, string> = {
  admin: "/admin",
  advisor: "/advisor",
  client: "/client",
  supervisor: "/supervisor",
};

function formatRemaining(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Login() {
  usePageMeta({
    title: "تسجيل الدخول",
    description: "سجّل الدخول إلى منصة مقايضة للوصول إلى طلباتك وعروضك التمويلية.",
    path: "/login",
  });

  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [pending, setPending] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectedAt, setRejectedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [reapplySuccess, setReapplySuccess] = useState(false);
  const [reapplyLoading, setReapplyLoading] = useState(false);
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!rejected || rejectedAt === null) return;
    const tick = () => {
      const elapsed = Date.now() - rejectedAt;
      const rem = Math.max(0, COOLDOWN_MS - elapsed);
      setRemaining(rem);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rejected, rejectedAt]);

  const onSubmit = async (data: LoginValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      navigate(ROLE_DESTINATION[user.role] ?? "/");
    } catch (e: unknown) {
      if (e instanceof ApiError && e.pending) {
        setPending(true);
      } else if (e instanceof ApiError && e.rejected) {
        setRejected(true);
        setLastCredentials({ email: data.email, password: data.password });
        const ts = e.rejectedAt ? new Date(e.rejectedAt).getTime() : Date.now();
        setRejectedAt(ts);
      } else {
        setError(e instanceof Error ? e.message : "بيانات الدخول غير صحيحة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReapply = useCallback(async () => {
    if (!lastCredentials) return;
    setReapplyLoading(true);
    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${BASE}/api/auth/reapply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastCredentials),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ");
        return;
      }
      setReapplySuccess(true);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setReapplyLoading(false);
    }
  }, [lastCredentials]);

  if (reapplySuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-3">تم إرسال طلبك من جديد</h2>
          <p className="text-muted-foreground mb-6">سيتم مراجعة طلبك من قِبل إدارة المنصة وسيُشعَر بك عند الموافقة.</p>
          <Button variant="outline" onClick={() => { setRejected(false); setReapplySuccess(false); }}>
            العودة لتسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  /* ── Pending approval screen (advisor waiting for admin review) ── */
  if (pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-amber-400">
          <CardContent className="p-10 text-center space-y-5">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">حسابك قيد المراجعة</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                طلب انضمامك كمستشار قيد المراجعة من قِبل إدارة المنصة. ستُخطَر فور الموافقة.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-right space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 text-sm mb-1">خطوة مطلوبة لإتمام التحقق</p>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    يرجى إرسال صورة من <strong>بطاقة العمل</strong> و<strong>كرت الأعمال</strong> إلى:
                  </p>
                  <a
                    href="mailto:maqayada@maqayada.com"
                    className="inline-flex items-center gap-2 mt-2 text-amber-700 font-bold text-sm underline decoration-dashed underline-offset-4 hover:text-amber-900 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    maqayada@maqayada.com
                  </a>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPending(false)}
            >
              العودة لتسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rejected) {
    const canReapply = remaining === 0;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-extrabold text-foreground mb-2">تم رفض طلب انضمامك</h2>
              {canReapply ? (
                <>
                  <p className="text-muted-foreground text-sm mb-6">
                    يمكنك الآن إعادة تقديم طلب الانضمام للمراجعة مجدداً.
                  </p>
                  {error && (
                    <p className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
                  )}
                  <Button className="w-full mb-3" onClick={handleReapply} isLoading={reapplyLoading}>
                    إعادة تقديم الطلب
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setRejected(false)}>
                    العودة لتسجيل الدخول
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm mb-6">
                    يمكنك إعادة تقديم الطلب بعد انتهاء فترة الانتظار.
                  </p>
                  <div className="bg-muted rounded-2xl py-5 px-8 mb-6 inline-block">
                    <p className="text-xs text-muted-foreground mb-1">الوقت المتبقي</p>
                    <span className="text-4xl font-black text-foreground tabular-nums ltr">
                      {formatRemaining(remaining)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    دقيقة ١٥ فترة انتظار قبل إمكانية إعادة التقديم
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">تسجيل الدخول</h1>
          <p className="mt-2 text-muted-foreground">أهلاً بك في منصة مقايضة</p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                دخول
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                سجّل الآن
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
