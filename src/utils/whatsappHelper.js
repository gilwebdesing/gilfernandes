import { formatPrice } from './seoHelpers';

export const encodeWhatsAppMessage = (message) => {
  return encodeURIComponent(message);
};

export const formatWhatsAppMessage = (property) => {
  if (!property) return "Olá! Tenho interesse em um imóvel.";

  const isRent = property.business_type === 'rent';
  const typeLabel = isRent ? 'LOCAÇÃO' : 'VENDA';
  const priceVal = isRent ? property.rental_price : property.price;
  const priceFormatted = formatPrice(priceVal, isRent);
  const url = `${window.location.origin}/imovel/${property.slug}`;

  return `Olá! Tenho interesse no imóvel ${property.title} (${property.neighborhood}) - ${typeLabel} - ${priceFormatted}. Link: ${url}`;
};

export const generateWhatsAppLink = (property, businessPhone = '5511971157373') => {
  const message = formatWhatsAppMessage(property);
  const encodedMessage = encodeWhatsAppMessage(message);
  // Ensure phone number format is clean
  const cleanPhone = businessPhone.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
};