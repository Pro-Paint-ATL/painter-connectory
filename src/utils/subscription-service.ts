
import { supabase } from "@/lib/supabase";
import { Json } from "@/integrations/supabase/types";
import { Subscription } from "@/types/auth";

/**
 * Service to interact with Stripe subscriptions via Supabase Edge Functions
 */
export const SubscriptionService = {
  /**
   * Creates a customer in Stripe
   */
  async createCustomer(email: string, name: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { 
          email, 
          name,
          action: 'create-customer'
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error('Failed to create customer');
      
      return data.customerId;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  },
  
  /**
   * Creates a subscription for a customer with a trial period
   */
  async createSubscription(customerId: string, paymentMethodId: string, trialDays = 21): Promise<{
    subscriptionId: string;
    clientSecret: string | null;
    status: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { 
          customerId, 
          paymentMethodId,
          trialDays,
          action: 'create-subscription'
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error('Failed to create subscription');
      
      return {
        subscriptionId: data.subscriptionId,
        clientSecret: data.clientSecret,
        status: data.status
      };
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  },
  
  /**
   * Cancels a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{
    status: string;
    canceledAt: number | null;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { 
          subscriptionId,
          action: 'cancel-subscription'
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error('Failed to cancel subscription');
      
      return {
        status: data.status,
        canceledAt: data.canceledAt
      };
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw error;
    }
  },
  
  /**
   * Reactivates a canceled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<{
    newSubscriptionId: string;
    status: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { 
          subscriptionId,
          action: 'reactivate-subscription'
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to reactivate subscription');
      
      return {
        newSubscriptionId: data.newSubscriptionId,
        status: data.status
      };
    } catch (error) {
      console.error('Error reactivating Stripe subscription:', error);
      throw error;
    }
  },
  
  /**
   * Updates the user profile with subscription information
   */
  async updateUserSubscription(userId: string, subscriptionData: Partial<Subscription>): Promise<void> {
    try {
      // First get the current subscription data
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('subscription')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Merge the existing subscription with the new data
      const existingSubscription = profile?.subscription ? 
        (profile.subscription as unknown as Subscription) : 
        {};
      
      const updatedSubscription = {
        ...existingSubscription,
        ...subscriptionData
      };
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription: updatedSubscription as unknown as Json
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  },
  
  /**
   * Admin function to activate a subscription manually
   */
  async adminActivateSubscription(painterId: string): Promise<void> {
    try {
      // Get the current profile data
      const { data: painter, error: fetchError } = await supabase
        .from('profiles')
        .select('subscription')
        .eq('id', painterId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Set subscription as active
      const existingSubscription = painter?.subscription ? 
        (painter.subscription as unknown as Subscription) : 
        {};
      
      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      const updatedSubscription = {
        ...existingSubscription,
        status: "active",
        plan: "pro",
        startDate,
        endDate: endDate.toISOString(),
        amount: 49,
        currency: 'USD',
        interval: 'month'
      };
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription: updatedSubscription as unknown as Json
        })
        .eq('id', painterId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error activating subscription by admin:', error);
      throw error;
    }
  },
  
  /**
   * Admin function to cancel a subscription manually
   */
  async adminCancelSubscription(painterId: string): Promise<void> {
    try {
      // Get the current profile data
      const { data: painter, error: fetchError } = await supabase
        .from('profiles')
        .select('subscription')
        .eq('id', painterId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Set subscription as canceled
      const existingSubscription = painter?.subscription ? 
        (painter.subscription as unknown as Subscription) : 
        {};
      
      const updatedSubscription = {
        ...existingSubscription,
        status: "canceled",
      };
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription: updatedSubscription as unknown as Json
        })
        .eq('id', painterId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error canceling subscription by admin:', error);
      throw error;
    }
  }
};
