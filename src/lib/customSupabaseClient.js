import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtfdrselcbogwzkrnqmg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZmRyc2VsY2JvZ3d6a3JucW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODU3MTgsImV4cCI6MjA4MzQ2MTcxOH0.SrrP9T3E2bFRbwlzm5nfhLESQHKGJnmzIuaYsRMt5Rg';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
