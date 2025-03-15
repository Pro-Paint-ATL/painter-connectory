
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

  // Navigate when authentication state changes
  useEffect(() => {
    if (user && isInitialized && !sessionLoading && !actionLoading && !isRegistering && !isLoggingIn) {
      console.log("Auth state stable with user, navigating based on role");
      setTimeout(() => navigateBasedOnRole(), 100);
    }
  }, [user, isInitialized, sessionLoading, actionLoading, isRegistering, isLoggingIn]);

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        console.log("User logged in successfully with role:", loggedInUser.role);
        
        // Immediate navigation based on role
        if (loggedInUser.role === "admin") {
          navigate('/admin', { replace: true });
        } else if (loggedInUser.role === "painter") {
          navigate('/painter-dashboard', { replace: true });
        } else {
          navigate('/profile', { replace: true });
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
      // Short delay before turning off loading
      setTimeout(() => setIsLoggingIn(false), 300);
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
          navigate('/admin', { replace: true });
        } else if (registeredUser.role === "painter") {
          console.log("Painter registered, navigating to painter dashboard");
          navigate('/painter-dashboard', { replace: true });
        } else {
          console.log("Customer registered, navigating to profile");
          navigate('/profile', { replace: true });
        }
        
        return registeredUser;
      } else {
        console.log("Registration did not return a user object");
        // Email confirmation might be required
        toast({
          title: "Registration Complete",
          description: "If email confirmation is required, please check your email before logging in.",
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
      // Short delay before turning off loading
      setTimeout(() => setIsRegistering(false), 300);
    }
  };

  // Handle logout with navigation
  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out, navigating to home page");
      navigate('/', { replace: true });
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
