
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  const navigateBasedOnRole = () => {
    if (!user) return;
    
    if (user.role === "painter") {
      // Painters should go to their dashboard by default
      // or to subscription page if they don't have an active subscription
      if (!user.subscription || (user.subscription.status !== "active" && user.subscription.status !== "trial")) {
        navigate("/subscription");
      } else {
        navigate("/painter-dashboard");
      }
    } else if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  return {
    navigateBasedOnRole,
    navigate
  };
};
