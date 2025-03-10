
import { createCustomer, createSubscription } from '@/utils/stripe-server';
import { useAuth } from '@/context/AuthContext';

// In a real production environment, these would be API endpoints on your server
// For now, we're creating a mock API interface that simulates what your server would do

// Function to create a subscription (this would be a server endpoint in production)
export const createSubscriptionForUser = async (
  paymentMethodId: string,
  userData: {
    name: string;
    email: string;
    userId: string;
  }
) => {
  try {
    // 1. Create a customer in Stripe
    const customer = await createCustomer(userData.email, userData.name);
    
    // 2. Create a subscription for that customer
    const subscription = await createSubscription(customer.id, paymentMethodId);
    
    // 3. Return the subscription details
    // In a real app, you would store the subscription details in your database
    return {
      status: "active" as const, // Type assertion to match the expected union type
      plan: 'pro',
      startDate: new Date().toISOString(),
      amount: 49,
      currency: 'USD',
      interval: 'month',
      paymentMethodId: paymentMethodId,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      // These would typically come from the payment method details
      lastFour: 'demo', // In production, get this from the payment method
      brand: 'visa',   // In production, get this from the payment method
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Function to cancel a subscription (this would be a server endpoint in production)
export const cancelSubscription = async (stripeSubscriptionId: string) => {
  try {
    // In a real app, this would call the Stripe API to cancel the subscription
    // For now, we're just returning a mock response
    return {
      status: "canceled" as const, // Type assertion to match the expected union type
      canceledAt: new Date().toISOString(),
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
      const subscriptionData = await createSubscriptionForUser(
        paymentMethodId,
        {
          name: user.name,
          email: user.email,
          userId: user.id,
        }
      );
      
      // Update the user's profile with the subscription data
      updateUserProfile({
        subscription: subscriptionData,
      });
      
      return subscriptionData;
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
      updateUserProfile({
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
