
import React, { createContext, useContext, useEffect } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  // Add a timeout to prevent infinite loading
  const [showLoader, setShowLoader] = React.useState(false);
  
  useEffect(() => {
    if (auth.isLoading) {
      // Only show loader after a short delay to prevent flashing
      const timer = setTimeout(() => {
        setShowLoader(true);
      }, 300); // shorter delay to prevent UI flashing
      
      return () => clearTimeout(timer);
    } else {
      // Clear the loader immediately when loading stops
      setShowLoader(false);
    }
  }, [auth.isLoading]);

  // If initialization is complete or we're not loading, show the content
  if (auth.isInitialized || !auth.isLoading) {
    return (
      <AuthContext.Provider
        value={{
          ...auth,
          supabase
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // Only show loader if we're still initializing and the timeout has passed
  if (auth.isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // If we're loading but loader shouldn't show yet, render invisible placeholder
  return (
    <AuthContext.Provider
      value={{
        ...auth,
        supabase
      }}
    >
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
