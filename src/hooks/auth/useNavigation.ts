
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  const navigateBasedOnRole = () => {
    if (!user) {
      console.log("No user found, navigating to home page");
      navigate("/");
      return;
    }
    
    console.log("Navigating based on role:", user.role);
    
    // Simplified navigation for all user types
    if (user.role === "admin") {
      console.log("Admin user, navigating to admin dashboard");
      navigate("/admin");
    } else if (user.role === "painter") {
      console.log("Painter user, navigating to painter dashboard");
      navigate("/painter-dashboard");
    } else {
      console.log("Customer user, navigating to profile");
      navigate("/profile");
    }
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
