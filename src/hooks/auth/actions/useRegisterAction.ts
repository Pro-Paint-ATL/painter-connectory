
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
      console.log("Starting registration process for role:", role);
      const safeRole = role === "admin" ? "customer" : role;
      
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

      if (!data.user) {
        toast({
          title: "Registration Failed",
          description: "No user data returned from registration",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      console.log("User created successfully with metadata:", data.user.user_metadata);
      
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
          console.error("Error creating initial profile:", profileError);
          // Continue anyway - we'll try to format the user
          toast({
            title: "Profile Creation Warning",
            description: "Your account was created, but there was an issue setting up your profile.",
          });
        } else {
          console.log("Initial profile created successfully");
        }
      } catch (profileErr) {
        console.error("Exception creating initial profile:", profileErr);
        // Continue anyway - we'll still try to format the user
      }
      
      // Now format the user and try to get their data
      let formattedUser: User | null = null;
      try {
        formattedUser = await formatUser(data.user);
        console.log("User formatted successfully:", formattedUser);
      } catch (formatError) {
        console.error("Error formatting user:", formatError);
        // Try a simpler approach
        formattedUser = {
          id: data.user.id,
          name: name,
          email: email,
          role: safeRole
        };
        console.log("Created basic user object as fallback");
      }
      
      // If user is a painter and we have a formatted user, set up trial subscription
      // But don't block registration if this fails
      if (safeRole === "painter" && formattedUser) {
        console.log("Setting up trial for painter:", formattedUser.id);
        try {
          // Create a simple object for company info if not present
          if (!formattedUser.companyInfo) {
            formattedUser.companyInfo = {
              companyName: '',
              isInsured: false,
              specialties: []
            };
          }
          
          // Create trial subscription - this is non-blocking
          setTimeout(async () => {
            try {
              const subscriptionCreated = await createTrialSubscription(formattedUser!.id);
              console.log("Delayed trial subscription setup result:", subscriptionCreated);
            } catch (delayedSubError) {
              console.error("Error in delayed subscription setup:", delayedSubError);
            }
          }, 500);
        } catch (subError) {
          console.error("Error in trial subscription setup:", subError);
          // Don't block registration if subscription setup fails
        }
      }
      
      // Set the user state even if trial creation fails
      setUser(formattedUser);
      
      toast({
        title: "Registration Successful",
        description: `Your account has been created as a ${safeRole}.`
      });

      setIsLoading(false);
      return formattedUser;
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
