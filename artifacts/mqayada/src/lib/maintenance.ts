// تعليق المنصة مؤقتاً: غيّر القيمة إلى false لإعادة تشغيل المنصة للجميع.
// Temporary platform suspension: set to false to bring the platform back online for everyone.
export const MAINTENANCE_MODE = true;

// مفتاح الوصول السري الذي يسمح لبعض المستخدمين بتجاوز صفحة الإيقاف والدخول إلى الموقع كاملاً.
// طريقتان للمشاركة، وكلاهما يعمل:
//   1) رابط قصير وأجمل:   https://maqayada.fyi/vip        (غيّر الكلمة من MAINTENANCE_ACCESS_PATH)
//   2) رابط بالرمز الطويل: https://maqayada.fyi/?access=<KEY>
// لإلغاء جميع الروابط التي تمت مشاركتها سابقاً، غيّر MAINTENANCE_BYPASS_KEY.
//
// Secret access that lets specific users bypass the maintenance page and use the full
// site. Two share formats, both work:
//   1) Pretty link:  https://maqayada.fyi/vip        (the word comes from MAINTENANCE_ACCESS_PATH)
//   2) Token link:   https://maqayada.fyi/?access=<KEY>
// Change MAINTENANCE_BYPASS_KEY to instantly revoke every previously shared link.
export const MAINTENANCE_BYPASS_KEY = "71db793fdc4351795a30e455d0db9486de3e7b9e";

// الكلمة المستخدمة في الرابط القصير (maqayada.fyi/<هذه الكلمة>). اجعلها أصعب في التخمين إن رغبت.
// The word used in the pretty link (maqayada.fyi/<this word>). Pick something less
// guessable if you want a more private link.
export const MAINTENANCE_ACCESS_PATH = "vip";

const ACCESS_QUERY_PARAM = "access";
const ACCESS_STORAGE_KEY = "mqayada_access";

/** Path relative to the app base, lowercased and stripped of slashes. */
function currentRelativePath(): string {
  const base = import.meta.env.BASE_URL || "/";
  let rel = window.location.pathname;
  if (base !== "/" && rel.startsWith(base)) {
    rel = rel.slice(base.length);
  }
  return rel.replace(/^\/+|\/+$/g, "").toLowerCase();
}

/**
 * Returns true when the current visitor is allowed to bypass the maintenance page.
 * Access is granted by either a pretty link (`/vip`) or a token (`?access=<KEY>`).
 * Once granted, it is remembered in localStorage (so refreshes and in-app
 * navigation keep working) and the secret is removed from the visible URL.
 * SSR-safe: returns false when there is no `window`.
 */
export function hasMaintenanceBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const base = import.meta.env.BASE_URL || "/";
    const params = new URLSearchParams(window.location.search);

    // 1) Token link: /?access=<KEY> — keep the user on their current path.
    if (params.get(ACCESS_QUERY_PARAM) === MAINTENANCE_BYPASS_KEY) {
      window.localStorage.setItem(ACCESS_STORAGE_KEY, MAINTENANCE_BYPASS_KEY);
      params.delete(ACCESS_QUERY_PARAM);
      const qs = params.toString();
      const newUrl =
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState(null, "", newUrl);
      return true;
    }

    // 2) Pretty link: /vip — grant access and send them to the site root.
    if (currentRelativePath() === MAINTENANCE_ACCESS_PATH.toLowerCase()) {
      window.localStorage.setItem(ACCESS_STORAGE_KEY, MAINTENANCE_BYPASS_KEY);
      window.history.replaceState(null, "", base);
      return true;
    }

    // 3) Returning visitor who already unlocked access.
    return window.localStorage.getItem(ACCESS_STORAGE_KEY) === MAINTENANCE_BYPASS_KEY;
  } catch {
    return false;
  }
}
