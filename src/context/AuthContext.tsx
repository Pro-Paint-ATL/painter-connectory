
import React, { createContext, useContext } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  // Add a timeout to prevent infinite loading
  const [showLoader, setShowLoader] = React.useState(false);
  
  React.useEffect(() => {
    // Only show the loader after a short delay to prevent flashing
    const timer = setTimeout(() => {
      if (auth.isLoading) {
        setShowLoader(true);
      }
    }, 500);
    
    // Clear the loader when auth is no longer loading
    if (!auth.isLoading && showLoader) {
      setShowLoader(false);
    }
    
    return () => clearTimeout(timer);
  }, [auth.isLoading, showLoader]);

  // If we've finished initialization but not loading, don't show loader
  if (auth.isInitialized && !auth.isLoading) {
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

  // Show a loading indicator while authentication is being determined
  // But add a timeout to prevent infinite loading
  if (auth.isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Default case: Auth is not initialized but not loading
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
