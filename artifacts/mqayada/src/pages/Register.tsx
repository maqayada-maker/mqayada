import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SAUDI_BANKS } from "@/lib/constants";
import { CheckCircle2, Clock, Mail } from "lucide-react";

const baseSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["client", "advisor"]),
  company: z.string().optional(),
  employeeId: z.string().optional(),
  appointmentDate: z.string().optional(),
  monthsExperience: z.coerce.number().min(0).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "advisor") {
    if (!data.phone || data.phone.length < 10) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "رقم الجوال غير صحيح" });
    }
    if (!data.company || data.company.length < 2) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "اسم الجهة مطلوب" });
    }
    if (!data.employeeId || data.employeeId.length < 2) {
      ctx.addIssue({ code: "custom", path: ["employeeId"], message: "الرقم الوظيفي مطلوب" });
    }
    if (!data.appointmentDate) {
      ctx.addIssue({ code: "custom", path: ["appointmentDate"], message: "تاريخ التعيين مطلوب" });
    }
    if (!data.monthsExperience || data.monthsExperience < 1) {
      ctx.addIssue({ code: "custom", path: ["monthsExperience"], message: "يجب إدخال عدد أشهر الخبرة" });
    }
  }
});

type RegisterValues = z.infer<typeof baseSchema>;

export default function Register() {
  usePageMeta({
    title: "إنشاء حساب جديد",
    description: "أنشئ حسابك في منصة مقايضة مجاناً وابدأ في الحصول على عروض التمويل التنافسية من البنوك السعودية.",
    path: "/register",
  });

  const { register: doRegister } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteCompany, setInviteCompany] = useState<string | null>(null);
  const [inviteSupervisor, setInviteSupervisor] = useState<string | null>(null);
  const [inviteInvalid, setInviteInvalid] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { role: "client" },
  });

  const role = watch("role");
  const company = watch("company");
  const [bankQuery, setBankQuery] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const bankLocked = !!(inviteToken && inviteCompany);
  const filteredBanks = SAUDI_BANKS.filter((b) =>
    b.toLowerCase().includes(bankQuery.trim().toLowerCase())
  );

  useEffect(() => {
    if (bankLocked) {
      setBankOpen(false);
      setBankQuery("");
    }
  }, [bankLocked]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite");
    if (!token) return;
    setInviteToken(token);
    setValue("role", "advisor");
    const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${BASE}/api/invite-info/${token}`)
      .then((r) => r.json())
      .then((info) => {
        if (info?.valid) {
          setInviteCompany(info.company);
          setInviteSupervisor(info.supervisorName);
          setValue("company", info.company);
        } else {
          setInviteInvalid(true);
        }
      })
      .catch(() => setInviteInvalid(true));
  }, [setValue]);

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    if (!agreedToTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setIsLoading(true);
    try {
      const result = await doRegister({ ...data, ...(inviteToken ? { inviteToken } : {}) });
      if (result?.pending) {
        setPendingMessage(result.message ?? "طلبك قيد المراجعة.");
      } else if (result?.emailVerificationSent) {
        setVerificationEmail(data.email);
      } else {
        navigate("/");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ في التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-3">تحقق من بريدك الإلكتروني</h2>
              <p className="text-muted-foreground leading-relaxed">
                تم إنشاء حسابك بنجاح! أرسلنا رسالة تأكيد إلى:
              </p>
              <p className="font-bold text-foreground mt-2 text-lg">{verificationEmail}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 space-y-2 text-right">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>افتح بريدك الإلكتروني وانقر على رابط التأكيد</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>يمكنك تسجيل الدخول الآن وتأكيد البريد لاحقاً</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/client">
                <Button className="w-full">الذهاب للوحة التحكم</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">تسجيل الدخول</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-3">طلبك قيد المراجعة</h2>
              <p className="text-muted-foreground leading-relaxed">{pendingMessage}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>تم استلام بياناتك بنجاح</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>في انتظار موافقة إدارة المنصة</span>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">العودة لتسجيل الدخول</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">إنشاء حساب جديد</h1>
          <p className="mt-2 text-muted-foreground">انضم إلى منصة مقايضة اليوم</p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            {inviteToken && inviteCompany && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm text-center font-medium space-y-1">
                <p className="font-extrabold flex items-center justify-center gap-2"><span>🔗</span> دعوة انضمام لفريق المستشارين</p>
                <p>أنت تنضم إلى بنك <strong>{inviteCompany}</strong>{inviteSupervisor ? <> عبر المشرف <strong>{inviteSupervisor}</strong></> : null}</p>
              </div>
            )}
            {inviteInvalid && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm text-center font-medium">
                رابط الدعوة غير صالح أو منتهي الصلاحية — يمكنك التسجيل بشكل عادي.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground block">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "client", label: "عميل — أبحث عن تمويل أفضل", icon: "👤" },
                    { value: "advisor", label: "مستشار مالي معتمد", icon: "💼" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                        role === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input type="radio" value={opt.value} {...register("role")} className="sr-only" />
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {role === "advisor" && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2 text-center font-medium">
                    سيخضع حسابك لمراجعة الإدارة قبل تفعيله
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="الاسم الكامل" placeholder="محمد عبدالله" {...register("name")} error={errors.name?.message} className={role === "client" ? "sm:col-span-2" : ""} />
                <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com" {...register("email")} error={errors.email?.message} className="sm:col-span-2" />
                <Input label="كلمة المرور" type="password" placeholder="••••••••" {...register("password")} error={errors.password?.message} className="sm:col-span-2" />
              </div>

              {role === "client" && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900 leading-relaxed">
                  <p className="font-extrabold mb-2 flex items-center gap-2">
                    <span>⚠️</span> تنبيه أمني مهم
                  </p>
                  <p>
                    لا تُشارك أي معلومات حساسة مع المستشارين (مثل: رقم الهوية، صور البطاقة، كلمات المرور، رموز التحقق، أو تفاصيل حساباتك البنكية).
                    دور المنصة الوحيد هو مساعدتك في الحصول على <strong>أفضل عرض تمويل</strong>، ولا يحق لأي مستشار طلب هذه البيانات منك.
                  </p>
                </div>
              )}

              {role === "advisor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                  <p className="sm:col-span-2 text-sm font-bold text-foreground">بيانات المستشار</p>

                  <Input label="رقم الجوال" type="tel" placeholder="05XXXXXXXX" {...register("phone")} error={errors.phone?.message} className="sm:col-span-2" />

                  {/* Bank searchable dropdown */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-foreground block">الجهة المنتمي إليها</label>
                    <input type="hidden" {...register("company")} />
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="off"
                        disabled={bankLocked}
                        placeholder="ابحث عن البنك أو الجهة بالاسم..."
                        value={bankLocked ? (company || "") : (bankOpen ? bankQuery : (company || ""))}
                        onChange={(e) => { setBankQuery(e.target.value); setBankOpen(true); }}
                        onFocus={() => { if (!bankLocked) { setBankOpen(true); setBankQuery(""); } }}
                        onBlur={() => setTimeout(() => setBankOpen(false), 150)}
                        className={`w-full h-10 rounded-xl border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70 disabled:cursor-not-allowed ${
                          errors.company ? "border-destructive" : "border-border"
                        }`}
                      />
                      {bankOpen && !bankLocked && (
                        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-background shadow-lg">
                          {filteredBanks.length === 0 && (
                            <li className="px-3 py-2 text-sm text-muted-foreground">لا توجد نتائج</li>
                          )}
                          {filteredBanks.map((bank) => (
                            <li key={bank}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setValue("company", bank, { shouldValidate: true });
                                  setBankOpen(false);
                                  setBankQuery("");
                                }}
                                className={`block w-full text-right px-3 py-2 text-sm hover:bg-muted ${
                                  company === bank ? "bg-muted font-semibold" : ""
                                }`}
                              >
                                {bank}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {bankLocked && (
                      <p className="text-xs text-emerald-600">البنك محدد تلقائياً من رابط الدعوة</p>
                    )}
                    {errors.company && (
                      <p className="text-xs text-destructive">{errors.company.message}</p>
                    )}
                  </div>

                  {/* Employee ID */}
                  <Input
                    label="الرقم الوظيفي"
                    placeholder="EMP-XXXXX"
                    {...register("employeeId")}
                    error={errors.employeeId?.message}
                  />

                  {/* Appointment Date */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground block">تاريخ التعيين</label>
                    <input
                      type="date"
                      {...register("appointmentDate")}
                      className={`w-full h-10 rounded-xl border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        errors.appointmentDate ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.appointmentDate && (
                      <p className="text-xs text-destructive">{errors.appointmentDate.message}</p>
                    )}
                  </div>

                  {/* Months of Experience */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-foreground block">
                      سنوات الخبرة في المجال المالي
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        min="0"
                        max="600"
                        placeholder="مثال: 36 (٣ سنوات)"
                        {...register("monthsExperience")}
                        className={`flex-1 h-10 rounded-xl border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          errors.monthsExperience ? "border-destructive" : "border-border"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">شهر</span>
                    </div>
                    <p className="text-xs text-muted-foreground">أدخل إجمالي عدد الأشهر. مثال: سنتان = 24 شهراً</p>
                    {errors.monthsExperience && (
                      <p className="text-xs text-destructive">{errors.monthsExperience.message}</p>
                    )}
                  </div>

                  {/* Email notice */}
                  <div className="sm:col-span-2 bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900">
                    <p className="font-extrabold mb-2 flex items-center gap-2">
                      <span>📎</span> خطوة مطلوبة لإتمام التحقق
                    </p>
                    <p className="leading-relaxed">
                      يرجى إرسال صورة من <strong>بطاقة العمل</strong> و<strong>كرت الأعمال</strong> إلى{" "}
                      <a href="mailto:maqayada@maqayada.com" className="underline font-bold text-amber-800">
                        maqayada@maqayada.com
                      </a>{" "}
                      لإتمام التحقق من هويتك.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground leading-snug">
                    أوافق على{" "}
                    <Link href="/terms" className="text-primary font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                      اتفاقية الاستخدام
                    </Link>
                    {" "}و{" "}
                    <Link href="/privacy" className="text-primary font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                      سياسة الخصوصية
                    </Link>
                    {" "}و{" "}
                    <Link href="/disclaimer" className="text-primary font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                      إخلاء المسؤولية
                    </Link>
                  </span>
                </label>
                {termsError && (
                  <p className="text-xs text-destructive pr-7">يجب الموافقة على الشروط والأحكام للمتابعة</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {role === "advisor" ? "تقديم طلب الانضمام" : "إنشاء الحساب"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                سجّل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
