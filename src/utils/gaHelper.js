export const validatePropertyData = (property) => {
  if (!property) return false;
  
  const hasId = !!property.id;
  const hasTitle = !!property.title;
  const hasBusinessType = property.business_type === 'sale' || property.business_type === 'rent';
  
  // Validate price logic based on business type
  let hasValidPrice = false;
  if (property.business_type === 'sale') {
      hasValidPrice = property.price > 0;
  } else if (property.business_type === 'rent') {
      hasValidPrice = property.rental_price > 0;
  }

  const hasNeighborhood = !!property.neighborhood;
  const hasSlug = !!property.slug;

  const isValid = hasId && hasTitle && hasBusinessType && hasValidPrice && hasNeighborhood && hasSlug;

  if (!isValid && import.meta.env.DEV) {
    console.warn('[GA Helper] Invalid property data for tracking:', {
        hasId, hasTitle, hasBusinessType, hasValidPrice, hasNeighborhood, hasSlug, property
    });
  }

  return isValid;
};

export const validateFormData = (formData) => {
  if (!formData) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Simple phone validation: at least 8 digits
  const phoneRegex = /\d{8,}/;

  const hasName = !!formData.name?.trim();
  const hasValidEmail = emailRegex.test(formData.email);
  const hasValidPhone = phoneRegex.test(formData.phone?.replace(/\D/g, ''));
  // Message is optional in some contexts, but usually good to have checks if required
  
  const isValid = hasName && hasValidEmail && hasValidPhone;

  if (!isValid && import.meta.env.DEV) {
      console.warn('[GA Helper] Invalid form data for tracking:', { hasName, hasValidEmail, hasValidPhone });
  }

  return isValid;
};

export const trackLeadEvent = (eventName, parameters = {}) => {
  // Check if gtag is available (usually injected by GTM or analytics script in index.html)
  if (typeof window.gtag !== 'function') {
    if (import.meta.env.DEV) {
      console.log(`[GA Dev] Event skipped (gtag not found): ${eventName}`, parameters);
    }
    return;
  }

  try {
    window.gtag('event', eventName, parameters);
    
    if (import.meta.env.DEV) {
      console.log(`[GA Dev] Event fired: ${eventName}`, parameters);
    }
  } catch (error) {
    console.error(`[GA Error] Failed to fire event ${eventName}:`, error);
  }
};