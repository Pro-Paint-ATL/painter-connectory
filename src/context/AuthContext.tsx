import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../lib/supabase";
import { Json } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

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

interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  bio?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: UserLocation;
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
  supabase: typeof supabase;
}

const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;

    try {
      console.log("Getting user profile for:", supabaseUser.id);
      console.log("User metadata:", supabaseUser.user_metadata);
      
      const userRole = supabaseUser.user_metadata?.role as UserRole;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating new profile");
          
          let defaultRole: UserRole;
          
          if (ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '')) {
            defaultRole = "admin";
          } else if (userRole) {
            defaultRole = userRole;
            console.log("Using role from metadata:", defaultRole);
          } else {
            const isPainter = supabaseUser.email?.toLowerCase().includes('painter') || false;
            defaultRole = isPainter ? "painter" : "customer";
          }

          const newProfile = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
            email: supabaseUser.email || '',
            role: defaultRole,
            avatar: supabaseUser.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString()
          };

          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile);

            if (insertError) {
              console.error("Error inserting profile:", insertError);
            } else {
              console.log("Profile created successfully with role:", defaultRole);
            }
          } catch (insertErr) {
            console.error("Exception inserting profile:", insertErr);
          }

          return {
            id: supabaseUser.id,
            name: newProfile.name,
            email: newProfile.email,
            role: defaultRole,
            avatar: newProfile.avatar || undefined
          };
        } else {
          throw error;
        }
      }

      console.log("Found existing profile with role:", profile.role);
      
      const locationData = profile.location as Json;
      const subscriptionData = profile.subscription as Json;
      
      const location: UserLocation | undefined = 
        locationData ? 
          typeof locationData === 'object' ? 
            {
              address: (locationData as any)?.address || '',
              latitude: (locationData as any)?.latitude || 0,
              longitude: (locationData as any)?.longitude || 0
            } : undefined
          : undefined;
          
      const subscription: Subscription | undefined = 
        subscriptionData ? 
          typeof subscriptionData === 'object' ? 
            {
              status: (subscriptionData as any)?.status || null,
              plan: (subscriptionData as any)?.plan || null,
              startDate: (subscriptionData as any)?.startDate || null,
              amount: (subscriptionData as any)?.amount || null,
              currency: (subscriptionData as any)?.currency || null,
              interval: (subscriptionData as any)?.interval || null,
              paymentMethodId: (subscriptionData as any)?.paymentMethodId,
              lastFour: (subscriptionData as any)?.lastFour,
              brand: (subscriptionData as any)?.brand,
              stripeCustomerId: (subscriptionData as any)?.stripeCustomerId,
              stripeSubscriptionId: (subscriptionData as any)?.stripeSubscriptionId
            } : undefined
          : undefined;

      return {
        id: supabaseUser.id,
        name: profile.name || supabaseUser.email?.split('@')[0] || '',
        email: supabaseUser.email || '',
        role: profile.role as UserRole,
        avatar: profile.avatar || undefined,
        location: location,
        subscription: subscription
      };
    } catch (error) {
      console.error("Error formatting user:", error);
      return supabaseUser ? {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || '',
        email: supabaseUser.email || '',
        role: ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '') ? "admin" : "customer",
      } : null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          const formattedUser = await formatUser(session.user);
          setUser(formattedUser);
          console.log("Session loaded, user role:", formattedUser?.role);
          
          if (formattedUser?.role === "painter") {
            navigate("/painter-dashboard");
          } else if (formattedUser?.role === "admin") {
            navigate("/admin");
          } else if (formattedUser) {
            navigate("/profile");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          if (event === 'SIGNED_IN' && session) {
            const formattedUser = await formatUser(session.user);
            setUser(formattedUser);
            console.log("User signed in with role:", formattedUser?.role);
            
            if (formattedUser?.role === "painter") {
              navigate("/painter-dashboard");
            } else if (formattedUser?.role === "admin") {
              navigate("/admin");
            } else if (formattedUser) {
              navigate("/profile");
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if (event === 'USER_UPDATED' && session) {
            const formattedUser = await formatUser(session.user);
            setUser(formattedUser);
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      setIsLoading(false);
    }
  }, [navigate]);

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
        
        console.log("Logged in user with role:", formattedUser?.role);
        
        if (formattedUser?.role === "painter") {
          navigate("/painter-dashboard");
        } else if (formattedUser?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
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
      const safeRole = role === "admin" ? "customer" : role;
      
      console.log("Registering with role:", safeRole);
      
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
        console.log("User metadata after signup:", data.user.user_metadata);
        
        const formattedUser = await formatUser(data.user);
        setUser(formattedUser);
        
        toast({
          title: "Registration Successful",
          description: `Your account has been created as a ${safeRole}.`
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
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          location: data.location as any,
          role: data.role,
          subscription: data.subscription as any
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
