
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        stopLoading();
        throw new Error(error.message);
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id);
        
        // Use the simplified formatUser function that doesn't query profiles
        const formattedUser = formatUser(data.user);
        
        console.log("Formatted user data:", formattedUser);
        
        // Set the user in state
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
      throw new Error("No user data returned");
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login. Please try again.",
        variant: "destructive"
      });
      
      stopLoading();
      throw error;
    }
  };

  return {
    login,
    isLoading
  };
};
