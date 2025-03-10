
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your project settings."
  );
}

// Create supabase client with proper error handling
let supabase;
try {
  supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Create a fallback client that will prevent crashes
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    // Add other minimal required methods to prevent crashes
  };
}

export { supabase };
