
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the pre-configured client
export const supabase = supabaseClient;

// Create a security definer function to get user role safely
const createSecurityDefinerFunction = async () => {
  try {
    // Check if the function already exists
    // Use any type to bypass TypeScript type checking
    const { error: roleError } = await (supabaseClient as any).rpc(
      'get_current_user_role',
      {},
      { count: 'exact', head: true }
    );
    
    // If we get here and there's no error, the function exists
    if (!roleError) {
      console.log('Security definer function already exists');
      return;
    }
    
    // Check if the error is because the function doesn't exist
    if (roleError.message && roleError.message.includes('function "get_current_user_role" does not exist')) {
      console.log('Creating security definer function for user roles...');
      
      // Create the function using supabase edge function
      try {
        const { data, error: functionError } = await supabase.functions.invoke('create-role-function', {
          body: { action: 'create_role_function' }
        });
        
        if (functionError) {
          console.error('Error creating security definer function:', functionError);
        } else {
          console.log('Security definer function created successfully');
        }
      } catch (invokeError) {
        console.error('Error invoking edge function:', invokeError);
      }
    } else {
      console.error('Error checking for security definer function:', roleError);
    }
  } catch (error) {
    console.error('Error in createSecurityDefinerFunction:', error);
  }
};

// Test connection and setup security function if needed
Promise.resolve().then(async () => {
  try {
    const response = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
      
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
      await createSecurityDefinerFunction();
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
});

// Helper function to safely get user role using RPC
export const getUserRole = async () => {
  try {
    // Use any type to bypass TypeScript type checking
    const { data: roleData, error: roleError } = await (supabaseClient as any).rpc(
      'get_current_user_role',
      {},
      { count: 'exact' }
    );
    
    if (roleError) {
      throw roleError;
    }
    
    // Cast the result to string since we know the function returns a string
    return roleData as string;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
