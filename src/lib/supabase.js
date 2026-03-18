import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL ERROR: Missing Supabase credentials.\n' +
    'Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.\n' +
    'Current URL: ' + (supabaseUrl ? 'Set' : 'Missing') + '\n' +
    'Current Key: ' + (supabaseAnonKey ? 'Set' : 'Missing')
  );
}

// Check if the key looks like a secret key (which shouldn't be used on the client)
if (supabaseAnonKey && (supabaseAnonKey.startsWith('sb_secret') || supabaseAnonKey.includes('secret'))) {
  console.error(
    'CRITICAL ERROR: It appears you are using a Supabase SECRET key in the client-side application. ' +
    'You must use the ANON key (public key) for browser applications. ' +
    'Please update VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Initialize Supabase client
// We strictly use the Anon Key here. The Secret Key is never safe for browser use.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Helper function to test connection
export const testConnection = async () => {
  if (!supabase) return false;
  try {
    const { count, error } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    if (error) throw error;
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    return false;
  }
};