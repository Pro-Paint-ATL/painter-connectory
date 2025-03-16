
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Create context with default values to avoid the undefined check
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  updateUserProfile: async () => null,
  supabase
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    // If we've been loading for more than 250ms, show the loader
    let loaderTimer: number;
    
    if (auth.isLoading) {
      loaderTimer = window.setTimeout(() => {
        setShowLoader(true);
      }, 250);
    } else {
      setShowLoader(false);
    }
    
    return () => {
      if (loaderTimer) {
        window.clearTimeout(loaderTimer);
      }
    };
  }, [auth.isLoading]);

  // Only show the loader when we're still loading and not yet initialized
  // AND we've been loading for more than the timer duration
  if (!auth.isInitialized && auth.isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // No more undefined check needed as we provide default values
  return context;
};
