
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
      
      // More detailed logging
      console.log("Attempting to sign in with Supabase");
      
      // Direct approach without timeout wrapping first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error("Direct login error:", error.message);
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
          stopLoading();
          return null;
        }

        if (data.user) {
          console.log("User authenticated successfully, formatting user data");
          const formattedUser = await formatUser(data.user);
          console.log("Formatted user data:", formattedUser);
          setUser(formattedUser);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${formattedUser?.name}!`
          });
          
          console.log("Login successful, user role:", formattedUser?.role);
          stopLoading();
          return formattedUser;
        }
        
        console.log("No user data returned from authentication");
        stopLoading();
        return null;
      } catch (directError) {
        console.error("Unexpected error during direct login:", directError);
        
        // If direct approach fails, fallback to the timeout approach
        console.log("Falling back to timeout-wrapped login approach");
        
        // Create a login promise with generous timeout - increased to 20 seconds
        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password
        });
        
        // Set up timeout to avoid hanging forever
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Login request timed out after fallback attempt")), 20000);
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
          console.error("Login error in fallback approach:", error.message);
          stopLoading();
          return null;
        }

        if (data.user) {
          console.log("User authenticated in fallback approach, formatting user data");
          const formattedUser = await formatUser(data.user);
          console.log("Formatted user from fallback:", formattedUser);
          setUser(formattedUser);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${formattedUser?.name}!`
          });
          
          console.log("Fallback login successful, user role:", formattedUser?.role);
          stopLoading();
          return formattedUser;
        }
        
        console.log("No user data returned from fallback authentication");
        stopLoading();
        return null;
      }
    } catch (error: any) {
      console.error("Catastrophic login error:", error);
      
      // Better handling of timeout errors with detailed messages
      const errorMessage = error.message.includes("timed out") 
        ? "Login request timed out. Please check your internet connection and try again. If this persists, please refresh the page."
        : "An unexpected error occurred during login. Please try again or refresh the page.";
      
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
