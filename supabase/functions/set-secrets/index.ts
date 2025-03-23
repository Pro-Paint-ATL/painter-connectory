
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the authorization header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user's data to verify they're an admin
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's role from the profiles table
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profiles || profiles.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { key, value } = requestData;

    // Validate input
    if (!key || !value) {
      return new Response(
        JSON.stringify({ error: 'Missing key or value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Setting secret: ${key}`);
    
    // Instead of using Deno.env.set which only sets for the current process,
    // we'll use Supabase to store the secret
    const { error: secretError } = await supabaseClient.rpc('set_secret', {
      name: key,
      value: value
    });

    if (secretError) {
      console.error('Error setting secret:', secretError);
      return new Response(
        JSON.stringify({ error: 'Failed to set secret', details: secretError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Secret set successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in set-secrets function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
