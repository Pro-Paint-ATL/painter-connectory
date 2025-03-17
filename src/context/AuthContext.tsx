
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
  const [error, setError] = useState<Error | null>(null);
  
  // Ensure we only create one instance of the auth provider
  let auth;
  
  try {
    auth = useAuthProvider();
  } catch (err) {
    console.error("Error in useAuthProvider:", err);
    setError(err instanceof Error ? err : new Error("Failed to initialize auth provider"));
    
    // Return fallback auth value to prevent blank screen
    auth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      login: async () => null,
      register: async () => null,
      logout: async () => {},
      updateUserProfile: async () => null,
      supabase: null
    };
  }
  
  useEffect(() => {
    // Mark the provider as mounted
    setIsMounted(true);
    console.log("AuthProvider mounted");
    return () => {
      console.log("AuthProvider unmounted");
      setIsMounted(false);
    }
  }, []);
  
  // Display error if authentication failed to initialize
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-destructive mb-4">Failed to initialize authentication</div>
        <p className="text-sm text-muted-foreground">Please refresh the page and try again</p>
      </div>
    );
  }
  
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
