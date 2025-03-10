
import Stripe from 'stripe';

// This should be your Stripe secret key, which should never be exposed in client-side code
// In production, this would be stored in an environment variable on your server
const STRIPE_SECRET_KEY = 'sk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus';

// Initialize Stripe with the secret key
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' // Specify the Stripe API version
});

// Monthly subscription price ID from your Stripe dashboard
export const MONTHLY_SUBSCRIPTION_PRICE_ID = 'price_1OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus';

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
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};
