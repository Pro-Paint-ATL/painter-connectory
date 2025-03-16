
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const authCheckCompleted = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const maxAuthWaitTime = 5000; // Maximum time to wait for auth in milliseconds

  const handleUserSession = async (session: any) => {
    if (!session) {
      console.log("No session found, user is null");
      setUser(null);
      return null;
    }
    
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
  };

  useEffect(() => {
    // Set up a safety timeout to prevent getting stuck in loading state
    timeoutRef.current = window.setTimeout(() => {
      if (isLoading && !isInitialized) {
        console.log("Safety timeout triggered - forcing auth state to be initialized");
        setIsLoading(false);
        setIsInitialized(true);
        authCheckCompleted.current = true;
      }
    }, maxAuthWaitTime);

    const checkAuth = async () => {
      try {
        if (authCheckCompleted.current) return;
        
        setIsLoading(true);
        console.log("Checking auth state...");
        
        // Use a timeout for the getSession call to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth session check timed out")), 3000)
        );
        
        try {
          const { data: { session } } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          await handleUserSession(session);
        } catch (sessionError) {
          console.error("Error or timeout getting session:", sessionError);
          setUser(null);
        }
        
        // Mark auth as initialized and stop loading
        setIsInitialized(true);
        setIsLoading(false);
        authCheckCompleted.current = true;
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
        setIsInitialized(true);
        setIsLoading(false);
        authCheckCompleted.current = true;
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        // Update initialized state immediately
        if (!isInitialized) {
          setIsInitialized(true);
        }
        
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
          // For any other event, ensure we're not stuck in loading
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscription");
      subscription?.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { user, setUser, isLoading, isInitialized };
};
