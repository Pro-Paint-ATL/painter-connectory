
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Check if all three Stripe secrets are configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');

    const configured = !!(stripeSecretKey && stripeWebhookSecret && stripePriceId);

    return new Response(
      JSON.stringify({
        configured,
        // Don't send the actual keys, just whether they're configured
        keys: {
          secretKey: !!stripeSecretKey,
          webhookSecret: !!stripeWebhookSecret,
          priceId: !!stripePriceId
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error checking Stripe configuration:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
