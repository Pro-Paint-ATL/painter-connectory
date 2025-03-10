
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import SubscriptionManagement from "./pages/SubscriptionManagement";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Protected route component for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected route component for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/calculator" element={<EstimateCalculator />} />
      <Route path="/find-painters" element={<FindPainters />} />
      <Route path="/painter/:id" element={<PainterProfile />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <CustomerProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking/:painterId" 
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <ProtectedRoute>
            <PainterSubscription />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/subscriptions" 
        element={
          <AdminRoute>
            <SubscriptionManagement />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [envError, setEnvError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if environment variables are available
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      setEnvError("Missing VITE_SUPABASE_URL environment variable");
    } else if (!supabaseAnonKey) {
      setEnvError("Missing VITE_SUPABASE_ANON_KEY environment variable");
    }
  }, []);

  // Show error message if environment variables are missing
  if (envError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="mb-4">{envError}</p>
          <p className="mb-4 text-sm">
            Please add your Supabase URL and anon key to the project.
          </p>
          <div className="p-4 bg-gray-100 rounded-md text-left text-sm mb-4">
            <p>To fix this issue:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click on "Share" in the top navigation bar</li>
              <li>Select "Settings"</li>
              <li>In the Settings sidebar, click on "Environment Variables"</li>
              <li>Add the following environment variables:</li>
              <li className="ml-4 font-mono">VITE_SUPABASE_URL</li>
              <li className="ml-4 font-mono">VITE_SUPABASE_ANON_KEY</li>
              <li>Get these values from your Supabase project dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
