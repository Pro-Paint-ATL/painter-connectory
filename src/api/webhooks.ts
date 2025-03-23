
import { handleWebhookEvent } from '@/utils/stripe-server';
import { supabase } from '@/lib/supabase';
import { Subscription } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

// This is a placeholder for what would be a serverless function or API route
// in a real production environment (e.g., Netlify function, Vercel API route, Express endpoint)

// Sample webhook handler function
export const stripeWebhookHandler = async (request: Request) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    // This is your webhook secret from Stripe dashboard
    const webhookSecret = 'whsec_your_webhook_secret';
    
    // Updated to use only the required two arguments
    const result = await handleWebhookEvent(body, signature);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// Function to manually update subscription status from Stripe checkout
export const updateSubscriptionAfterCheckout = async (painterId: string) => {
  try {
    // Get the current profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', painterId)
      .single();
      
    if (profileError) throw profileError;
    
    // Set a 1-month subscription period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Extract existing stripe IDs from profile.subscription if available
    let existingStripeCustomerId: string | undefined;
    let existingStripeSubscriptionId: string | undefined;
    
    if (profile?.subscription) {
      // Safely access the subscription object, handling both Json object and string format
      const subscriptionData = typeof profile.subscription === 'string' 
        ? JSON.parse(profile.subscription) 
        : profile.subscription;
      
      existingStripeCustomerId = subscriptionData.stripeCustomerId;
      existingStripeSubscriptionId = subscriptionData.stripeSubscriptionId;
    }
    
    // Create subscription data with proper type casting
    const subscriptionData: Subscription = {
      status: "active",
      plan: "pro",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount: 49,
      currency: 'USD',
      interval: 'month',
      // Use existing stripe IDs if available
      stripeCustomerId: existingStripeCustomerId || 'manually_updated',
      stripeSubscriptionId: existingStripeSubscriptionId || 'manually_updated',
    };
    
    // Update the profile with new subscription data
    // Type cast the subscription data to Json before saving to Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription: subscriptionData as unknown as Json
      })
      .eq('id', painterId);
      
    if (updateError) throw updateError;
    
    return { success: true, subscription: subscriptionData };
  } catch (error) {
    console.error('Error updating subscription after checkout:', error);
    return { success: false, error };
  }
};
