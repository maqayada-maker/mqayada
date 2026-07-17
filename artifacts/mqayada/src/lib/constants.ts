export const SAUDI_BANKS = [
  // البنوك المحلية
  "مصرف الراجحي",
  "البنك الأهلي السعودي (SNB)",
  "بنك الرياض",
  "مصرف الإنماء",
  "البنك السعودي الأول (SAB)",
  "بنك البلاد",
  "البنك السعودي للاستثمار",
  "البنك العربي الوطني (ANB)",
  "بنك الجزيرة",
  "البنك السعودي الفرنسي (BSF)",
  // البنوك الرقمية
  "بنك دال (D360)",
  "بنك إس تي سي (STC Bank)",
  // شركات التمويل الاستهلاكي والشخصي
  "الشركة السعودية للتمويل",
  "شركة كوارا للتمويل (Quara)",
  "شركة النايفات للتمويل",
  "شركة مرابحة مرنة للتمويل",
  "شركة سلفة للتمويل",
  "شركة تسهيل للتمويل",
  "شركة إمكان للتمويل",
  "شركة التيسير للتمويل",
  "شركة عبداللطيف جميل للتمويل",
  "شركة راية للتمويل",
  "شركة تامارا للتمويل (Tamara)",
  "شركة تابي للتمويل (Tabby)",
  "شركة يلو للتمويل",
  "شركة متاجر للتمويل",
  "شركة الوطنية للتمويل",
  "شركة الجبر للتمويل",
  "شركة الخليج للتمويل",
  "شركة تمكين للتمويل",
  "شركة تمويل الأولى",
  "شركة معالم للتمويل",
  "شركة دفعة للتمويل",
  // شركات التمويل العقاري
  "الشركة السعودية لإعادة التمويل العقاري (SRC)",
  "شركة أملاك العالمية للتمويل العقاري",
  "شركة سهل للتمويل",
  "شركة دار التمليك للتمويل العقاري",
  "شركة بداية لتمويل المنازل",
  "شركة دويتشه الخليج للتمويل",
  "شركة عبداللطيف جميل للتمويل العقاري",
  // شركات تمويل قطاع الأعمال والمنشآت الصغيرة والمتوسطة
  "شركة الأمثل للتمويل",
  "شركة أصول الحديثة للتمويل",
  "شركة أوركس السعودية للتأجير التمويلي",
  "شركة آفاق التمويل",
  "شركة تمويل الشركات السعودية",
  "شركة الرائدة للتمويل",
  "شركة باب رزق جميل للتمويل",
  "شركة فرصة للتمويل",
  // منصات التمويل الجماعي بالدين - FinTech
  "شركة ليندو السعودية (Lendo)",
  "شركة تعميد للتمويل الجماعي (Taameed)",
  "شركة ذرى للتمويل الجماعي (Thara)",
  "شركة لبيبة للتمويل الجماعي",
  "شركة سكوبير للتمويل الجماعي",
  "شركة صكوك للتمويل الجماعي",
  "شركة منصة منافع للتمويل",
  "شركة فوروش للتمويل الجماعي",
  "بنك آخر",
];

export const FINANCING_PURPOSES = [
  { value: "new_financing", label: "تمويل جديد", icon: "✨", desc: "أحصل على تمويل لأول مرة" },
  { value: "refinancing", label: "إعادة تمويل", icon: "🔄", desc: "تحسين شروط تمويلك الحالي" },
  { value: "debt_transfer", label: "نقل مديونية", icon: "🔁", desc: "نقل مديونيتك لبنك آخر بشروط أفضل" },
];

export const FINANCING_TYPES = [
  { value: "personal", label: "شخصي", icon: "👤" },
  { value: "real_estate", label: "عقاري", icon: "🏠" },
  { value: "car", label: "سيارة", icon: "🚗" },
  { value: "debt_purchase", label: "شراء مديونية", icon: "💳" },
  { value: "debt_transfer", label: "نقل مديونية", icon: "🔁" },
];

export const OFFER_FEATURES = [
  { value: "free_card_first_year", label: "بطاقة ائتمانية مجانية لأول سنة", icon: "💳" },
  { value: "free_card_lifetime", label: "بطاقة ائتمانية مجانية مدى الحياة", icon: "♾️" },
  { value: "no_admin_fees", label: "بدون رسوم إدارية", icon: "✅" },
  { value: "installment_deferral", label: "إمكانية تأجيل الأقساط", icon: "⏸️" },
  { value: "early_payoff_discount", label: "خصم عند السداد المبكر", icon: "🎯" },
  { value: "free_takaful", label: "تأمين تكافلي مجاني", icon: "🛡️" },
];

export const SECTORS = [
  { value: "government", label: "حكومي", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "semi_government", label: "شبه حكومي", color: "text-violet-700 bg-violet-50 border-violet-200" },
  { value: "private", label: "قطاع خاص", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "retired", label: "متقاعد", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
];

export const SECTOR_BADGE: Record<string, string> = {
  government: "bg-blue-100 text-blue-700",
  semi_government: "bg-violet-100 text-violet-700",
  private: "bg-amber-100 text-amber-700",
  retired: "bg-emerald-100 text-emerald-700",
};

export const FINANCING_TYPE_BADGE: Record<string, string> = {
  personal: "bg-sky-100 text-sky-700",
  real_estate: "bg-teal-100 text-teal-700",
  car: "bg-pink-100 text-pink-700",
  debt_purchase: "bg-orange-100 text-orange-700",
  debt_transfer: "bg-violet-100 text-violet-700",
};
