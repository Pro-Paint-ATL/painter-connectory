
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "./use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login: loginAction, register: registerAction, logout: logoutAction, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  
  // Refs to track navigation and authentication state
  const hasNavigated = useRef(false);
  const isAuthenticating = useRef(false);
  const loginCompleted = useRef(false);

  // Handle navigation when authentication state changes
  useEffect(() => {
    // Skip navigation if we're in the middle of an authentication process
    if (isAuthenticating.current) {
      console.log("Skipping navigation, authentication in progress");
      return;
    }

    // Only navigate if we have a user, auth is initialized, and we haven't already navigated
    if (user && isInitialized && !hasNavigated.current) {
      console.log("Auth state is initialized with user, navigating to profile");
      
      // Set navigation flag to prevent redundant navigation
      hasNavigated.current = true;
      
      // Delay navigation slightly to ensure state updates
      setTimeout(() => {
        navigateBasedOnRole();
      }, 100);
    }
    
    // Reset navigation flag when user logs out
    if (!user) {
      hasNavigated.current = false;
      loginCompleted.current = false;
    }
  }, [user, isInitialized, navigateBasedOnRole]);

  // Handle login with explicit navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Login handler started for email:", email);
      
      // Set loading state and authentication flag
      setIsLoggingIn(true);
      isAuthenticating.current = true;
      loginCompleted.current = false;
      
      const loggedInUser = await loginAction(email, password);
      
      if (loggedInUser) {
        console.log("Login successful, user:", loggedInUser.id);
        
        // Set navigation flag to prevent redundant navigation
        hasNavigated.current = true;
        loginCompleted.current = true;
        
        // Navigate to appropriate page based on user role
        setTimeout(() => {
          if (loggedInUser.role === "painter") {
            navigate('/painter-dashboard', { replace: true });
          } else if (loggedInUser.role === "admin") {
            navigate('/admin', { replace: true });
          } else {
            navigate('/profile', { replace: true });
          }
        }, 300);
        
        return loggedInUser;
      }
      
      console.log("Login did not return a valid user");
      isAuthenticating.current = false;
      loginCompleted.current = false;
      setIsLoggingIn(false);
      return null;
    } catch (error) {
      console.error("Login handler error:", error);
      isAuthenticating.current = false;
      loginCompleted.current = false;
      setIsLoggingIn(false);
      toast({
        title: "Login Error",
        description: "Failed to complete the login process. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to allow LoginDialog to handle the error
    } finally {
      // Reset authentication flag and loading state after a delay
      setTimeout(() => {
        if (loginCompleted.current) {
          setIsLoggingIn(false);
        }
        isAuthenticating.current = loginCompleted.current;
      }, 800);
    }
  };

  // Handle registration with explicit navigation
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    isAuthenticating.current = true;
    
    try {
      const registeredUser = await registerAction(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        
        // Set navigation flag to prevent redundant navigation
        hasNavigated.current = true;
        
        // Navigate based on role
        setTimeout(() => {
          if (registeredUser.role === "painter") {
            navigate('/painter-dashboard', { replace: true });
          } else {
            navigate('/profile', { replace: true });
          }
        }, 300);
        
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
      throw error; // Re-throw to allow RegisterDialog to handle the error
    } finally {
      setIsRegistering(false);
      // Reset authentication flag after a delay
      setTimeout(() => {
        isAuthenticating.current = false;
      }, 800);
    }
  };

  // Handle logout with navigation
  const handleLogout = async () => {
    try {
      await logoutAction();
      console.log("User logged out, navigating to home page");
      navigate('/', { replace: true });
      hasNavigated.current = false;
      isAuthenticating.current = false;
      loginCompleted.current = false;
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
