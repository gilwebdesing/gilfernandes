import { supabase } from '@/lib/supabase';

export const SEOService = {
  /**
   * Fetch properties that have empty meta_title OR meta_description
   */
  async getPropertiesWithIncompleteSEO() {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, meta_title, meta_description, type, neighborhood, area, amenities, bedrooms, bathrooms, location')
      .or('meta_title.is.null,meta_description.is.null,meta_title.eq.,meta_description.eq.');

    if (error) throw error;
    
    // Filter out ones that might be empty strings if OR query didn't catch them all perfectly (depending on DB constraints)
    return data.filter(p => !p.meta_title || !p.meta_description || p.meta_title.trim() === '' || p.meta_description.trim() === '');
  },

  /**
   * Update SEO fields for a single property
   */
  async updatePropertySEO(propertyId, metaTitle, metaDescription) {
    const { data, error } = await supabase
      .from('properties')
      .update({ 
        meta_title: metaTitle, 
        meta_description: metaDescription 
      })
      .eq('id', propertyId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Get overall SEO statistics
   */
  async getPropertySEOStatus() {
    // We get all to calculate stats. For very large DBs, use count() with filters.
    // Assuming reasonable dataset size for client-side calculation or use count queries.
    
    const { count: total, error: errTotal } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    if (errTotal) throw errTotal;

    const { count: incomplete, error: errIncomplete } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .or('meta_title.is.null,meta_description.is.null,meta_title.eq.,meta_description.eq.');

    if (errIncomplete) throw errIncomplete;

    const complete = total - incomplete;

    return {
      total: total || 0,
      complete: complete || 0,
      incomplete: incomplete || 0,
      percentageComplete: total > 0 ? Math.round((complete / total) * 100) : 0
    };
  }
};