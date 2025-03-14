
import { supabase } from "@/lib/supabase";
import { PainterCompanyInfo, Subscription } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

/**
 * Creates a subscription record for a painter in their 21-day trial period
 */
export const createTrialSubscription = async (userId: string, isFeatured: boolean = false): Promise<boolean> => {
  try {
    console.log("Creating trial subscription for user:", userId);
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 21 days trial

    // Create the subscription object
    const subscription: Subscription = {
      status: 'trial',
      plan: 'pro',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount: 49,
      currency: 'usd',
      interval: 'month',
      trialEnds: endDate.toISOString(),
      featured: isFeatured || false
    };

    // Check if profile exists first
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      if (profileError.message.includes('infinite recursion')) {
        console.log('Recursion error detected, trying alternative approach');
      }
    }

    // If profile doesn't exist or we got recursion error, try to create it first
    if (!existingProfile || profileError?.message.includes('infinite recursion')) {
      console.log('Profile not found or recursion error, creating profile with subscription');
      
      try {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            subscription: subscription as unknown as Json
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (upsertError) {
          console.error('Upsert approach failed:', upsertError);
          
          // Try one more alternative approach if this also failed
          // Use Supabase functions.invoke if available to bypass RLS
          try {
            const { data, error: fnError } = await supabase.functions.invoke('update-profile', {
              body: { 
                userId: userId, 
                data: { subscription: subscription }
              }
            });
            
            if (fnError) {
              console.error('Edge function approach also failed:', fnError);
              return false;
            }
            
            console.log('Edge function approach succeeded:', data);
            return true;
          } catch (fnError) {
            console.error('Exception in edge function approach:', fnError);
            return false;
          }
        }
        
        console.log('Profile upsert with subscription succeeded');
        return true;
      } catch (upsertError) {
        console.error('Exception in profile upsert:', upsertError);
        return false;
      }
    } else {
      // Profile exists, update it with the subscription
      console.log('Updating existing profile with subscription');
      
      // Standard approach - update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription: subscription as unknown as Json,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile with subscription:', error);
        
        // If standard update fails, try upsert as alternative
        if (error.message && error.message.includes('infinite recursion')) {
          console.log('Recursion error in update, trying upsert approach');
          
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              subscription: subscription as unknown as Json
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });
          
          if (upsertError) {
            console.error('Upsert approach also failed:', upsertError);
            return false;
          }
          
          console.log('Upsert approach succeeded');
          return true;
        }
        
        return false;
      }

      console.log('Trial subscription created successfully');
      return true;
    }
  } catch (error) {
    console.error('Exception creating trial subscription:', error);
    return false;
  }
};

/**
 * Sets up a painter's company profile
 */
export const setupPainterCompany = async (
  userId: string,
  companyInfo: PainterCompanyInfo,
  isFeatured: boolean = false
): Promise<boolean> => {
  try {
    // First update the company info
    const { error } = await supabase
      .from('profiles')
      .update({
        company_info: companyInfo as unknown as Json,
        role: 'painter'
      })
      .eq('id', userId);

    if (error) {
      console.error('Error setting up company:', error);
      
      // If update fails due to recursion, try upsert
      if (error.message && error.message.includes('infinite recursion')) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            company_info: companyInfo as unknown as Json,
            role: 'painter'
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
          
        if (upsertError) {
          console.error('Upsert approach also failed:', upsertError);
          return false;
        }
        
        console.log('Upsert approach succeeded for company setup');
      } else {
        return false;
      }
    }

    // If featured flag is provided, update subscription accordingly
    if (isFeatured) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('subscription')
        .eq('id', userId)
        .single();

      if (existingProfile?.subscription) {
        const subscription = existingProfile.subscription as any;
        subscription.featured = true;

        await supabase
          .from('profiles')
          .update({
            subscription: subscription as unknown as Json,
          })
          .eq('id', userId);
      }
    }

    return true;
  } catch (error) {
    console.error('Exception setting up company:', error);
    return false;
  }
};
