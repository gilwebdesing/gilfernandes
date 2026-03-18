export const trackEvent = (eventName, params) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    console.log('Event tracked:', eventName, params);
    window.gtag('event', eventName, params);
  }
};

export const trackWhatsAppClick = (params = {}) => {
  if (!params.page_path) params.page_path = window.location.pathname;
  trackEvent('whatsapp_click', params);
};

export const trackPhoneClick = (params = {}) => {
  if (!params.page_path) params.page_path = window.location.pathname;
  trackEvent('phone_click', params);
};

export const trackLeadFormOpen = (params = {}) => {
  if (!params.page_path) params.page_path = window.location.pathname;
  trackEvent('lead_form_open', params);
};

export const trackLeadFormSubmit = (params = {}) => {
  if (!params.page_path) params.page_path = window.location.pathname;
  trackEvent('lead_form_submit', params);
};

export const trackPropertyView = (params = {}) => {
  if (!params.page_path) params.page_path = window.location.pathname;
  trackEvent('property_view', params);
};