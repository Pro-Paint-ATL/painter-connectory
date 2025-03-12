
import { useState } from "react";
import { User } from "@/types/auth";

/**
 * Core hook that provides shared state for auth actions
 * This hook centralizes loading state and user management for auth operations
 */
export const useAuthCore = (user: User | null, setUser: (user: User | null) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };
  
  return {
    user,
    setUser,
    isLoading,
    error,
    startLoading,
    stopLoading,
    handleError,
    setIsLoading, // Keep for backward compatibility
    setError
  };
};
