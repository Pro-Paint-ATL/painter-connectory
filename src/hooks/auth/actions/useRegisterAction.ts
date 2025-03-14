
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
import { createTrialSubscription } from "@/utils/companySetup";
import { useState } from "react";

export const useRegisterAction = (user: User | null, setUser: (user: User | null) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const safeRole = role === "admin" ? "customer" : role;
      
      console.log("Registering with role:", safeRole);
      
      // Check if user already exists to provide a better error message
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUsers) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists. Please try logging in instead.",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: safeRole
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          toast({
            title: "Registration Failed",
            description: "This email is already registered. Please log in instead.",
            variant: "destructive"
          });
        } else if (error.message.includes("sending confirmation email")) {
          // Create the user anyway but warn about email issues
          toast({
            title: "Registration Successful",
            description: "Your account was created, but there was an issue sending the confirmation email. You can still log in."
          });
          
          // If we reached here, the registration was technically successful
          if (data.user) {
            const formattedUser = await formatUser(data.user);
            
            setUser(formattedUser);
            setIsLoading(false);
            return formattedUser;
          }
        } else {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return null;
      }

      if (data.user) {
        console.log("User metadata after signup:", data.user.user_metadata);
        
        // Create a profile first before attempting trial subscription
        try {
          // First make sure the profile exists before we try to update subscription
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: name,
              email: email,
              role: safeRole,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });
            
          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Continue - we can still try to format the user
          } else {
            console.log("Profile created successfully");
          }
        } catch (profileErr) {
          console.error("Exception creating profile:", profileErr);
          // Continue anyway - we'll still try to format the user
        }
        
        // Now format the user and try to get their data
        const formattedUser = await formatUser(data.user);
        
        // If user is a painter and we have a formatted user, set up trial subscription
        // But don't block registration if this fails
        if (safeRole === "painter" && formattedUser) {
          console.log("Setting up trial for painter:", formattedUser.id);
          try {
            const subscriptionCreated = await createTrialSubscription(formattedUser.id);
            console.log("Trial subscription setup result:", subscriptionCreated);
            
            if (!subscriptionCreated) {
              // Log the issue but don't block registration
              console.log("Trial subscription setup failed, but continuing registration");
            }
          } catch (subError) {
            console.error("Error creating trial subscription:", subError);
            // Don't block registration if subscription setup fails
          }
        }
        
        setUser(formattedUser);
        
        toast({
          title: "Registration Successful",
          description: `Your account has been created as a ${safeRole}.`
        });

        setIsLoading(false);
        return formattedUser;
      }
      
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };

  return {
    register,
    isLoading
  };
};
