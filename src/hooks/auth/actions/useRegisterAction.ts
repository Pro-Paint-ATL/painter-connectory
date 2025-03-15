
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
    console.log("Starting registration process with role:", role);
    setIsLoading(true);
    
    try {
      // Safety check - don't allow 'admin' role from regular signup
      const safeRole = role === "admin" ? "customer" : role;
      
      console.log("Registering with role:", safeRole);
      
      // Check if user already exists
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

      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: safeRole
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Email Confirmation Required",
          description: "Please check your email to confirm your account before logging in.",
        });
        setIsLoading(false);
        return null;
      }

      if (data.user && data.session) {
        console.log("User registered successfully, creating formatted user");
        
        // Format user data for our app
        const formattedUser = await formatUser(data.user);
        console.log("Formatted user data:", formattedUser);
        
        // Handle painter-specific setup
        if (safeRole === "painter" && formattedUser) {
          console.log("Creating trial subscription for painter");
          try {
            await createTrialSubscription(formattedUser.id);
            console.log("Trial subscription setup completed");
          } catch (subError) {
            console.error("Error creating trial subscription:", subError);
            // Continue despite subscription error
          }
        }
        
        // Update user in context
        setUser(formattedUser);
        
        toast({
          title: "Registration Successful",
          description: "Your account has been created and you're now logged in."
        });

        console.log("Registration completed successfully");
        setIsLoading(false);
        return formattedUser;
      }
      
      // Handle unexpected case
      toast({
        title: "Registration Status Unknown",
        description: "Your account may have been created. Please try logging in.",
      });
      
      console.log("Registration process completed with unclear result");
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Unexpected registration error:", error);
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
