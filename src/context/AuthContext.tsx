
import React, { createContext, useContext, useState } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { Loader2 } from "lucide-react";

// Create the context with a more explicit undefined check
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  
  // Only show the loader when we're still loading and not yet initialized
  if (!auth.isInitialized && auth.isLoading) {
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
