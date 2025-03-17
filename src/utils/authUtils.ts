
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { User, UserRole, UserLocation, Subscription, PainterCompanyInfo } from "@/types/auth";
import { supabase } from "@/lib/supabase";

// Add your email to the admin list
const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com', 'your@email.com'];

/**
 * Parses JSON data into a specific type with safe fallbacks
 * @param data The JSON data to parse
 * @param defaultValue Default value if data is not valid
 */
const parseJsonData = <T>(data: Json | null, defaultValue: T): T => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return defaultValue;
  return data as unknown as T;
};

/**
 * Formats a Supabase user into our application's User model
 */
export const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;

  try {
    console.log("Getting user profile for:", supabaseUser.id);
    
    // Default values
    const defaultRole: UserRole = ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '') 
      ? "admin" 
      : supabaseUser.user_metadata?.role as UserRole || "customer";
    
    const defaultUser: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
      email: supabaseUser.email || '',
      role: defaultRole,
      avatar: supabaseUser.user_metadata?.avatar_url || undefined
    };

    // For auth state initialization, just return the default user
    // This prevents infinite recursion and blank screens on initial load
    return defaultUser;

    // The rest of profile fetching is removed to prevent recursion issues
    // We'll handle profile data loading separately after authentication is stable
  } catch (error) {
    console.error("Error formatting user:", error);
    
    // Fallback to basic user information
    return supabaseUser ? {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || '',
      email: supabaseUser.email || '',
      role: ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '') ? "admin" : "customer",
    } : null;
  }
};
