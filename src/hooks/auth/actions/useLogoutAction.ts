
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { useAuthCore } from "./useAuthCore";

export const useLogoutAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, setIsLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const logout = async () => {
    setIsLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading
  };
};
