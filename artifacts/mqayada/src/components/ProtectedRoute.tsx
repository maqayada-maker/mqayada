import { useLocation, Redirect } from "wouter";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  component: React.ComponentType;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4" dir="rtl">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-foreground">غير مصرح بالوصول</h1>
        <p className="text-muted-foreground">ليس لديك صلاحية لعرض هذه الصفحة.</p>
        <a href="/" className="text-primary font-semibold hover:underline">العودة للرئيسية</a>
      </div>
    );
  }

  return <Component />;
}
