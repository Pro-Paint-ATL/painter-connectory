
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { useAuthCore } from "./useAuthCore";

export const useProfileAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, setIsLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          location: data.location as any,
          role: data.role,
          subscription: data.subscription as any,
          company_info: data.companyInfo as any
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      setUser({ ...user, ...data });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    isLoading
  };
};
