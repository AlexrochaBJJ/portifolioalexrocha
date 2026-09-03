import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import usePageTracking from "@/hooks/usePageTracking";
import About from "./pages/About";
import Dashboards from "./pages/Dashboards";
import DashboardDetail from "./pages/DashboardDetail";
import WebApps from "./pages/WebApps";
import WebAppDetail from "./pages/WebAppDetail";

import Experiences from "./pages/Experiences";
import ExperienceDetail from "./pages/ExperienceDetail";
import FlowchartDetail from "./pages/FlowchartDetail";
import Assistant from "./pages/Assistant";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});


const AppRoutes = () => {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <Routes>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>

            <Route path="/" element={<About />} />
            <Route path="/dashboards" element={<Dashboards />} />
            <Route path="/dashboards/:id" element={<DashboardDetail />} />
            <Route path="/aplicacoes" element={<WebApps />} />
            <Route path="/aplicacoes/:id" element={<WebAppDetail />} />

            <Route path="/experiencias" element={<Experiences />} />
            <Route path="/experiencias/:slug" element={<ExperienceDetail />} />
            <Route path="/fluxogramas/:slug" element={<FlowchartDetail />} />
            <Route path="/assistente" element={<Assistant />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
