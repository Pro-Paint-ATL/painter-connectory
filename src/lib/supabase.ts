
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the pre-configured client
export const supabase = supabaseClient;

// Create a security definer function to get user role safely
const createSecurityDefinerFunction = async () => {
  try {
    // Check if the function already exists
    const { data, error } = await supabase.rpc('get_current_user_role')
      .then(response => {
        return { data: response.data, error: response.error };
      });
    
    if (error && error.message.includes('function "get_current_user_role" does not exist')) {
      console.log('Creating security definer function for user roles...');
      // Create the function if it doesn't exist
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION public.get_current_user_role()
        RETURNS TEXT AS $$
          SELECT role FROM public.profiles WHERE id = auth.uid();
        $$ LANGUAGE SQL SECURITY DEFINER STABLE;
      `;
      
      // Execute the function creation using the REST API
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
          'X-Client-Info': 'lovable-app'
        },
        body: JSON.stringify({ query: createFunctionQuery })
      });
      
      if (!response.ok) {
        console.error('Error creating security definer function via REST');
      } else {
        console.log('Security definer function created successfully');
      }
    } else if (!error) {
      console.log('Security definer function already exists');
    }
  } catch (error) {
    console.error('Error checking for security definer function:', error);
  }
};

// Test connection and setup security function if needed
Promise.resolve().then(() => {
  return supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })
    .then(response => {
      if (response.error && response.error.message.includes('invalid api key')) {
        console.error('Supabase connection error: Invalid API key');
      } else if (response.error && response.error.message.includes('connection')) {
        console.error('Supabase connection error:', response.error.message);
      } else if (response.error && response.error.message.includes('infinite recursion')) {
        console.error('Infinite recursion error detected in profiles table policies:', response.error.message);
        console.log('Please fix the RLS policies on the profiles table');
      } else {
        console.log('Supabase connection successful');
        // Try to create the security definer function if needed
        createSecurityDefinerFunction();
      }
      return Promise.resolve();
    });
})
.catch((error: Error) => {
  console.error('Error testing Supabase connection:', error);
});

// Helper function to safely get user role using RPC
export const getUserRole = async () => {
  try {
    const { data, error } = await supabase.rpc('get_current_user_role');
    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
