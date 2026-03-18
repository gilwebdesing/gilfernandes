import { supabase } from '@/lib/supabase';

export const saveLead = async ({ property_id, name, email, phone, message, source }) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          property_id,
          name: name || 'Lead via Sistema',
          email: email || null,
          phone: phone || null,
          message: message || `Lead gerado via ${source}`,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
};

export const updateLeadStatus = async (leadId, status) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error };
  }
};

export const getLeadsByBroker = async (brokerId) => {
  try {
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id')
      .eq('broker_id', brokerId);

    if (!propertiesData) return { success: true, data: [] };

    const propertyIds = propertiesData.map(p => p.id);
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        property:properties(title, neighborhood)
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error };
  }
};