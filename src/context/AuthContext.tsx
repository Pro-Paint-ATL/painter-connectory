
import React, { createContext, useContext } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  // Show a loading indicator while authentication is being determined
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

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
