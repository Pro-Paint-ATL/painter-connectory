
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the pre-configured client
export const supabase = supabaseClient;

// This will log if the connection is successful
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
