import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { trackLeadEvent } from '@/utils/gaHelper';

/**
 * Custom hook to fetch property data and handle related states/tracking
 * @param {string} slug - The property slug to fetch
 * @returns {Object} { property, loading, error }
 */
const useProperty = (slug) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no slug provided, don't attempt fetch
    if (!slug) return;

    // AbortController to cancel fetch if component unmounts
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property with broker details
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*, broker:brokers(*)')
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Property not found');

        // Only update state if not aborted
        if (!signal.aborted) {
          setProperty(data);
          
          // Trigger GA4 event for viewing item
          // This should ideally happen only once per valid view
          trackLeadEvent('view_item', {
            currency: 'BRL',
            value: data.business_type === 'rent' ? data.rental_price : data.price,
            items: [{ 
                item_id: data.id, 
                item_name: data.title,
                item_category: data.business_type === 'rent' ? 'Locação' : 'Venda',
            }],
          });
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching property:', err);
          setError(err);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [slug]);

  return { property, loading, error };
};

export default useProperty;