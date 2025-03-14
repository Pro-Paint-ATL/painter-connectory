
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
    if (isLoading) return null; // Prevent multiple calls while loading
    
    setIsLoading(true);
    console.log("Starting registration process with role:", role);
    
    try {
      // Use customer role if admin is attempted (for safety)
      const safeRole = role === "admin" ? "customer" : role;
      
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

      // Perform the signup
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
        console.error("Signup error:", error.message);
        
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          toast({
            title: "Already Registered",
            description: "This email is already registered. Please log in instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration Error",
            description: error.message || "Failed to register",
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
        return null;
      }

      // At this point registration succeeded
      if (data.user) {
        console.log("User registered successfully, formatting user data");
        let formattedUser = null;
        
        try {
          // Create a basic user object first as fallback
          const basicUser: User = {
            id: data.user.id,
            name: name,
            email: email,
            role: safeRole
          };
          
          // Set the user immediately to prevent loading state issues
          setUser(basicUser);
          
          // Try to format the user for more complete data
          formattedUser = await formatUser(data.user);
          
          if (formattedUser) {
            console.log("User formatted:", formattedUser);
            setUser(formattedUser);
          } else {
            formattedUser = basicUser;
          }
          
          // If this is a painter, try to create a trial subscription
          if (safeRole === "painter") {
            try {
              console.log("Creating trial subscription for painter");
              await createTrialSubscription(formattedUser.id);
            } catch (subError) {
              console.error("Error creating trial subscription:", subError);
              // Don't block registration if subscription setup fails
            }
          }
          
          toast({
            title: "Registration Successful",
            description: `Welcome! Your account has been created.`
          });
          
          return formattedUser;
        } catch (formatError) {
          console.error("Failed to format user:", formatError);
          
          // Already set a basic user above, so just return it
          return {
            id: data.user.id,
            name: name,
            email: email,
            role: safeRole
          };
        }
      } else {
        console.log("Registration succeeded but no user data returned");
        toast({
          title: "Registration Issue",
          description: "Your account may have been created but we couldn't log you in automatically.",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      console.error("Unexpected registration error:", err);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    } finally {
      // Ensure loading is reset with a slight delay to allow state updates to propagate
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  return {
    register,
    isLoading
  };
};
