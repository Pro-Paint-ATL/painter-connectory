
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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
    // Very short safety timeout to avoid stuck states - 1 second max
    const safetyTimeout = setTimeout(() => {
      if (isLoading && !isInitialized) {
        console.log("Safety timeout triggered - forcing auth state to be initialized");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 1000); // 1 second safety timeout (reduced from 1.5)

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking auth state...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
        if (session) {
          console.log("Found existing session for user:", session.user.id);
          await handleUserSession(session);
        } else {
          console.log("No existing session found");
          setUser(null);
        }
        
        // Mark auth as initialized and stop loading regardless of the result
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
        // Ensure we're not stuck in loading state even if there's an error
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        // Immediately update our initialized state for any auth event
        setIsInitialized(true);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in:", session.user.id);
          await handleUserSession(session);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setIsLoading(false);
        } else if (event === 'USER_UPDATED' && session) {
          console.log("User updated:", session.user.id);
          await handleUserSession(session);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("Token refreshed for user:", session.user.id);
          await handleUserSession(session);
          setIsLoading(false);
        } else {
          // For any other event, make sure we're not stuck in loading
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscription");
      subscription?.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  return { user, setUser, isLoading, isInitialized };
};
