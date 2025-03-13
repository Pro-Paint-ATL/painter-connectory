
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

    // Try to get the role from security definer function first to avoid recursion
    try {
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_current_user_role', {});
      
      if (!roleError && roleData) {
        defaultUser.role = roleData as UserRole;
        console.log("Got role from function:", defaultUser.role);
      }
    } catch (roleError) {
      console.error("Error getting role from function:", roleError);
    }

    // Try to fetch profile from database
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // Handle profile not found
      if (error) {
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating new profile");
          
          // Determine role for new profile
          let newRole = supabaseUser.user_metadata?.role as UserRole;
          
          if (!newRole) {
            if (ADMIN_EMAILS.includes(supabaseUser.email?.toLowerCase() || '')) {
              newRole = "admin";
            } else {
              const isPainter = supabaseUser.email?.toLowerCase().includes('painter') || false;
              newRole = isPainter ? "painter" : "customer";
            }
          }
          
          // Create new profile
          const newProfile = {
            id: supabaseUser.id,
            name: defaultUser.name,
            email: defaultUser.email,
            role: newRole,
            avatar: defaultUser.avatar || null,
            created_at: new Date().toISOString(),
            company_info: newRole === "painter" ? {} : null
          };

          try {
            await supabase.from('profiles').insert(newProfile);
            console.log("Profile created successfully with role:", newRole);
          } catch (insertErr) {
            console.error("Error creating profile:", insertErr);
          }
          
          defaultUser.role = newRole;
          return defaultUser;
        }
        
        console.error("Error fetching profile:", error);
        return defaultUser;
      }

      // Profile found, parse data
      console.log("Found existing profile with role:", profile.role);
      
      const location = parseJsonData<UserLocation>(
        profile.location as Json, 
        { address: '', latitude: 0, longitude: 0 }
      );
      
      const subscription = parseJsonData<Subscription>(
        profile.subscription as Json, 
        { 
          status: null, 
          plan: null, 
          startDate: null,
          endDate: null,
          amount: null, 
          currency: null, 
          interval: null 
        }
      );
      
      // Parse painter company info if user is a painter
      const companyInfo = profile.role === 'painter' 
        ? parseJsonData<PainterCompanyInfo>(
            profile.company_info as Json,
            {
              companyName: '',
              isInsured: false,
              specialties: []
            }
          )
        : undefined;

      // Return complete user object
      return {
        id: supabaseUser.id,
        name: profile.name || defaultUser.name,
        email: supabaseUser.email || '',
        role: profile.role as UserRole || defaultRole,
        avatar: profile.avatar || undefined,
        location,
        subscription,
        companyInfo
      };
    } catch (profileError) {
      console.error("Error in profile fetch:", profileError);
      return defaultUser;
    }
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
