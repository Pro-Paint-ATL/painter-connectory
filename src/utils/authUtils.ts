
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { User, UserRole } from "@/types/auth";

// Add your email to the admin list
const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com', 'your@email.com'];

/**
 * Formats a Supabase user into our application's User model
 */
export const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;

  try {
    // Default values
    const defaultRole: UserRole = ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '') 
      ? "admin" 
      : supabaseUser.user_metadata?.role as UserRole || "customer";
    
    // Basic user object without profile data to prevent recursion
    const user: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
      email: supabaseUser.email || '',
      role: defaultRole,
      avatar: supabaseUser.user_metadata?.avatar_url || undefined
    };
    
    return user;
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
