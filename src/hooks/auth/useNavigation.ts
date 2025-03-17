
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  // Simplified navigation function that directly navigates based on role
  const navigateBasedOnRole = () => {
    if (!user) {
      console.log("No user found, no navigation needed");
      return;
    }
    
    console.log("Navigating based on role:", user.role);
    
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
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
