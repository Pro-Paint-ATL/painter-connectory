
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { User, UserRole, UserLocation, Subscription } from "@/types/auth";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com'];

export const formatUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
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
