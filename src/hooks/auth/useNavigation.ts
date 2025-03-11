
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";

export const useAuthNavigation = (user: User | null) => {
  const navigate = useNavigate();

  const navigateBasedOnRole = () => {
    if (!user) return;
    
    if (user.role === "painter") {
      navigate("/painter-dashboard");
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
