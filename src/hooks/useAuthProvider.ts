
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "./use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  
  // Navigation when auth state changes - only if we're fully initialized and not loading
  useEffect(() => {
    // Only navigate if we have a user, are initialized, and not in a loading state
    if (user && isInitialized && !sessionLoading && !actionLoading && !isLoggingIn && !isRegistering) {
      console.log("Auth state stable with user, navigating based on role:", user.role);
      // Small delay to allow state to settle
      const navigationTimer = setTimeout(() => {
        navigateBasedOnRole();
      }, 50);
      
      return () => clearTimeout(navigationTimer);
    }
  }, [user, isInitialized, sessionLoading, actionLoading, isLoggingIn, isRegistering]);
  
  // Safety cleanup for loading states
  useEffect(() => {
    let timeoutId: number | undefined;
    
    // Safety timeouts to prevent getting stuck in loading states
    if ((isRegistering || isLoggingIn) && !actionLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Safety timeout triggered - resetting loading states");
        setIsRegistering(false);
        setIsLoggingIn(false);
      }, 5000); // 5 second timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isRegistering, isLoggingIn, actionLoading]);

  // Login handler with improved state management
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      console.log("Starting login attempt for:", email);
      
      const loggedInUser = await login(email, password);
      
      // Set a timeout to ensure loading state is reset even if navigation doesn't happen
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 1000);
      
      return loggedInUser;
    } catch (error) {
      console.error("Login handler error:", error);
      toast({
        title: "Login Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive"
      });
      setIsLoggingIn(false);
      return null;
    }
  }, [login, toast]);

  // Registration handler with better error handling
  const handleRegister = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      // Set a timeout to ensure loading state is reset even if navigation doesn't happen
      setTimeout(() => {
        setIsRegistering(false);
      }, 1000);
      
      return registeredUser;
    } catch (error) {
      console.error("Registration handler error:", error);
      
      if (error instanceof Error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Error",
          description: "There was a problem creating your account. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsRegistering(false);
      return null;
    }
  }, [register, toast]);

  // Logout handler
  const handleLogout = useCallback(async () => {
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
  }, [logout, navigate, toast]);

  // Combined loading state
  const isLoading = sessionLoading || actionLoading || isRegistering || isLoggingIn;

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
