
import { useState } from "react";
import { User } from "@/types/auth";

/**
 * Core hook that provides shared state for auth actions
 */
export const useAuthCore = (user: User | null, setUser: (user: User | null) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    user,
    setUser,
    isLoading,
    setIsLoading
  };
};
