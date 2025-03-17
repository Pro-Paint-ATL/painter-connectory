
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { User, UserRole } from "@/types/auth";

// Add your email to the admin list
const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com', 'your@email.com'];

/**
 * Formats a Supabase user into our application's User model
 * Simplified to avoid infinite recursion with profiles table
 */
export const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;

  // Get email from user data
  const email = supabaseUser.email || '';
  
  // Determine role - admin emails get admin role, otherwise use metadata role or default to customer
  const role: UserRole = ADMIN_EMAILS.includes(email.toLowerCase()) 
    ? "admin" 
    : (supabaseUser.user_metadata?.role as UserRole || "customer");
  
  // Create basic user object without querying profiles table
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || email.split('@')[0] || '',
    email: email,
    role: role,
    avatar: supabaseUser.user_metadata?.avatar_url || undefined
  };
};
