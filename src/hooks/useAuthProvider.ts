
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

  // Navigate when authentication state changes - with a safety timeout
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (user && isInitialized && !sessionLoading) {
      console.log("Auth state stable with user, navigating based on role:", user.role);
      // Allow a very short delay for the UI to catch up
      setTimeout(() => {
        navigateBasedOnRole();
      }, 50);
    }
    
    // Safety timeout to prevent users from getting stuck in loading state
    if ((isRegistering || isLoggingIn) && !user) {
      timeoutId = window.setTimeout(() => {
        setIsRegistering(false);
        setIsLoggingIn(false);
        console.log("Safety timeout triggered - resetting loading states");
      }, 6000); // Reduced from 8 seconds to 6 seconds
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [user, isInitialized, sessionLoading, isRegistering, isLoggingIn]);

  // Simplified login handler with better progress tracking
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      console.log("Starting login attempt for:", email);
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        console.log("User logged in successfully with role:", loggedInUser.role);
        // Navigation will be handled by the effect above
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
      // Set a short delay before resetting loading state
      // This helps prevent flashing of UI elements
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 300);
    }
  };

  // Simplified registration handler with better error handling
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        // Navigation will be handled by the effect above
        return registeredUser;
      }
      
      console.log("Registration did not return a user object");
      return null;
    } catch (error) {
      console.error("Registration handler error:", error);
      
      // Specific handling for email confirmation errors
      if (error instanceof Error && 
          (error.message.includes("confirmation email") || 
           error.message.includes("unexpected_failure"))) {
        toast({
          title: "Registration Issue",
          description: "Your account was created but there was an issue with email confirmation. You may still be able to log in.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Error",
          description: error instanceof Error ? error.message : "There was a problem creating your account. Please try again.",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      // Set a timeout to reset the loading state after a short delay
      setTimeout(() => {
        setIsRegistering(false);
      }, 300);
    }
  };

  // Simplified logout handler
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

  // Combined loading state - but make sure we don't get stuck
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
