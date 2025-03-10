
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Please check the error message on screen for instructions on how to add them."
  );
}

// Create supabase client with proper error handling
let supabase;
try {
  supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
  // Test the connection by making a simple query
  supabase.from('profiles').select('count', { count: 'exact', head: true })
    .then(response => {
      if (response.error && response.error.message.includes('invalid api key')) {
        console.error('Supabase connection error: Invalid API key');
      } else if (response.error && response.error.message.includes('connection')) {
        console.error('Supabase connection error:', response.error.message);
      } else {
        console.log('Supabase connection successful');
      }
    })
    .catch(error => {
      console.error('Error testing Supabase connection:', error);
    });
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Create a fallback client that will prevent crashes
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    // Add other minimal required methods to prevent crashes
  };
}

export { supabase };
