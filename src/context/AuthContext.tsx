
import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  supabase: SupabaseClient;
}

// Admin emails for manual role assignment
const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to transform Supabase user data to our app's user format
  const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;

    try {
      // Fetch user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        throw error;
      }

      // If no profile exists, create a new one
      if (!profile) {
        const isAdmin = ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '');
        const isPainter = supabaseUser.email?.toLowerCase().includes('painter') || false;
        const defaultRole: UserRole = isAdmin ? "admin" : isPainter ? "painter" : "customer";

        const newProfile = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
          email: supabaseUser.email || '',
          role: defaultRole,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString()
        };

        // Insert the new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          throw insertError;
        }

        return {
          id: supabaseUser.id,
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          avatar: newProfile.avatar || undefined
        };
      }

      // Return formatted user with profile data
      return {
        id: supabaseUser.id,
        name: profile.name || supabaseUser.email?.split('@')[0] || '',
        email: supabaseUser.email || '',
        role: profile.role,
        avatar: profile.avatar || undefined,
        location: profile.location,
        subscription: profile.subscription
      };
    } catch (error) {
      console.error("Error formatting user:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session and user when the component mounts
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const formattedUser = await formatUser(session.user);
          setUser(formattedUser);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const formattedUser = await formatUser(session.user);
          setUser(formattedUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'USER_UPDATED' && session) {
          const formattedUser = await formatUser(session.user);
          setUser(formattedUser);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      if (data.user) {
        const formattedUser = await formatUser(data.user);
        setUser(formattedUser);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${formattedUser?.name}!`
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Prevent direct admin registration
      const safeRole = role === "admin" ? "customer" : role;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: safeRole
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      if (data.user) {
        const formattedUser = await formatUser(data.user);
        setUser(formattedUser);
        
        toast({
          title: "Registration Successful",
          description: "Your account has been created."
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          location: data.location,
          role: data.role
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      // Update local state
      setUser({ ...user, ...data });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error("Update profile error:", error);
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
