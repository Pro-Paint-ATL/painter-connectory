
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { lazy } from "react";
import Index from "@/pages/Index";

// Lazy load pages to reduce initial bundle size
const EstimateCalculator = lazy(() => import("@/pages/EstimateCalculator"));
const FindPainters = lazy(() => import("@/pages/FindPainters"));
const PainterProfile = lazy(() => import("@/pages/PainterProfile"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const PainterDashboard = lazy(() => import("@/pages/PainterDashboard"));
const Booking = lazy(() => import("@/pages/Booking"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PainterSubscription = lazy(() => import("@/pages/PainterSubscription"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));

// Loading component for route loading
const RouteLoadingPage = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading route...</span>
  </div>
);

const AppRoutes = () => {
  const { user, isLoading, isAuthenticated, isInitialized } = useAuth();
  
  if (isLoading && !isInitialized) {
    return <RouteLoadingPage />;
  }
  
  // Create protected route components using the authenticated user info
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user || user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  const PainterRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user || user.role !== "painter") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };
  
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
  );
};

export default AppRoutes;
