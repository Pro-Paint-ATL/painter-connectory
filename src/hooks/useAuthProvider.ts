
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export const useAuthProvider = () => {
  const { user, setUser, isLoading } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      navigateBasedOnRole();
    }
    return loggedInUser;
  };

  // Handle registration with navigation
  const handleRegister = async (name: string, email: string, password: string, role: any) => {
    const registeredUser = await register(name, email, password, role);
    if (registeredUser) {
      // For painter roles, navigate to subscription page
      if (registeredUser.role === "painter") {
        navigate('/subscription');
      } else if (registeredUser.role === "admin") {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
    return registeredUser;
  };

  // Handle logout with navigation
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || actionLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserProfile,
    supabase
  };
};
