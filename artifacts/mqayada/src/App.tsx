import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MAINTENANCE_MODE, hasMaintenanceBypass } from "@/lib/maintenance";
import Maintenance from "@/pages/Maintenance";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Landing from "@/pages/Landing";
import AnnualOffers from "@/pages/AnnualOffers";
import Disclaimer from "@/pages/Disclaimer";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import AdvisorStandards from "@/pages/AdvisorStandards";
import Apply from "@/pages/Apply";
import AdvisorPortal from "@/pages/AdvisorPortal";
import SupervisorPortal from "@/pages/SupervisorPortal";
import AdminDashboard from "@/pages/AdminDashboard";
import RequestDetails from "@/pages/RequestDetails";
import ClientPortal from "@/pages/ClientPortal";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import Awareness from "@/pages/Awareness";
import FAQ from "@/pages/FAQ";
import FinancialHealth from "@/pages/FinancialHealth";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Landing} />
          <Route path="/annual-offers" component={AnnualOffers} />
          <Route path="/disclaimer" component={Disclaimer} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfUse} />
          <Route path="/advisor-standards" component={AdvisorStandards} />
          <Route path="/awareness" component={Awareness} />
          <Route path="/faq" component={FAQ} />
          <Route path="/financial-health" component={FinancialHealth} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-email" component={VerifyEmail} />

          {/* Client-only routes */}
          <Route path="/client">
            <ProtectedRoute component={ClientPortal} allowedRoles={["client"]} />
          </Route>
          <Route path="/apply">
            <ProtectedRoute component={Apply} allowedRoles={["client"]} />
          </Route>
          <Route path="/requests/:id">
            <ProtectedRoute component={RequestDetails} allowedRoles={["client", "admin"]} />
          </Route>

          {/* Advisor-only routes */}
          <Route path="/advisor">
            <ProtectedRoute component={AdvisorPortal} allowedRoles={["advisor"]} />
          </Route>

          {/* Supervisor-only routes */}
          <Route path="/supervisor">
            <ProtectedRoute component={SupervisorPortal} allowedRoles={["supervisor"]} />
          </Route>

          {/* Admin-only routes */}
          <Route path="/admin">
            <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  if (MAINTENANCE_MODE && !hasMaintenanceBypass()) {
    return <Maintenance />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
