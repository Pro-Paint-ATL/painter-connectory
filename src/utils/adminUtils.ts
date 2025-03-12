
import { supabase } from "@/lib/supabase";
import { setupPainterCompany, createTrialSubscription } from './companySetup';
import { PainterCompanyInfo } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

export const setFeaturedPainter = async (userId: string) => {
  // Get existing company info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_info')
    .eq('id', userId)
    .single();

  // Properly handle the type conversion with type checking
  if (!profile?.company_info || 
      typeof profile.company_info === 'string' || 
      Array.isArray(profile.company_info) ||
      typeof profile.company_info !== 'object') {
    throw new Error('Company info not found or invalid format');
  }

  // Validate that the required fields exist in the company_info
  const companyInfo = profile.company_info as unknown as PainterCompanyInfo;
  if (!companyInfo.companyName || typeof companyInfo.isInsured !== 'boolean') {
    throw new Error('Company info missing required fields');
  }

  // Update the company info with featured status
  await setupPainterCompany(userId, companyInfo, true);

  // Update subscription to set featured flag
  const { data: subscriptionData } = await supabase
    .from('profiles')
    .select('subscription')
    .eq('id', userId)
    .single();

  if (subscriptionData?.subscription) {
    const subscription = subscriptionData.subscription as any;
    subscription.featured = true;

    await supabase
      .from('profiles')
      .update({
        subscription: subscription as unknown as Json,
      })
      .eq('id', userId);
  }

  return true;
};

export const removeFeaturedPainter = async (userId: string) => {
  const { data: subscriptionData } = await supabase
    .from('profiles')
    .select('subscription')
    .eq('id', userId)
    .single();

  if (subscriptionData?.subscription) {
    const subscription = subscriptionData.subscription as any;
    subscription.featured = false;

    await supabase
      .from('profiles')
      .update({
        subscription: subscription as unknown as Json,
      })
      .eq('id', userId);
  }

  return true;
};

export const getFeaturedPainters = async () => {
  const { data: painters, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'painter')
    .not('subscription', 'is', null)
    .filter('subscription->featured', 'eq', true);

  if (error) {
    console.error('Error fetching featured painters:', error);
    return [];
  }

  return painters;
};
