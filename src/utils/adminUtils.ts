import { supabase } from "@/lib/supabase";
import { setupPainterCompany } from './companySetup';
import { PainterCompanyInfo } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

export const setFeaturedPainter = async (userId: string) => {
  // Get existing company info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_info')
    .eq('id', userId)
    .single();

  const companyInfo = profile?.company_info as PainterCompanyInfo;
  
  if (!companyInfo) {
    throw new Error('Company info not found');
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
