
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
  const { toast } = useToast();

  // Register event listener for painter registration
  useEffect(() => {
    const handleOpenRegisterPainter = () => {
      // Wait for DOM to update
      setTimeout(() => {
        const registerButton = document.querySelector('button:has-text("Sign Up")');
        if (registerButton) {
          (registerButton as HTMLButtonElement).click();
          // Wait for dialog to open
          setTimeout(() => {
            const painterButton = document.querySelector('button:has-text("Painter")');
            if (painterButton) {
              (painterButton as HTMLButtonElement).click();
            }
          }, 300);
        }
      }, 300);
    };

    window.addEventListener('open-register-painter', handleOpenRegisterPainter);
    
    return () => {
      window.removeEventListener('open-register-painter', handleOpenRegisterPainter);
    };
  }, []);

  // Handle login with navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        console.log("User logged in successfully, navigating based on role");
        // Small delay to ensure user state is fully updated
        setTimeout(() => navigateBasedOnRole(), 100);
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
    }
  };

  // Handle registration with navigation
  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Registering user with role:", role);
    
    try {
      const registeredUser = await register(name, email, password, role);
      
      if (registeredUser) {
        console.log("User registered successfully with role:", registeredUser.role);
        
        // For painter roles, navigate to subscription page
        if (registeredUser.role === "painter") {
          console.log("Painter registered, navigating to subscription page");
          toast({
            title: "Account Created!",
            description: "Your painter account has been created. You can now set up your subscription.",
          });
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
          description: "There was a problem creating your account. Please try again.",
          variant: "destructive"
        });
      }
      
      return registeredUser;
    } catch (error: any) {
      console.error("Registration handler error:", error);
      const errorMessage = error?.message || "There was a problem creating your account";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
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
  const isLoading = (isInitialized ? false : sessionLoading) || actionLoading;

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
