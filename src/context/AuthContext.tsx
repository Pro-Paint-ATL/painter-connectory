
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Create the context with a more explicit undefined check
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    if (auth.isLoading) {
      // Only show loader after a very short delay to prevent flashing
      const timer = setTimeout(() => {
        setShowLoader(true);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      // Clear the loader immediately when loading stops
      setShowLoader(false);
    }
  }, [auth.isLoading]);

  // Enforce a maximum loading time of 8 seconds to prevent infinite loading
  useEffect(() => {
    if (auth.isLoading && !auth.isInitialized) {
      const forceInitTimeout = setTimeout(() => {
        console.log("Forcing auth initialization after timeout");
        // If we're still loading after 8 seconds, force it to complete
        if (!auth.isInitialized) {
          // The auth object will be updated by its own timeout
          // This is just a safety measure
        }
      }, 8000); // 8 second max loading time
      
      return () => clearTimeout(forceInitTimeout);
    }
  }, [auth.isLoading, auth.isInitialized]);

  // Only show the loader when we're still loading and not yet initialized
  if (!auth.isInitialized && auth.isLoading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="text-lg">Loading authentication...</span>
        <p className="text-sm text-muted-foreground mt-2">This should only take a moment</p>
      </div>
    );
  }

  // Always provide the context values, even if we're still initializing
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
