import { supabase } from '@/lib/supabase';

export const fetchNeighborhoodBySlug = async (slug) => {
  if (!slug) return null;
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching neighborhood:', error);
    return null;
  }
  return data;
};

export const fetchPropertiesByNeighborhood = async (neighborhoodName) => {
  if (!neighborhoodName) return [];

  // Note: Using ILIKE for case-insensitive matching is safer
  const { data, error } = await supabase
    .from('properties')
    .select('*, broker:brokers(*)')
    .eq('status', 'active')
    .ilike('neighborhood', `%${neighborhoodName}%`);

  if (error) {
    console.error('Error fetching properties for neighborhood:', error);
    return [];
  }
  return data || [];
};

export const calculatePriceRanges = (properties = []) => {
  const saleProps = properties.filter(p => p.business_type === 'sale' && p.price > 0);
  const rentProps = properties.filter(p => p.business_type === 'rent' && p.rental_price > 0);

  const getMinMax = (props, field) => {
    if (!props.length) return { min: 0, max: 0 };
    const values = props.map(p => Number(p[field]));
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const saleRange = getMinMax(saleProps, 'price');
  const rentRange = getMinMax(rentProps, 'rental_price');

  return {
    saleMin: saleRange.min,
    saleMax: saleRange.max,
    rentMin: rentRange.min,
    rentMax: rentRange.max,
    saleCount: saleProps.length,
    rentCount: rentProps.length
  };
};

export const getPropertyCounts = (properties = []) => {
  const counts = {
    studios: 0,
    oneBed: 0,
    twoBed: 0,
    threePlusBed: 0
  };

  properties.forEach(p => {
    const beds = p.bedrooms || 0;
    if (beds === 0 || p.type?.toLowerCase().includes('studio')) counts.studios++;
    else if (beds === 1) counts.oneBed++;
    else if (beds === 2) counts.twoBed++;
    else if (beds >= 3) counts.threePlusBed++;
  });

  return counts;
};