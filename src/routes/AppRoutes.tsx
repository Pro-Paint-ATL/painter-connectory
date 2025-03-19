
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Pages
import Index from "@/pages/Index";
import AboutUs from "@/pages/AboutUs";
import EstimateCalculator from "@/pages/EstimateCalculator";
import FindPainters from "@/pages/FindPainters";
import JobDetails from "@/pages/JobDetails";
import JobMarketplace from "@/pages/JobMarketplace";
import ManageJobs from "@/pages/ManageJobs";
import PostJob from "@/pages/PostJob";
import Booking from "@/pages/Booking";
import PainterDashboard from "@/pages/PainterDashboard";
import PainterProfile from "@/pages/PainterProfile";
import PainterSubscription from "@/pages/PainterSubscription";
import CustomerProfile from "@/pages/CustomerProfile";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import Careers from "@/pages/Careers";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user.role === "admin";
  const isPainter = isAuthenticated && user.role === "painter";
  const isCustomer = isAuthenticated && user.role === "customer";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/calculator" element={<EstimateCalculator />} />
      <Route path="/find-painters" element={<FindPainters />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/careers" element={<Careers />} />
      
      {/* Job marketplace routes */}
      <Route 
        path="/marketplace" 
        element={
          isPainter ? <JobMarketplace /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/job/:id" 
        element={
          isAuthenticated ? <JobDetails /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/post-job" 
        element={
          isCustomer ? <PostJob /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/manage-jobs" 
        element={
          isCustomer ? <ManageJobs /> : <Navigate to="/" replace />
        } 
      />

      {/* Painter routes */}
      <Route 
        path="/painter/:id" 
        element={<PainterProfile />} 
      />
      <Route 
        path="/painter-dashboard" 
        element={
          isPainter ? <PainterDashboard /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/subscription" 
        element={
          isPainter ? <PainterSubscription /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/manage-subscription" 
        element={
          isAuthenticated ? <SubscriptionManagement /> : <Navigate to="/" replace />
        } 
      />

      {/* Customer routes */}
      <Route 
        path="/profile" 
        element={
          isCustomer ? <CustomerProfile /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/booking/:painterId" 
        element={
          isCustomer ? <Booking /> : <Navigate to="/" replace />
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
