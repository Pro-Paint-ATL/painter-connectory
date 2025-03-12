
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
        stopLoading();
        return null;
      }

      if (data.user) {
        const formattedUser = await formatUser(data.user);
        setUser(formattedUser);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${formattedUser?.name}!`
        });
        
        console.log("Logged in user with role:", formattedUser?.role);
        stopLoading();
        return formattedUser;
      }
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
