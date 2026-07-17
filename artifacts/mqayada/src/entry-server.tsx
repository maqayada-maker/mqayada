import React from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Landing from "@/pages/Landing";
import AnnualOffers from "@/pages/AnnualOffers";
import AdvisorStandards from "@/pages/AdvisorStandards";
import Disclaimer from "@/pages/Disclaimer";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import Maintenance from "@/pages/Maintenance";
import { MAINTENANCE_MODE } from "@/lib/maintenance";

const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  "/": Landing,
  "/annual-offers": AnnualOffers,
  "/advisor-standards": AdvisorStandards,
  "/disclaimer": Disclaimer,
  "/privacy": PrivacyPolicy,
  "/terms": TermsOfUse,
  "/login": Login,
  "/register": Register,
  "/verify-email": VerifyEmail,
};

/**
 * A minimal SSR-safe location hook for wouter.
 * Wouter's memoryLocation uses useSyncExternalStore without getServerSnapshot,
 * which causes React 18 SSR to throw. This hook uses useState instead, which
 * is fully supported in server rendering.
 */
function makeSSRLocationHook(path: string) {
  function useSSRLocation(): [string, (to: string) => void] {
    const [loc] = React.useState(path);
    return [loc, () => {}];
  }
  return useSSRLocation;
}

export function render(path: string): string {
  if (MAINTENANCE_MODE) {
    return renderToString(<Maintenance />);
  }

  const Component = ROUTE_COMPONENTS[path];
  if (!Component) return "";

  const hook = makeSSRLocationHook(path);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  const element = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router hook={hook}>
            <div className="flex flex-col min-h-screen" dir="rtl">
              <Navbar />
              <main className="flex-1">
                <Component />
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );

  return renderToString(element);
}
