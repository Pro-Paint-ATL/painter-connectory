
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { Loader2 } from "lucide-react";

// Create the context with a default empty value that matches the shape
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  updateUserProfile: async () => null,
  supabase: null as any
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Track if the provider has been mounted
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuthProvider();
  
  useEffect(() => {
    // Mark the provider as mounted
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Only show the loading screen during initial authentication
  // and only after the provider has mounted to prevent flash
  if (isMounted && !auth.isInitialized && auth.isLoading) {
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
  return useContext(AuthContext);
};
