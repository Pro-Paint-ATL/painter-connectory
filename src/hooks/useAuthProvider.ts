
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types/auth";
import { formatUser } from "@/utils/authUtils";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUserSession = async (session: any) => {
    if (session) {
      const formattedUser = await formatUser(session.user);
      setUser(formattedUser);
      console.log("User session loaded with role:", formattedUser?.role);
      
      if (formattedUser?.role === "painter") {
        navigate("/painter-dashboard");
      } else if (formattedUser?.role === "admin") {
        navigate("/admin");
      } else if (formattedUser) {
        navigate("/profile");
      }
    } else {
      setUser(null);
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
          await handleUserSession(session);
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
            await handleUserSession(session);
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

        if (formattedUser?.role === "painter") {
          navigate("/painter-dashboard");
        } else if (formattedUser?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
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
      
      navigate('/');
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

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    supabase
  };
};
