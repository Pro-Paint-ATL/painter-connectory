
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, UserLocation } from "@/types/auth";
import { useAuthCore } from "./useAuthCore";

export const useProfileAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { isLoading, setIsLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Ensure location data is properly formatted
      let locationData = data.location;
      
      // If we're updating location, make sure it has the right structure
      if (locationData) {
        // Check if it's already an object with address
        if (typeof locationData === 'string' || !('address' in locationData)) {
          locationData = {
            address: typeof locationData === 'string' ? locationData : '',
            latitude: user.location?.latitude || 0,
            longitude: user.location?.longitude || 0,
            phone: user.location?.phone || '',
            bio: user.location?.bio || ''
          };
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          location: locationData as any,
          role: data.role,
          subscription: data.subscription as any,
          company_info: data.companyInfo as any
        })
        .eq('id', user.id);

      if (error) {
        console.error("Profile update error:", error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      // Update the user state with new data
      const updatedUser = { ...user, ...data, location: locationData as UserLocation };
      setUser(updatedUser);
      
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
