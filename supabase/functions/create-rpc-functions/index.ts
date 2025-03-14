
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();

    if (action === 'create_rpc_functions') {
      const updateProfileFunction = `
        CREATE OR REPLACE FUNCTION public.update_user_profile(user_id UUID, company_info_data JSONB, role_value TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          UPDATE profiles
          SET company_info = company_info_data,
              role = role_value
          WHERE id = user_id;
        END;
        $$;
      `;

      const updateSubscriptionFunction = `
        CREATE OR REPLACE FUNCTION public.update_user_subscription(user_id UUID, subscription_data JSONB)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          UPDATE profiles
          SET subscription = subscription_data
          WHERE id = user_id;
        END;
        $$;
      `;

      const getUserRoleFunction = `
        CREATE OR REPLACE FUNCTION public.get_current_user_role()
        RETURNS TEXT
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
          role_value TEXT;
        BEGIN
          SELECT role INTO role_value FROM profiles WHERE id = auth.uid();
          RETURN role_value;
        END;
        $$;
      `;

      // Execute the function creations
      await supabaseClient.rpc('exec_sql', { sql: updateProfileFunction });
      await supabaseClient.rpc('exec_sql', { sql: updateSubscriptionFunction });
      await supabaseClient.rpc('exec_sql', { sql: getUserRoleFunction });

      return new Response(
        JSON.stringify({ success: true, message: 'RPC functions created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
