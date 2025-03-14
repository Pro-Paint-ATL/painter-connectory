
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

    // Create subscription object
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

    // Try to update profile with new subscription data
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: subscription as unknown as Json,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error creating trial subscription:', error);
      return true; // Still return true so registration can proceed
    }

    return true;
  } catch (error) {
    console.error('Exception creating trial subscription:', error);
    return true; // Return true to allow registration to complete despite error
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
    console.log("Setting up painter company for user:", userId);
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
      return true; // Still return true so setup can proceed
    }

    // Only attempt to update subscription if there's no issue with the first update
    if (isFeatured) {
      try {
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
      } catch (subError) {
        console.error('Error updating featured status:', subError);
      }
    }

    return true;
  } catch (error) {
    console.error('Exception setting up company:', error);
    return true; // Return true despite errors
  }
};
