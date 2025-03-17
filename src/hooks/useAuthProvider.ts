
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

  // Navigate when authentication state changes - with an improved safety timeout
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (user && isInitialized && !sessionLoading) {
      console.log("Auth state stable with user, navigating based on role:", user.role);
      navigateBasedOnRole();
    }
    
    // Increased safety timeout to prevent users from getting stuck in loading state
    if ((isRegistering || isLoggingIn) && !user) {
      timeoutId = window.setTimeout(() => {
        if (isRegistering || isLoggingIn) {
          console.log("Safety timeout triggered - resetting loading states");
          setIsRegistering(false);
          setIsLoggingIn(false);
          
          toast({
            title: "Authentication timeout",
            description: "The authentication process took too long. Please try again.",
            variant: "destructive"
          });
        }
      }, 20000); // 20 seconds timeout (increased)
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [user, isInitialized, sessionLoading, isRegistering, isLoggingIn]);

  // Enhanced login handler with better error handling
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Login handler started for email:", email);
      setIsLoggingIn(true);
      
      // Clear any existing session first to avoid conflicts
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.log("Warning: couldn't clear existing session:", error.message);
        } else {
          console.log("Successfully cleared any existing session");
        }
      } catch (signOutError) {
        console.log("Error clearing session:", signOutError);
      }
      
      // Proceed with login
      console.log("Proceeding with login attempt");
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        console.log("Login handler: user logged in successfully with role:", loggedInUser.role);
        // Navigation will be handled by the effect above
        return loggedInUser;
      }
      
      console.log("Login handler: login did not return a valid user");
      return null;
    } catch (error) {
      console.error("Login handler catastrophic error:", error);
      toast({
        title: "Login Error",
        description: "Failed to complete the login process. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      // Immediate state update to avoid race conditions
      console.log("Login handler completed, resetting login state");
      setIsLoggingIn(false);
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

  // Combined loading state from all sources
  const isLoading = (!isInitialized && sessionLoading) || actionLoading || isRegistering || isLoggingIn;

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
