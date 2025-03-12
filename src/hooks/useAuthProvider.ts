
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { UserRole } from "@/types/auth";

export const useAuthProvider = () => {
  const { user, setUser, isLoading } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      console.log("User logged in successfully, navigating based on role");
      navigateBasedOnRole();
    }
    return loggedInUser;
  };

  // Handle registration with navigation
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    const registeredUser = await register(name, email, password, role);
    
    if (registeredUser) {
      console.log("User registered successfully with role:", registeredUser.role);
      
      // For painter roles, navigate to subscription page
      if (registeredUser.role === "painter") {
        console.log("Painter registered, navigating to subscription page");
        navigate('/subscription');
      } else if (registeredUser.role === "admin") {
        console.log("Admin registered, navigating to admin dashboard");
        navigate('/admin');
      } else {
        console.log("Customer registered, navigating to profile");
        navigate('/profile');
      }
    }
    return registeredUser;
  };

  // Handle logout with navigation
  const handleLogout = async () => {
    await logout();
    console.log("User logged out, navigating to home page");
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
