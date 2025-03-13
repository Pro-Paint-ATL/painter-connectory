import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    if (auth.isLoading) {
      // Only show loader after a short delay to prevent flashing
      const timer = setTimeout(() => {
        setShowLoader(true);
      }, 150); // even shorter delay
      
      return () => clearTimeout(timer);
    } else {
      // Clear the loader immediately when loading stops
      setShowLoader(false);
    }
  }, [auth.isLoading]);

  // Don't render children until we've at least tried to initialize
  if (!auth.isInitialized && auth.isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Otherwise, always render the provider with children
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
