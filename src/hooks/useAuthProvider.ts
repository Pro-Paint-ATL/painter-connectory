
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "./use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        console.log("User logged in successfully with role:", loggedInUser.role);
        // Force immediate navigation after login
        if (loggedInUser.role === "admin") {
          navigate('/admin');
        } else if (loggedInUser.role === "painter") {
          navigate('/painter-dashboard');
        } else {
          navigate('/profile');
        }
        return loggedInUser;
      }
      return null;
    } catch (error) {
      console.error("Login handler error:", error);
      toast({
        title: "Login Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle registration with navigation
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        
        // Force immediate navigation after registration based on role
        if (registeredUser.role === "admin") {
          console.log("Admin registered, navigating to admin dashboard");
          navigate('/admin');
        } else if (registeredUser.role === "painter") {
          console.log("Painter registered, navigating to painter dashboard");
          navigate('/painter-dashboard');
        } else {
          console.log("Customer registered, navigating to profile");
          navigate('/profile');
        }
        
        return registeredUser;
      } else {
        console.log("Registration did not return a user object");
        toast({
          title: "Registration Issue",
          description: "Your account may have been created but we couldn't log you in automatically. Please try logging in.",
          variant: "destructive"
        });
      }
      
      return registeredUser;
    } catch (error) {
      console.error("Registration handler error:", error);
      toast({
        title: "Registration Error",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle logout with navigation
  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out, navigating to home page");
      navigate('/');
    } catch (error) {
      console.error("Logout handler error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Combined loading state from all sources
  // Don't consider sessionLoading if we're already initialized
  const isLoading = (isInitialized ? false : sessionLoading) || actionLoading || isRegistering || isLoggingIn;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserProfile,
    supabase
  };
};
