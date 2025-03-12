
import { supabase } from "@/lib/supabase";
import { PainterCompanyInfo } from "@/types/auth";

/**
 * Sets up a painter's company profile with featured status
 */
export const setupFeaturedPainterCompany = async (
  userId: string,
  companyInfo: PainterCompanyInfo
): Promise<boolean> => {
  try {
    // Update the user's profile with company information
    const { error } = await supabase
      .from('profiles')
      .update({
        company_info: companyInfo,
        // Add featured flag to subscription JSON
        subscription: {
          status: 'active',
          plan: 'pro',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
          amount: 49,
          currency: 'usd',
          interval: 'month',
          featured: true,
          stripeCustomerId: 'featured_company' // Placeholder for a real Stripe ID
        }
      })
      .eq('id', userId);

    if (error) {
      console.error('Error setting up featured company:', error);
      return false;
    }

    console.log('Featured company set up successfully for user ID:', userId);
    return true;
  } catch (error) {
    console.error('Exception setting up featured company:', error);
    return false;
  }
};

/**
 * Creates a subscription record for a painter in their 21-day trial period
 */
export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 21 days trial

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: {
          status: 'trial',
          plan: 'pro',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          amount: 49,
          currency: 'usd',
          interval: 'month',
          trialEnds: endDate.toISOString()
        }
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
