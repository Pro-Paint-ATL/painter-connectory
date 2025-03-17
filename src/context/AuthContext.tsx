
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
  
  // Ensure we only create one instance of the auth provider
  const auth = useAuthProvider();
  
  useEffect(() => {
    // Mark the provider as mounted
    setIsMounted(true);
    console.log("AuthProvider mounted");
    return () => {
      console.log("AuthProvider unmounted");
      setIsMounted(false);
    }
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

  // Log auth state changes
  useEffect(() => {
    console.log("AuthContext state update:", {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      isInitialized: auth.isInitialized,
      userExists: !!auth.user
    });
  }, [auth.isAuthenticated, auth.isLoading, auth.isInitialized, auth.user]);

  // Always provide the context values, even if we're still initializing
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Export hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
