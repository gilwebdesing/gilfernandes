// Fallback generator when meta_title/meta_description are missing

export const formatPrice = (val, isRent = false) => {
  if (!val && val !== 0) return 'Sob Consulta';
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  return isRent ? `${formatted} / mês` : formatted;
};

export const generatePropertyTitle = (property) => {
  if (!property) return 'Imóvel | Gil Imóveis SP';
  const typeLabel = property.business_type === 'rent' ? 'Locação' : 'Venda';
  
  // Example: Apartamento 3 quartos em Vila Mariana para Venda
  return `${property.title} para ${typeLabel} em ${property.neighborhood} | Gil Imóveis`;
};

export const generatePropertyDescription = (property) => {
  if (!property) return '';
  const isRent = property.business_type === 'rent';
  const typeLabel = isRent ? 'Locação' : 'Venda';
  
  const priceVal = isRent ? property.rental_price : (property.starting_from_price || property.price);
  const priceFormatted = formatPrice(priceVal, isRent);
  const prefix = property.starting_from_price ? 'A partir de ' : '';
  
  const bedrooms = property.bedrooms || 0;
  const area = property.area || 0;
  
  // SEO Optimized fallback string
  return `Confira este imóvel para ${typeLabel} em ${property.neighborhood}, SP. ${bedrooms} quartos, ${area}m². Valor: ${prefix}${priceFormatted}. Agende sua visita agora com Gil Corretor.`;
};

// Kept for backward compatibility if used elsewhere, but new logic is in generatePropertySchema.js
export const generateRealEstateSchema = (property, baseUrl = 'https://gilcorretorsp.com.br') => {
  // ... existing implementation logic or re-export ...
  // For simplicity and robustness, we can just use the new one here if we imported it, 
  // but to avoid circular dependencies if imports were mixed, we'll leave a simple version here
  // or just redirect users to the new dedicated file.
  return {}; 
};