
import { supabase } from "@/lib/supabase";
import { PainterCompanyInfo, Subscription } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

/**
 * Creates a subscription record for a painter in their 21-day trial period
 */
export const createTrialSubscription = async (userId: string, isFeatured: boolean = false): Promise<boolean> => {
  try {
    console.log("Creating trial subscription for user:", userId);
    
    // First check if user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
      return false;
    }
    
    if (!userExists) {
      console.error('User does not exist, cannot create subscription');
      return false;
    }
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 21 days trial

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

    // Update profile with new subscription data
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: subscription as unknown as Json,
        role: 'painter' // Ensure role is set to painter
      })
      .eq('id', userId);

    if (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }

    console.log("Trial subscription created successfully");
    return true;
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
    console.log("Setting up company profile for painter:", userId);
    
    // First check if user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
      return false;
    }
    
    if (!userExists) {
      console.error('User does not exist, cannot setup company');
      return false;
    }
    
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
      return false;
    }

    // If featured flag is provided, update subscription accordingly
    if (isFeatured) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('subscription')
        .eq('id', userId)
        .maybeSingle();

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
    
    console.log("Company profile setup successfully");
    return true;
  } catch (error) {
    console.error('Exception setting up company:', error);
    return false;
  }
};
