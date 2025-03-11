
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserSession = async (session: any) => {
    if (session) {
      const formattedUser = await formatUser(session.user);
      setUser(formattedUser);
      console.log("User session loaded with role:", formattedUser?.role);
      return formattedUser;
    } else {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          await handleUserSession(session);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          if (event === 'SIGNED_IN' && session) {
            await handleUserSession(session);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if (event === 'USER_UPDATED' && session) {
            const formattedUser = await formatUser(session.user);
            setUser(formattedUser);
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      setIsLoading(false);
    }
  }, []);

  return { user, setUser, isLoading };
};
