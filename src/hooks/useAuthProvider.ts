
import { useAuthSession } from "./auth/useAuthSession";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthNavigation } from "./auth/useNavigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

export const useAuthProvider = () => {
  const { user, setUser, isLoading: sessionLoading, isInitialized } = useAuthSession();
  const { login, register, logout, updateUserProfile, isLoading: actionLoading } = useAuthActions(user, setUser);
  const { navigateBasedOnRole, navigate } = useAuthNavigation(user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  // Make sure to initialize the RPC functions
  useEffect(() => {
    const initRpcFunctions = async () => {
      try {
        console.log("Initializing RPC functions...");
        const { data, error } = await supabase.functions.invoke('create-rpc-functions', {
          body: { action: 'create_rpc_functions' }
        });
        
        if (error) {
          console.error("Error initializing RPC functions:", error);
        } else {
          console.log("RPC functions initialized:", data);
        }
      } catch (e) {
        console.error("Failed to initialize RPC functions:", e);
      }
    };
    
    initRpcFunctions();
  }, []);

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    if (isLoggingIn) return null; // Prevent multiple simultaneous logins
    
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        console.log("User logged in successfully, navigating based on role");
        navigateBasedOnRole();
      }
      return loggedInUser;
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
    if (isRegistering) return null; // Prevent multiple simultaneous registrations
    
    console.log("Registering user with role:", role);
    setIsRegistering(true);
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        
        // Navigate based on role
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
      } else {
        console.log("Registration did not return a user object");
        toast({
          title: "Registration Issue",
          description: "There was a problem with your registration. Please try again.",
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
      setIsRegistering(false); // Make sure to reset isRegistering in all code paths
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

  // Combined loading state
  const isLoading = isRegistering || isLoggingIn || ((!isInitialized) && sessionLoading) || actionLoading;

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
