
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";
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
      const { data: existingUsers, error: existingError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingError) {
        console.log("Error checking for existing user:", existingError);
        // Continue with registration even if we couldn't check for existing users
      } else if (existingUsers) {
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
      
      // Create a basic user object that we can return immediately
      const basicUser: User = {
        id: data.user.id,
        name: name,
        email: email,
        role: safeRole
      };
      
      // Set the user immediately to avoid waiting for profile creation
      setUser(basicUser);
      
      // Create the profile in the background
      try {
        const { error: profileError } = await supabase
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
          // Continue anyway since we've already set the basic user
        } else {
          console.log("Initial profile created successfully");
        }
      } catch (profileErr) {
        console.error("Exception creating initial profile:", profileErr);
        // Continue anyway since we've already set the basic user
      }
      
      // Add small delay before showing success message to prevent UI flicker
      setTimeout(() => {
        toast({
          title: "Registration Successful",
          description: `Your account has been created as a ${safeRole}.`
        });
        setIsLoading(false);
      }, 300);

      return basicUser;
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
