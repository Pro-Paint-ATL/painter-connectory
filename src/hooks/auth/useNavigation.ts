
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  const navigateBasedOnRole = () => {
    if (!user) {
      navigate("/");
      return;
    }
    
    console.log("Navigating based on role:", user.role);
    
    // Simplified navigation logic - all users go to profile by default
    if (user.role === "admin") {
      console.log("Admin user, navigating to admin dashboard");
      navigate("/admin");
    } else {
      // Both customers and painters go to profile first
      console.log("User navigating to profile");
      navigate("/profile");
    }
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
