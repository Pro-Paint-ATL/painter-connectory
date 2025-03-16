
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
import { useAuthCore } from "./useAuthCore";

export const useLoginAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, setIsLoading, startLoading, stopLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    startLoading();
    try {
      console.log("Starting login process for:", email);
      
      // Create a login promise with timeout - increased to 15 seconds
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Set up timeout to avoid hanging forever
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login request timed out")), 15000);
      });
      
      // Race the login against the timeout
      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;

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

      if (data.user) {
        console.log("User authenticated, formatting user data");
        const formattedUser = await formatUser(data.user);
        console.log("Formatted user:", formattedUser);
        setUser(formattedUser);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${formattedUser?.name}!`
        });
        
        console.log("Logged in user with role:", formattedUser?.role);
        stopLoading();
        return formattedUser;
      }
      console.log("No user data returned from authentication");
      stopLoading();
      return null;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Better handling of timeout errors
      const errorMessage = error.message.includes("timed out") 
        ? "Login request timed out. Please check your internet connection and try again."
        : "An unexpected error occurred. Please try again.";
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      stopLoading();
      return null;
    }
  };

  return {
    login,
    isLoading
  };
};
