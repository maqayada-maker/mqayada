import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const year = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer dir="rtl" className="bg-[#0a0f1e] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-12 border-b border-white/5">
          <div className="max-w-sm">
            <span className="text-2xl font-black text-white tracking-tight block mb-2">مقايضة</span>
            <p className="text-sm text-gray-500 leading-relaxed">
              السوق الأول في المملكة لمقايضة التمويل — بسرية تامة وبدون عناء.
            </p>
          </div>
          {!user && (
            <Link href="/apply">
              <span className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">
                ابدأ مجاناً
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          )}
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 py-10 border-b border-white/5">
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-5 opacity-40">للعملاء</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">إنشاء حساب</Link></li>
              <li><Link href="/apply" className="hover:text-white transition-colors">رفع طلب تمويل</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">تتبع طلبك</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-5 opacity-40">للمستشارين</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">انضم كمستشار</Link></li>
              <li><Link href="/advisor" className="hover:text-white transition-colors">بوابة المستشارين</Link></li>
              <li><Link href="/advisor-standards" className="hover:text-white transition-colors">معايير الانضمام</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-5 opacity-40">قانوني</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">إخلاء المسؤولية</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">اتفاقية الاستخدام</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-gray-600">
          <span>© {year} منصة مقايضة. جميع الحقوق محفوظة.</span>

          {/* Freelance.sa trust badge */}
          <a
            href="https://freelance.sa/home"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all group"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <span>موثق لدى منصة العمل الحر</span>
            <span className="opacity-60 group-hover:opacity-90 transition-opacity">— freelance.sa</span>
          </a>

          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            جميع الأنظمة تعمل
          </span>
        </div>

      </div>
    </footer>
  );
}
