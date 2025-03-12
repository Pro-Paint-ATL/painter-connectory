
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    // Parse request body
    const { action } = await req.json();

    if (action !== 'create_role_function') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    console.log('Creating security definer function for user roles...');

    // SQL to create the security definer function
    const sql = `
      CREATE OR REPLACE FUNCTION public.get_current_user_role()
      RETURNS TEXT AS $$
        SELECT role FROM public.profiles WHERE id = auth.uid();
      $$ LANGUAGE SQL SECURITY DEFINER STABLE;
    `;

    // Execute the SQL
    const { error } = await supabaseClient.rpc('pgql', { query: sql });

    if (error) {
      console.error('Error creating security definer function:', error);
      throw error;
    }

    console.log('Security definer function created successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Security definer function created successfully' }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
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
