import { useState, useCallback, useRef } from 'react';
import { trackLeadEvent, validatePropertyData, validateFormData } from '@/utils/gaHelper';

export const useLeadTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const clickTimeoutRef = useRef(null);
  const formTimeoutRef = useRef(null);
  const trackedEventsRef = useRef(new Set()); // To prevent immediate duplicate firing

  const trackWhatsAppClick = useCallback((property, businessPhone) => {
    // 1. Debounce check
    if (clickTimeoutRef.current) return;

    // 2. Prevent duplicate tracking of same property click within session if desired
    // For WhatsApp clicks, user might return and click again, so we just debounce rapidly.
    
    setIsTracking(true);

    try {
        if (!validatePropertyData(property)) {
            console.warn('[Tracking] Invalid property data, skipping WA tracking.');
            return;
        }

        const eventId = `wa_click_${property.id}_${Date.now()}`;
        
        trackLeadEvent('lead_whatsapp_click', {
            event_category: 'Lead',
            event_label: property.business_type === 'rent' ? 'Locação' : 'Venda',
            property_id: property.id,
            property_title: property.title,
            property_type: property.type,
            property_neighborhood: property.neighborhood,
            business_type: property.business_type,
            value: property.business_type === 'rent' ? property.rental_price : property.price,
            currency: 'BRL'
        });

    } catch (error) {
        console.error('[Tracking] Error tracking WhatsApp click:', error);
    } finally {
        // Reset tracking state after small delay
        clickTimeoutRef.current = setTimeout(() => {
            setIsTracking(false);
            clickTimeoutRef.current = null;
        }, 300);
    }
  }, []);

  const trackFormSubmit = useCallback((formData, property = null) => {
    if (formTimeoutRef.current) return;
    
    setIsTracking(true);

    try {
        if (!validateFormData(formData)) {
            console.warn('[Tracking] Invalid form data, skipping submit tracking.');
            return;
        }

        const params = {
            event_category: 'Lead',
            event_label: 'Form Submission',
            contact_method: 'form'
        };

        if (property && validatePropertyData(property)) {
            params.property_id = property.id;
            params.property_title = property.title;
            params.business_type = property.business_type;
            params.value = property.business_type === 'rent' ? property.rental_price : property.price;
            params.currency = 'BRL';
        }

        trackLeadEvent('lead_form_submit', params);

    } catch (error) {
        console.error('[Tracking] Error tracking form submit:', error);
    } finally {
        formTimeoutRef.current = setTimeout(() => {
            setIsTracking(false);
            formTimeoutRef.current = null;
        }, 500);
    }
  }, []);

  return {
    trackWhatsAppClick,
    trackFormSubmit,
    isTracking
  };
};