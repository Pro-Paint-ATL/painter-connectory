
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
import { createCompanyProfile, createTrialSubscription } from "@/utils/companySetup";
import { useToast } from "@/hooks/use-toast";
import { useAuthCore } from "./useAuthCore";

export const useRegisterAction = (user: User | null, setUser: (user: User | null) => void) => {
  const { startLoading, stopLoading, setError, isLoading } = useAuthCore(user, setUser);
  const { toast } = useToast();

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    console.log("Starting registration process with role:", role);
    startLoading();
    
    try {
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        console.error("Registration auth error:", error.message);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        stopLoading();
        return null;
      }

      if (!data.user) {
        console.error("No user data returned from registration");
        toast({
          title: "Registration Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive"
        });
        stopLoading();
        return null;
      }

      console.log("Auth user created successfully");

      // Step 2: Initialize profile info for user
      let userProfile = await formatUser(data.user);
      setUser(userProfile);

      // Step 3: Create company profile for painters
      if (role === "painter") {
        console.log("Creating company profile for painter");
        const success = await createCompanyProfile(data.user.id, name);
        
        if (!success) {
          console.warn("Could not create company profile, but continuing registration");
          // We don't fail the registration - just log a warning
        }
        
        // Step 4: Create trial subscription for painters
        console.log("Creating trial subscription for painter");
        const subscriptionSuccess = await createTrialSubscription(data.user.id);
        
        if (!subscriptionSuccess) {
          console.warn("Could not create trial subscription, but continuing registration");
        }
      }

      // Get the latest user data
      userProfile = await formatUser(data.user);
      setUser(userProfile);
      
      console.log("User registered successfully with role:", role);
      toast({
        title: "Registration Successful",
        description: `Welcome to PainterMatch, ${name}!`
      });
      
      stopLoading();
      return userProfile;
    } catch (error) {
      console.error("Exception during registration:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      stopLoading();
      return null;
    }
  };

  return {
    register,
    isLoading
  };
};
