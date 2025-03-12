
import Stripe from 'stripe';

// In production, these values should come from environment variables
// For deployed applications, consider using Netlify/Vercel environment variables
const PRODUCTION_MODE = true;

// This is a test key, in production it would be stored securely and not in client-side code
const STRIPE_SECRET_KEY = PRODUCTION_MODE 
  ? 'sk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus'
  : 'sk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus';

// Initialize Stripe with the secret key
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16'
});

// Monthly subscription price ID from your Stripe dashboard
// In production, this would be your actual price ID
export const MONTHLY_SUBSCRIPTION_PRICE_ID = PRODUCTION_MODE
  ? 'price_1OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus'
  : 'price_1OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus';

// Create a subscription for a customer
export const createSubscription = async (customerId: string, paymentMethodId: string) => {
  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: MONTHLY_SUBSCRIPTION_PRICE_ID }],
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
    const customer = await stripe.customers.create({
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
    const account = await stripe.accounts.create({
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
    const accountLink = await stripe.accountLinks.create({
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
    // Platform fee (10% of the amount)
    const platformFee = Math.round(amount * 0.1);
    const transferAmount = amount - platformFee;

    // Create a transfer to the painter's connected account
    const transfer = await stripe.transfers.create({
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
    const refund = await stripe.refunds.create({
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
export const handleWebhookEvent = async (body: string, signature: string, webhookSecret: string) => {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
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
