
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
import { useAuthCore } from "./useAuthCore";

export const useLoginAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, startLoading, stopLoading } = useAuthCore(user, setUser);
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
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Login error:", error.message);
        stopLoading(error.message);
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
      stopLoading("No user data returned from authentication");
      return null;
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred during login";
      console.error("Login error:", errorMessage);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      stopLoading(errorMessage);
      return null;
    }
  };

  return {
    login,
    isLoading
  };
};
