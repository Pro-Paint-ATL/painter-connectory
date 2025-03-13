
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Suspense, lazy, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";

// Lazy load pages to reduce initial bundle size
const EstimateCalculator = lazy(() => import("./pages/EstimateCalculator"));
const FindPainters = lazy(() => import("./pages/FindPainters"));
const PainterProfile = lazy(() => import("./pages/PainterProfile"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const PainterDashboard = lazy(() => import("./pages/PainterDashboard"));
const Booking = lazy(() => import("./pages/Booking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PainterSubscription = lazy(() => import("./pages/PainterSubscription"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component for suspense fallback
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading...</span>
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const PainterRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!user || user.role !== "painter") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage />;
  }
  
  return (
    <Suspense fallback={<LoadingPage />}>
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
          path="/painter-dashboard" 
          element={
            <PainterRoute>
              <PainterDashboard />
            </PainterRoute>
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
    </Suspense>
  );
};

const App = () => {
  // Add error handling for the entire app
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="mb-4">We're sorry, but there was an error loading the application.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Reload the page
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
