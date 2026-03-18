import { generateWhatsAppLink as helperGenerateLink } from '@/utils/whatsappHelper';

// Re-export specific helper functionality for backward compatibility
// while ensuring new format is used where possible.

export const generateWhatsAppLink = (message = '') => {
  const phoneNumber = '5511971157373';
  const text = message ? encodeURIComponent(message) : encodeURIComponent('Olá! Gostaria de mais informações sobre os imóveis.');
  return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${text}`;
};

export const propertyInquiryMessage = (propertyTitle) => {
  return generateWhatsAppLink(`Olá, tenho interesse no imóvel: ${propertyTitle}`);
};

export const generalContactMessage = () => {
  return generateWhatsAppLink();
};

export const visitSchedulingMessage = (propertyTitle) => {
  return generateWhatsAppLink(`Gostaria de agendar uma visita ao imóvel: ${propertyTitle}`);
};

// Export new functionality
export { helperGenerateLink };