import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, KeyRound, X, Eye, EyeOff, Mail, ShieldAlert, Menu } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (newPassword.length < 6) {
      setErrorMsg("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("كلمة المرور الجديدة وتأكيدها غير متطابقتين");
      return;
    }
    setStatus("loading");
    try {
      const token = localStorage.getItem("mqayada_token") ?? "";
      const res = await fetch(`${BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "حدث خطأ");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("تعذّر الاتصال بالخادم");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            تغيير كلمة المرور
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">تم تغيير كلمة المرور</h3>
            <p className="text-muted-foreground text-sm mb-5">كلمة مرورك الجديدة فعّالة الآن</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              حسناً
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            {[
              { label: "كلمة المرور الحالية", value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggleShow: () => setShowCurrent(v => !v) },
              { label: "كلمة المرور الجديدة", value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew(v => !v) },
              { label: "تأكيد كلمة المرور الجديدة", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggleShow: () => setShowConfirm(v => !v) },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-muted-foreground mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    required
                    className="w-full h-10 px-3 pr-10 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={field.toggleShow}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
              >
                {status === "loading" ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const clientLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/client", label: "طلباتي" },
    { href: "/apply", label: "ارفع طلبك" },
    { href: "/annual-offers", label: "العروض السنوية" },
    { href: "/awareness", label: "التوعية المالية" },
  ];

  const advisorLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/advisor", label: "بوابة المستشارين" },
  ];

  const supervisorLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/supervisor", label: "بوابة المشرف" },
  ];

  const adminLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/admin", label: "لوحة الإدارة" },
  ];

  const guestLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/annual-offers", label: "العروض السنوية" },
    { href: "/awareness", label: "التوعية المالية" },
    { href: "/faq", label: "الأسئلة الشائعة" },
  ];

  const navItems =
    user?.role === "admin"
      ? adminLinks
      : user?.role === "supervisor"
      ? supervisorLinks
      : user?.role === "advisor"
      ? advisorLinks
      : user?.role === "client"
      ? clientLinks
      : guestLinks;

  const roleLabel =
    user?.role === "admin" ? "مدير" :
    user?.role === "supervisor" ? "مشرف المستشارين" :
    user?.role === "advisor" ? "مستشار" : "عميل";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-border/50 shadow-sm" dir="rtl">
        {/* Trust bar */}
        <div className="w-full bg-emerald-600 text-white py-1.5 px-4 text-center text-xs font-semibold">
          <a
            href="https://freelance.sa/home"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:underline decoration-white/60 underline-offset-2 transition-all"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            صاحب المنصة موثق لدى منصة العمل الحر
            <span className="opacity-70">◂ freelance.sa</span>
          </a>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-foreground hover:bg-muted transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src={`${import.meta.env.BASE_URL}images/logo.png`}
                alt="مقايضة"
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-extrabold text-gradient">مقايضة</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-semibold transition-colors hover:text-primary",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && <NotificationBell />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{roleLabel}</span>
                  {user.role === "client" && user.emailVerified === false && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="البريد غير مؤكد" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-background border border-border rounded-2xl shadow-xl w-56 overflow-hidden z-50" dir="rtl">
                    <div className="px-4 py-3 border-b border-border bg-muted/40">
                      <p className="text-xs text-muted-foreground">مسجّل كـ</p>
                      <p className="font-bold text-sm truncate">{user.email}</p>
                      {user.role === "client" && user.emailVerified === false && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" /> البريد غير مؤكد
                        </p>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { setShowUserMenu(false); setShowPasswordModal(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors text-right"
                      >
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                        تغيير كلمة المرور
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                    تسجيل الدخول
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20">
                    ابدأ مجاناً
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showUserMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
      )}

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[80%] bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <span className="text-xl font-extrabold text-gradient">القائمة</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b border-border bg-muted/40">
                <p className="text-xs text-muted-foreground">مسجّل كـ</p>
                <p className="font-bold text-sm truncate">{user.name}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{roleLabel}</span>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-semibold transition-colors",
                    location === item.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-2 border-t border-border">
              {user ? (
                <>
                  <button
                    onClick={() => { setShowMobileMenu(false); setShowPasswordModal(true); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl hover:bg-muted transition-colors text-right"
                  >
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => { setShowMobileMenu(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors text-right">
                      تسجيل الدخول
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors">
                      ابدأ مجاناً
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
