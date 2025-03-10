
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";
import EstimateCalculator from "./pages/EstimateCalculator";
import FindPainters from "./pages/FindPainters";
import PainterProfile from "./pages/PainterProfile";
import CustomerProfile from "./pages/CustomerProfile";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import PainterSubscription from "./pages/PainterSubscription";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculator" element={<EstimateCalculator />} />
                <Route path="/find-painters" element={<FindPainters />} />
                <Route path="/painter/:id" element={<PainterProfile />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/booking/:painterId" element={<Booking />} />
                <Route path="/subscription" element={<PainterSubscription />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
