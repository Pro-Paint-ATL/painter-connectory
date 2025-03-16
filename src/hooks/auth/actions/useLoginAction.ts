
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
import { useAuthCore } from "./useAuthCore";
import { useState } from "react";

export const useLoginAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, setIsLoading, startLoading, stopLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();
  const [loginAttempted, setLoginAttempted] = useState(false);

  const login = async (email: string, password: string) => {
    startLoading();
    setLoginAttempted(true);
    
    try {
      console.log("Starting login process for:", email);
      
      // Increased timeout to 15 seconds for login
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => 
        setTimeout(() => reject(new Error("Login timed out after 15 seconds")), 15000)
      );
      
      // Clear any existing login state
      if (user) {
        console.log("Clearing existing user state before login");
        setUser(null);
      }
      
      let result;
      try {
        result = await Promise.race([loginPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error("Login process timed out:", timeoutError);
        toast({
          title: "Login Timeout",
          description: "Login process took too long. Please try again.",
          variant: "destructive"
        });
        stopLoading();
        return null;
      }
      
      const { data, error } = result;

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Login error:", error.message);
        stopLoading();
        return null;
      }

      if (data?.user) {
        console.log("User authenticated, formatting user data");
        const formattedUser = await formatUser(data.user);
        console.log("Formatted user:", formattedUser);
        
        if (formattedUser) {
          setUser(formattedUser);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${formattedUser.name}!`
          });
          
          console.log("Logged in user with role:", formattedUser.role);
          
          // Complete the login process
          stopLoading();
          return formattedUser;
        } else {
          console.error("Could not format user after successful authentication");
          toast({
            title: "Login Error",
            description: "User authenticated but profile could not be loaded",
            variant: "destructive"
          });
          stopLoading();
          return null;
        }
      }
      
      console.log("No user data returned from authentication");
      stopLoading();
      return null;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      stopLoading();
      return null;
    } finally {
      // Ensure loading state is cleared after timeout
      setTimeout(() => {
        if (isLoading) {
          console.log("Forcing login process to complete after timeout");
          stopLoading();
        }
      }, 16000);
    }
  };

  return {
    login,
    isLoading,
    loginAttempted
  };
};
