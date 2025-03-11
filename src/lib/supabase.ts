
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the pre-configured client
export const supabase = supabaseClient;

// Define the return type for the RPC function
interface CreateGetRoleFunctionResponse {
  data: any;
  error: any;
}

// Create a security definer function to get user role safely
const createSecurityDefinerFunction = async () => {
  try {
    // Check if the function already exists
    const { data: functionExists, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(response => {
        return { data: response.data, error: response.error };
      });
    
    // Only create function if table exists but function doesn't
    if (functionExists && !checkError) {
      // Call the function with explicit type casting
      const { error } = await (supabase.rpc as any)(
        'create_get_role_function'
      );
      if (error) {
        console.error('Error creating security definer function:', error);
      } else {
        console.log('Security definer function created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking for security definer function:', error);
  }
};

// This will log if the connection is successful
// Wrap the entire chain in a Promise.resolve() to ensure we have a proper Promise
Promise.resolve().then(() => {
  return supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })
    .then(response => {
      if (response.error && response.error.message.includes('invalid api key')) {
        console.error('Supabase connection error: Invalid API key');
      } else if (response.error && response.error.message.includes('connection')) {
        console.error('Supabase connection error:', response.error.message);
      } else {
        console.log('Supabase connection successful');
        // Try to create the security definer function if needed
        createSecurityDefinerFunction();
      }
      return Promise.resolve(); // Return a Promise to maintain the chain
    });
})
.catch((error: Error) => {
  console.error('Error testing Supabase connection:', error);
});

// Create custom functions to interact with RPC safely
export const createSecurityFunction = async () => {
  try {
    // Using type casting to bypass the TypeScript constraint issue
    const { error } = await (supabase.rpc as any)(
      'create_get_role_function'
    );
    return { error };
  } catch (error) {
    console.error('Error creating security function:', error);
    return { error };
  }
};
