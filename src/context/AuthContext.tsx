
import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "customer" | "painter" | null;

interface Subscription {
  status: "active" | "canceled" | "past_due" | null;
  plan: "pro" | null;
  startDate: string | null;
  amount: number | null;
  currency: string | null;
  interval: "month" | "year" | null;
  paymentMethodId?: string;
  lastFour?: string;
  brand?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  subscription?: Subscription;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would check for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Mock login function - would connect to a real auth system in production
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0],
        email,
        role: email.includes("painter") ? "painter" : "customer",
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Create new user
      const newUser: User = {
        id: "user-" + Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
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
