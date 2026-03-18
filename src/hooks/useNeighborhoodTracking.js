import { useEffect, useCallback } from 'react';
import { trackLeadEvent } from '@/utils/gaHelper';

export const useNeighborhoodTracking = (neighborhoodData) => {
  useEffect(() => {
    if (!neighborhoodData) return;

    const { name, slug, properties = [] } = neighborhoodData;
    const saleProps = properties.filter(p => p.business_type === 'sale');
    const rentProps = properties.filter(p => p.business_type === 'rent');

    trackLeadEvent('neighborhood_page_view', {
      neighborhood: name,
      neighborhood_slug: slug,
      has_sale_properties: saleProps.length > 0,
      has_rent_properties: rentProps.length > 0,
      total_properties: properties.length,
      origin: 'neighborhood_blog'
    });
  }, [neighborhoodData?.slug]); // Only track when slug changes/loads

  const trackWhatsAppClick = useCallback((businessType, propertyId = null) => {
    if (!neighborhoodData) return;
    
    trackLeadEvent('neighborhood_whatsapp_click', {
      neighborhood: neighborhoodData.name,
      business_type: businessType,
      property_id: propertyId,
      origin: 'neighborhood_blog'
    });
  }, [neighborhoodData]);

  const trackFormSubmit = useCallback((email, phone) => {
    if (!neighborhoodData) return;

    trackLeadEvent('neighborhood_form_submit', {
      neighborhood: neighborhoodData.name,
      user_email: email,
      user_phone: phone,
      origin: 'neighborhood_blog'
    });
  }, [neighborhoodData]);

  const trackPropertyClick = useCallback((propertyId, businessType) => {
    if (!neighborhoodData) return;

    trackLeadEvent('neighborhood_property_click', {
      neighborhood: neighborhoodData.name,
      property_id: propertyId,
      business_type: businessType,
      origin: 'neighborhood_blog'
    });
  }, [neighborhoodData]);

  return {
    trackWhatsAppClick,
    trackFormSubmit,
    trackPropertyClick
  };
};