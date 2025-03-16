import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback, useRef } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "./use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigationAttempted = useRef(false);
  
  // Navigation when auth state changes - only if we're fully initialized and not loading
  useEffect(() => {
    // Only navigate if we have a user, are initialized, and not in a loading state
    if (user && isInitialized && !sessionLoading && !actionLoading && 
        !isLoggingIn && !isRegistering && !navigationAttempted.current) {
      console.log("Auth state stable with user, navigating based on role:", user.role);
      navigationAttempted.current = true;
      
      // Small delay to allow state to settle
      const navigationTimer = setTimeout(() => {
        navigateBasedOnRole();
      }, 100); // Increased from 50ms to 100ms for better state settling
      
      return () => clearTimeout(navigationTimer);
    }
    
    // Reset navigation attempt if we lose our user
    if (!user && navigationAttempted.current) {
      navigationAttempted.current = false;
    }
  }, [user, isInitialized, sessionLoading, actionLoading, isLoggingIn, isRegistering]);
  
  // Safety cleanup for loading states
  useEffect(() => {
    const timeoutIds: number[] = [];
    
    // Safety timeouts to prevent getting stuck in loading states
    if (isRegistering || isLoggingIn) {
      timeoutIds.push(window.setTimeout(() => {
        console.log("Safety timeout triggered - resetting loading states");
        setIsRegistering(false);
        setIsLoggingIn(false);
      }, 15000)); // Increased from 5 seconds to 15 seconds
    }
    
    // Add another timeout for overall auth process
    if (sessionLoading || actionLoading) {
      timeoutIds.push(window.setTimeout(() => {
        console.log("Global auth timeout triggered");
        // Can't directly modify these states as they come from other hooks
        // But this serves as a fallback for the UI to continue
      }, 16000)); // Increased from 6 seconds to 16 seconds
    }
    
    return () => {
      timeoutIds.forEach(id => window.clearTimeout(id));
    };
  }, [isRegistering, isLoggingIn, actionLoading, sessionLoading]);

  // Login handler with improved state management
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      console.log("Starting login attempt for:", email);
      
      const loggedInUser = await login(email, password);
      
      // If login was successful, keep the loading state until navigation
      if (loggedInUser) {
        console.log("Login successful, user will be redirected based on role");
        // We'll let the navigation effect handle the loading state reset
        
        // But also set a backup timeout to ensure we don't get stuck
        setTimeout(() => {
          if (isLoggingIn) {
            console.log("Login timeout safety - resetting loading state");
            setIsLoggingIn(false);
          }
        }, 3000);
      } else {
        // If login failed, reset the loading state immediately
        console.log("Login unsuccessful, resetting loading state");
        setIsLoggingIn(false);
      }
      
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
      
      // If registration was successful, keep loading state until navigation
      if (registeredUser) {
        console.log("Registration successful, user will be redirected based on role");
        
        // Set a backup timeout to ensure we don't get stuck
        setTimeout(() => {
          if (isRegistering) {
            console.log("Registration timeout safety - resetting loading state");
            setIsRegistering(false);
          }
        }, 3000);
      } else {
        // If registration failed, reset the loading state immediately
        console.log("Registration unsuccessful, resetting loading state");
        setIsRegistering(false);
      }
      
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
      navigationAttempted.current = false;
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
