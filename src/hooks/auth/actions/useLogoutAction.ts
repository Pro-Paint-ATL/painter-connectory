
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { useAuthCore } from "./useAuthCore";

export const useLogoutAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, startLoading, stopLoading, handleError } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const logout = async () => {
    startLoading();
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Logout error:", error);
      handleError("Failed to log out");
      
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  return {
    logout,
    isLoading
  };
};
