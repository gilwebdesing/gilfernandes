import { supabase } from '@/lib/supabase';

/**
 * Ensures that a broker profile exists for the given user.
 * If not found, it creates one using the provided details.
 * 
 * @param {string} userId - The Auth0/Supabase user ID
 * @param {string} userEmail - The user's email address
 * @param {string} [userName] - Optional name (defaults to 'Corretor')
 * @returns {Promise<Object>} The broker object (existing or created)
 */
export async function ensureBrokerExists(userId, userEmail, userName) {
  if (!userId) {
    console.error('ensureBrokerExists: Missing userId');
    throw new Error('User ID is required to ensure broker existence');
  }

  try {
    // 1. Check if broker exists
    const { data: existingBroker, error: fetchError } = await supabase
      .from('brokers')
      .select('*')
      .eq('id', userId)
      .single();

    // If found, return it
    if (!fetchError && existingBroker) {
      return existingBroker;
    }

    // Ignore "row not found" error (PGRST116), throw others
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking broker existence:', fetchError);
      throw fetchError;
    }

    // 2. Create if not exists
    console.log(`Broker profile not found for ${userId}. Creating new profile...`);
    
    const newBroker = {
      id: userId,
      email: userEmail || '',
      name: userName || 'Corretor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdBroker, error: insertError } = await supabase
      .from('brokers')
      .insert([newBroker])
      .select()
      .single();

    if (insertError) {
      // Handle race condition: if created by another process in the meantime
      if (insertError.code === '23505') { // Unique violation
         console.log('Broker profile created by another process concurrently. Fetching...');
         const { data: retryBroker } = await supabase
          .from('brokers')
          .select('*')
          .eq('id', userId)
          .single();
         return retryBroker;
      }
      
      console.error('Error creating broker profile:', insertError);
      throw insertError;
    }

    console.log('Broker profile created successfully:', createdBroker);
    return createdBroker;

  } catch (error) {
    console.error('ensureBrokerExists failed:', error);
    // Propagate error so caller knows something went wrong
    throw error;
  }
}