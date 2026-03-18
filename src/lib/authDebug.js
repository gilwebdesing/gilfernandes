import { supabase } from './supabase';

/**
 * Debug utility to test authentication directly.
 * Can be called from the browser console or debug buttons.
 */
export const debugLogin = async (email, password) => {
  if (!supabase) {
    console.error('[Auth Debug] Supabase client not initialized');
    return { success: false, error: 'Supabase client missing' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.group('🔐 Auth Debug: Login Attempt');
  console.log('Email:', normalizedEmail);
  console.log('Password Length:', password?.length || 0);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    if (error) {
      console.error('❌ Login Failed:', error);
      console.error('Error Code:', error.code || 'N/A');
      console.error('Error Message:', error.message);
      console.groupEnd();
      return { success: false, error };
    }

    console.log('✅ Login Success:', data);
    console.log('User ID:', data.user?.id);
    console.log('Session Expires At:', data.session?.expires_at);
    console.groupEnd();
    return { success: true, data };

  } catch (err) {
    console.error('💥 Unexpected Exception:', err);
    console.groupEnd();
    return { success: false, error: err };
  }
};

/**
 * Checks if a session currently exists
 */
export const checkCurrentSession = async () => {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('[Auth Debug] Current Session:', session ? 'Active' : 'None', error ? `(Error: ${error.message})` : '');
  return session;
};

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  window.authDebug = {
    login: debugLogin,
    checkSession: checkCurrentSession
  };
}