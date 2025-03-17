
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";
import { useEffect, useRef } from "react";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();
  const navigatingRef = useRef(false);

  // Reset navigation flag when component unmounts
  useEffect(() => {
    return () => {
      navigatingRef.current = false;
    };
  }, []);

  // Simplified navigation function that directly navigates based on role
  const navigateBasedOnRole = () => {
    if (!user) {
      console.log("No user found, no navigation needed");
      return;
    }
    
    // Prevent duplicate navigations
    if (navigatingRef.current) {
      console.log("Navigation already in progress, skipping");
      return;
    }
    
    navigatingRef.current = true;
    console.log("Navigating based on role:", user.role);
    
    // Execute navigation with a small delay to ensure state updates
    setTimeout(() => {
      try {
        if (user.role === "admin") {
          console.log("Admin user, navigating to admin dashboard");
          navigate("/admin", { replace: true });
        } else if (user.role === "painter") {
          console.log("Painter user, navigating to painter dashboard");
          navigate("/painter-dashboard", { replace: true });
        } else {
          console.log("Customer user, navigating to profile");
          navigate("/profile", { replace: true });
        }
      } catch (error) {
        console.error("Navigation error:", error);
      }
      
      // Reset navigation flag after navigation completes
      setTimeout(() => {
        navigatingRef.current = false;
      }, 500);
    }, 100);
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
