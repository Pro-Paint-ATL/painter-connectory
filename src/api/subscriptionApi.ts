
import { stripe } from '@/utils/stripe-server';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Json } from '@/integrations/supabase/types';
import { Subscription } from '@/types/auth';

// Function to create a subscription using real Stripe flow
export const createSubscriptionForUser = async (
  paymentMethodId: string,
  userData: {
    name: string;
    email: string;
    userId: string;
  }
) => {
  try {
    // Create or retrieve Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription')
      .eq('id', userData.userId)
      .single();
    
    // Safely access stripeCustomerId with proper type casting
    let stripeCustomerId: string | undefined;
    if (profile?.subscription) {
      const subscription = profile.subscription as any; // Use any temporarily for access
      stripeCustomerId = subscription.stripeCustomerId;
    }
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      stripeCustomerId = customer.id;
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }], // Using the price ID from environment
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
    });
    
    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Safely extract client_secret with proper type checking
    let clientSecret: string | undefined = undefined;
    
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
      const invoice = subscription.latest_invoice;
      if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
        clientSecret = invoice.payment_intent.client_secret;
      }
    }
    
    if (!clientSecret) {
      throw new Error('Failed to get client secret from subscription');
    }
    
    // Update profile with subscription data
    await supabase
      .from('profiles')
      .update({
        subscription: {
          status: "active",
          plan: "pro",
          startDate: new Date().toISOString(),
          endDate: endDate.toISOString(),
          amount: 49,
          currency: 'USD',
          interval: 'month',
          paymentMethodId: paymentMethodId,
          stripeCustomerId: stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          lastFour: 'pending', // Will be updated after payment confirmation
          brand: 'pending',
        } as unknown as Json
      })
      .eq('id', userData.userId);
    
    return {
      subscriptionId: subscription.id,
      clientSecret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (stripeSubscriptionId: string) => {
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
    
    return {
      status: "canceled" as const,
      canceledAt: new Date(canceledSubscription.canceled_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Custom hook for subscription management
export const useSubscriptionApi = () => {
  const { user, updateUserProfile } = useAuth();
  
  const subscribe = async (paymentMethodId: string) => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }
    
    try {
      const { subscriptionId, clientSecret } = await createSubscriptionForUser(
        paymentMethodId,
        {
          name: user.name,
          email: user.email,
          userId: user.id,
        }
      );
      
      // Return the client secret for payment confirmation
      return { subscriptionId, clientSecret };
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  };
  
  const unsubscribe = async () => {
    if (!user?.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }
    
    try {
      const result = await cancelSubscription(user.subscription.stripeSubscriptionId);
      
      // Update the user's profile to reflect canceled subscription
      await updateUserProfile({
        subscription: {
          ...user.subscription,
          status: 'canceled',
        },
      });
      
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  };
  
  return {
    subscribe,
    unsubscribe,
    currentSubscription: user?.subscription,
  };
};
