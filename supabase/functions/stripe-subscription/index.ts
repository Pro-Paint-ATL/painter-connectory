
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

// Get environment variables
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const MONTHLY_SUBSCRIPTION_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') || '';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body if it's not a webhook event
    if (req.headers.get('stripe-signature')) {
      // This is a webhook event, handle it differently
      const signature = req.headers.get('stripe-signature');
      const body = await req.text();
      
      try {
        const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        console.log(`Processing webhook event: ${event.type}`);
        
        // Handle the event based on its type
        switch (event.type) {
          case 'customer.subscription.created':
            console.log('Subscription created:', event.data.object);
            // Here we could update the user's subscription in our database
            break;
            
          case 'customer.subscription.updated':
            console.log('Subscription updated:', event.data.object);
            // Update subscription status in database
            break;
            
          case 'customer.subscription.deleted':
            console.log('Subscription deleted:', event.data.object);
            // Mark subscription as canceled in database
            break;
            
          case 'invoice.payment_succeeded':
            console.log('Payment succeeded:', event.data.object);
            // Record successful payment
            break;
            
          case 'invoice.payment_failed':
            console.log('Payment failed:', event.data.object);
            // Handle failed payment - could notify user
            break;
            
          case 'payment_intent.succeeded':
            console.log('Payment intent succeeded:', event.data.object);
            break;
            
          case 'payment_intent.payment_failed':
            console.log('Payment intent failed:', event.data.object);
            break;
            
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
        
        return new Response(
          JSON.stringify({ received: true }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Parse request for non-webhook requests
    const body = await req.json();
    const { action } = body;
    
    console.log(`Processing Stripe action: ${action}`);

    // Create a customer in Stripe
    if (action === 'create-customer') {
      const { email, name } = body;
      
      console.log(`Creating customer for ${email}`);
      const customer = await stripe.customers.create({
        email,
        name,
      });
      
      return new Response(
        JSON.stringify({ success: true, customerId: customer.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a subscription
    else if (action === 'create-subscription') {
      const { customerId, paymentMethodId, trialDays = 21 } = body;
      
      console.log(`Creating subscription for customer ${customerId}`);
      
      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      // Create the subscription with a trial period
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: MONTHLY_SUBSCRIPTION_PRICE_ID }],
        trial_period_days: trialDays,
        expand: ['latest_invoice.payment_intent'],
      });
      
      console.log(`Subscription created: ${subscription.id}, status: ${subscription.status}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
          status: subscription.status,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Cancel a subscription
    else if (action === 'cancel-subscription') {
      const { subscriptionId } = body;
      
      console.log(`Canceling subscription ${subscriptionId}`);
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      
      return new Response(
        JSON.stringify({
          success: true,
          status: subscription.status,
          canceledAt: subscription.canceled_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Reactivate a canceled subscription
    else if (action === 'reactivate-subscription') {
      const { subscriptionId } = body;
      
      console.log(`Attempting to reactivate subscription ${subscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === 'canceled') {
        // Create a new subscription for the same customer
        const newSubscription = await stripe.subscriptions.create({
          customer: subscription.customer as string,
          items: subscription.items.data.map(item => ({
            price: item.price.id,
          })),
          expand: ['latest_invoice.payment_intent'],
        });
        
        console.log(`Created new subscription ${newSubscription.id} for customer ${subscription.customer}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            newSubscriptionId: newSubscription.id,
            status: newSubscription.status,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Handle existing active subscriptions
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Subscription is not canceled and cannot be reactivated',
            currentStatus: subscription.status,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If no matching action
    return new Response(
      JSON.stringify({ error: 'Invalid action', receivedAction: action }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
