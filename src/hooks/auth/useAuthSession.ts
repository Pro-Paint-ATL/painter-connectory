
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
        const formattedUser = await formatUser(session.user);
        setUser(formattedUser);
        console.log("User session loaded with role:", formattedUser?.role);
        return formattedUser;
      } catch (error) {
        console.error("Error formatting user:", error);
        setUser(null);
        return null;
      }
    } else {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          await handleUserSession(session);
        } else {
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
          await handleUserSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'USER_UPDATED' && session) {
          await handleUserSession(session);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Handle token refresh - this is important for long sessions
          await handleUserSession(session);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, setUser, isLoading };
};
