import Stripe from 'stripe';

// Instead of direct process.env access, use a function that safely handles environment access
const getEnv = (key: string, defaultValue: string = ''): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In client-side code, environment variables need to be exposed via import.meta.env in Vite
    // Only VITE_ prefixed variables are exposed to the client
    return (import.meta.env[key] as string) || defaultValue;
  }
  
  // In server environment (like Edge Functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

// Initialize Stripe with the secret key from environment
const getStripe = () => {
  const key = getEnv('STRIPE_SECRET_KEY', '');
  return new Stripe(key, {
    apiVersion: '2023-08-16'
  });
};

// Export a singleton Stripe instance for direct use
export const stripe = getStripe();

// This is a factory function to create a Stripe instance
export const getStripeInstance = () => {
  return getStripe();
};

// Helper function to get the monthly subscription price ID
export const getSubscriptionPriceId = () => {
  return getEnv('STRIPE_PRICE_ID', '');
};

// Create a subscription for a customer
export const createSubscription = async (customerId: string, paymentMethodId: string) => {
  try {
    const stripeInstance = getStripe();
    const priceId = getSubscriptionPriceId();
    
    // Attach the payment method to the customer
    await stripeInstance.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as the default for the customer
    await stripeInstance.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripeInstance.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Create a customer in Stripe
export const createCustomer = async (email: string, name: string) => {
  try {
    const stripeInstance = getStripe();
    const customer = await stripeInstance.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Create a Stripe Connect account for painters
export const createConnectAccount = async (email: string, name: string) => {
  try {
    const stripeInstance = getStripe();
    const account = await stripeInstance.accounts.create({
      type: 'express',
      email,
      business_type: 'individual',
      business_profile: {
        name,
        url: 'https://yourpainterplatform.com', // Replace with your actual platform URL
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
};

// Create an account link for a painter to complete onboarding
export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  try {
    const stripeInstance = getStripe();
    const accountLink = await stripeInstance.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
};

// Transfer funds to a painter's connected account
export const transferFundsToPainter = async (amount: number, painterId: string, description: string) => {
  try {
    const stripeInstance = getStripe();
    
    // Platform fee (10% of the amount)
    const platformFee = Math.round(amount * 0.1);
    const transferAmount = amount - platformFee;

    // Create a transfer to the painter's connected account
    const transfer = await stripeInstance.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination: painterId, // Painter's Stripe Connect account ID
      description,
    });

    return transfer;
  } catch (error) {
    console.error('Error transferring funds to painter:', error);
    throw error;
  }
};

// Process refund of good faith deposit
export const refundGoodFaithDeposit = async (paymentIntentId: string) => {
  try {
    const stripeInstance = getStripe();
    const refund = await stripeInstance.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
    });
    return refund;
  } catch (error) {
    console.error('Error refunding deposit:', error);
    throw error;
  }
};

// Handle webhook events from Stripe
export const handleWebhookEvent = async (body: string, signature: string, webhookSecret?: string) => {
  try {
    const stripeInstance = getStripe();
    const secret = webhookSecret || getEnv('STRIPE_WEBHOOK_SECRET', '');
    
    const event = stripeInstance.webhooks.constructEvent(body, signature, secret);
    
    switch (event.type) {
      case 'customer.subscription.created':
        // Handle subscription created
        console.log('Subscription created:', event.data.object);
        break;
      case 'customer.subscription.updated':
        // Handle subscription updated
        console.log('Subscription updated:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancelled/deleted
        console.log('Subscription deleted:', event.data.object);
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', event.data.object);
        break;
      case 'payment_intent.succeeded':
        // Handle successful payment intent (for one-time payments)
        handleSuccessfulPaymentIntent(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment intent
        console.log('Payment intent failed:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

// Handle successful payment intent (for booking deposits and final payments)
const handleSuccessfulPaymentIntent = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    // Extract metadata
    const { bookingId, customerId, painterId, paymentType } = paymentIntent.metadata || {};
    
    if (!bookingId || !customerId || !painterId) {
      console.log('Missing required metadata in payment intent:', paymentIntent.id);
      return;
    }
    
    // If this is a final payment, transfer funds to the painter
    if (paymentType === 'final_payment') {
      await transferFundsToPainter(
        paymentIntent.amount,
        painterId,
        `Payment for booking #${bookingId}`
      );
      
      console.log(`Transferred ${paymentIntent.amount} to painter ${painterId} for booking ${bookingId}`);
    }
    
    // You would update the booking status in your database here
    console.log(`Payment ${paymentIntent.id} for booking ${bookingId} succeeded`);
  } catch (error) {
    console.error('Error processing successful payment intent:', error);
  }
};
