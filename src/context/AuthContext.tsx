import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = "customer" | "painter" | "admin" | null;

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

const PRODUCTION_MODE = true;
const ADMIN_EMAILS = ['admin@painterconnectory.com', 'youremail@yourdomain.com', 'propaintatl@gmail.com'];

export const SAMPLE_PAINTERS = [
  {
    id: "painter-1",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "painter" as const,
    avatar: "/public/placeholder.svg",
    location: {
      address: "123 Main St, Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589
    },
    subscription: {
      status: "active" as const,
      plan: "pro" as const,
      startDate: "2023-08-15T10:30:00Z",
      amount: 49,
      currency: "USD",
      interval: "month" as const
    }
  },
  {
    id: "painter-2",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "painter" as const,
    avatar: "/public/placeholder.svg",
    location: {
      address: "456 Oak Ave, Cambridge, MA",
      latitude: 42.3736,
      longitude: -71.1097
    }
  },
  {
    id: "painter-3",
    name: "David Thompson",
    email: "david@example.com",
    role: "painter" as const,
    avatar: "/public/placeholder.svg",
    location: {
      address: "789 Pine St, Somerville, MA",
      latitude: 42.3876,
      longitude: -71.0995
    },
    subscription: {
      status: "active" as const,
      plan: "pro" as const,
      startDate: "2023-09-01T09:45:00Z",
      amount: 49,
      currency: "USD",
      interval: "month" as const
    }
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (PRODUCTION_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        const isPainter = email.toLowerCase().includes("painter");
        
        const mockUser: User = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          name: email.split("@")[0],
          email,
          role: isAdmin ? "admin" : isPainter ? "painter" : "customer",
          avatar: "/public/placeholder.svg"
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          name: email.split("@")[0],
          email,
          role: email.includes("admin") ? "admin" : email.includes("painter") ? "painter" : "customer",
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      if (PRODUCTION_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const safeRole = role === "admin" ? "customer" : role;
        
        const newUser: User = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          name,
          email,
          role: safeRole,
          avatar: "/public/placeholder.svg"
        };
        
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const newUser: User = {
          id: "user-" + Math.random().toString(36).substring(2, 9),
          name,
          email,
          role,
        };
        
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }
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
