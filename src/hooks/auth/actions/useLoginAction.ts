
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
      
      // Clear any existing login state
      if (user) {
        console.log("Clearing existing user state before login");
        setUser(null);
      }
      
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
        stopLoading();
        return null;
      }

      if (data.user) {
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
    }
  };

  return {
    login,
    isLoading
  };
};
