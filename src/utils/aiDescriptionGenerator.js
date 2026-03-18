import { supabase } from '@/lib/supabase';

export async function generatePropertyDescription(propertyData) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-property-description', {
      body: { propertyData }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to generate description');
    }

    if (!data || !data.description) {
      throw new Error('No description returned from AI service');
    }

    return data.description;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}