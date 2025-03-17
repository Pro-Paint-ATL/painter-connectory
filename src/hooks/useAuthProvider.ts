
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "./use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const hasNavigated = useRef(false);
  const isAuthenticating = useRef(false);

  // Navigate when authentication state changes
  useEffect(() => {
    // Only navigate if authenticated AND initialized AND not yet navigated
    if (user && isInitialized && !hasNavigated.current && !isAuthenticating.current) {
      console.log("Auth state is initialized with user, navigating to profile");
      
      // Set navigation flag before navigating to prevent loops
      hasNavigated.current = true;
      
      // Use setTimeout to ensure this happens after render
      setTimeout(() => {
        // Navigate directly to profile for all users
        navigate('/profile');
      }, 0);
    }
    
    // Reset navigation flag when user changes to null (logged out)
    if (!user) {
      hasNavigated.current = false;
    }
  }, [user, isInitialized, navigate]);

  // Simple login handler with direct navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Login handler started for email:", email);
      setIsLoggingIn(true);
      isAuthenticating.current = true;
      
      const loggedInUser = await login(email, password);
      
      if (loggedInUser) {
        console.log("Login successful, user object returned:", loggedInUser.id);
        
        // Set navigation flag to avoid loops
        hasNavigated.current = true;
        
        // Explicit navigation after successful login
        navigate('/profile', { replace: true });
        
        return loggedInUser;
      }
      
      console.log("Login did not return a valid user");
      isAuthenticating.current = false;
      return null;
    } catch (error) {
      console.error("Login handler error:", error);
      isAuthenticating.current = false;
      toast({
        title: "Login Error",
        description: "Failed to complete the login process. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoggingIn(false);
      // Reset the authenticating flag after a delay
      setTimeout(() => {
        isAuthenticating.current = false;
      }, 500);
    }
  };

  // Basic registration handler
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    isAuthenticating.current = true;
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        
        // Set navigation flag to avoid loops
        hasNavigated.current = true;
        
        // Explicit navigation after successful registration
        navigate('/profile', { replace: true });
        
        return registeredUser;
      }
      
      console.log("Registration did not return a user object");
      isAuthenticating.current = false;
      return null;
    } catch (error) {
      console.error("Registration error:", error);
      isAuthenticating.current = false;
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "There was a problem creating your account.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsRegistering(false);
      // Reset the authenticating flag after a delay
      setTimeout(() => {
        isAuthenticating.current = false;
      }, 500);
    }
  };

  // Simple logout handler
  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out, navigating to home page");
      navigate('/', { replace: true });
      hasNavigated.current = false;
      isAuthenticating.current = false;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

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
