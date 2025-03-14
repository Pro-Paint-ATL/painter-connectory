
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  const navigateBasedOnRole = () => {
    if (!user) {
      navigate("/");
      return;
    }
    
    console.log("Navigating based on role:", user.role, "Subscription status:", user.subscription?.status);
    
    if (user.role === "painter") {
      // Painters should go to their dashboard by default
      // or to subscription page if they don't have an active subscription
      if (!user.subscription || (user.subscription.status !== "active" && user.subscription.status !== "trial")) {
        console.log("Painter without active subscription, navigating to subscription page");
        navigate("/subscription");
      } else {
        console.log("Painter with active subscription, navigating to dashboard");
        navigate("/painter-dashboard");
      }
    } else if (user.role === "admin") {
      console.log("Admin user, navigating to admin dashboard");
      navigate("/admin");
    } else {
      // Default customer path
      console.log("Customer user, navigating to profile");
      navigate("/profile");
    }
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
