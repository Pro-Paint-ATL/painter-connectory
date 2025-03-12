
import { supabase } from "@/lib/supabase";
import { PainterCompanyInfo, Subscription } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

/**
 * Creates a subscription record for a painter in their 21-day trial period
 */
export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 21 days trial

    // Get existing profile to preserve other data
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('subscription')
      .eq('id', userId)
      .single();

    const subscription: Subscription = {
      status: 'trial',
      plan: 'pro',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount: 49,
      currency: 'usd',
      interval: 'month',
      trialEnds: endDate.toISOString()
    };

    // Update profile with new subscription data while preserving existing data
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: subscription as unknown as Json,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }

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
  companyInfo: PainterCompanyInfo
): Promise<boolean> => {
  try {
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

    return true;
  } catch (error) {
    console.error('Exception setting up company:', error);
    return false;
  }
};
