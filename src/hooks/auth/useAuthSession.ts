
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserSession = async (session: any) => {
    if (session) {
      try {
        console.log("Formatting user from session:", session.user.id);
        const formattedUser = await formatUser(session.user);
        if (formattedUser) {
          console.log("User session loaded with role:", formattedUser.role);
          setUser(formattedUser);
          return formattedUser;
        } else {
          console.error("Could not format user from session");
          setUser(null);
          return null;
        }
      } catch (error) {
        console.error("Error formatting user:", error);
        setUser(null);
        return null;
      }
    } else {
      console.log("No session found, user is null");
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking auth state...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          console.log("Found existing session for user:", session.user.id);
          await handleUserSession(session);
        } else {
          console.log("No existing session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in:", session.user.id);
          await handleUserSession(session);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
        } else if (event === 'USER_UPDATED' && session) {
          console.log("User updated:", session.user.id);
          await handleUserSession(session);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("Token refreshed for user:", session.user.id);
          await handleUserSession(session);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscription");
      subscription?.unsubscribe();
    };
  }, []);

  return { user, setUser, isLoading };
};
