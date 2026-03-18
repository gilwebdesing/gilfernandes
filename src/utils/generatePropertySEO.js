/**
 * Utility to generate SEO metadata for properties
 */

const TYPE_MAP = {
  'apartment': 'Apartamento',
  'house': 'Casa',
  'commercial': 'Imóvel Comercial',
  'land': 'Terreno',
  'condo': 'Condomínio',
  'loft': 'Loft',
  'studio': 'Studio',
  'duplex': 'Duplex'
};

export const generatePropertySEO = (property) => {
  if (!property) return { title: '', description: '', errors: ['Dados do imóvel inválidos'] };

  const errors = [];
  
  // 1. Validate required fields
  if (!property.type) errors.push('Tipo do imóvel é obrigatório');
  if (!property.neighborhood) errors.push('Bairro é obrigatório');
  if (!property.area && property.area !== 0) errors.push('Área privativa é obrigatória');
  if (!property.title) errors.push('Título/Nome do Empreendimento é obrigatório');

  if (errors.length > 0) {
    return { title: '', description: '', errors };
  }

  // 2. Prepare Variables
  const tipo = TYPE_MAP[property.type?.toLowerCase()] || property.type || 'Imóvel';
  const bairro = property.neighborhood;
  const nomeEmpreendimento = property.title; // Using title as proxy for development name
  const areaPrivativa = property.area;
  const cidade = property.location || 'São Paulo'; // Default to SP if missing, or use location field
  
  // 3. Generate Meta Title
  // Format: [tipo] à venda no [bairro] – [nomeEmpreendimento] | [areaPrivativa] m²
  let metaTitle = `${tipo} à venda no ${bairro} – ${nomeEmpreendimento} | ${areaPrivativa} m²`;
  
  // Truncate Title if needed (Soft limit ~60 chars, but format is strict, so we keep it logic-based)
  // If extremely long, we might need to truncate nomeEmpreendimento
  if (metaTitle.length > 65) {
      const availableSpace = 65 - (`${tipo} à venda no ${bairro} –  | ${areaPrivativa} m²`.length);
      if (availableSpace > 5) {
        const truncatedName = nomeEmpreendimento.substring(0, availableSpace) + '...';
        metaTitle = `${tipo} à venda no ${bairro} – ${truncatedName} | ${areaPrivativa} m²`;
      }
  }

  // 4. Generate Differential (Priorities)
  let diferencial = '';
  
  // Priority 1: Amenities
  if (property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0) {
      // Pick top 3 or specific ones
      const topAmenities = property.amenities.slice(0, 3).join(', ').toLowerCase();
      diferencial = `com ${topAmenities}`;
  } 
  // Priority 2: Bedrooms/Bathrooms
  else if (property.bedrooms || property.bathrooms) {
      const parts = [];
      if (property.bedrooms) parts.push(`${property.bedrooms} quartos`);
      if (property.bathrooms) parts.push(`${property.bathrooms} banheiros`);
      diferencial = `com ${parts.join(' e ')}`;
  }
  // Priority 3: Description snippet
  else if (property.description) {
      // Strip HTML
      const plainText = property.description.replace(/<[^>]*>?/gm, '');
      diferencial = plainText.substring(0, 50).trim();
      if (!diferencial.startsWith('com ')) diferencial = `com ${diferencial}`;
  } else {
      diferencial = 'com excelente localização';
  }

  // 5. Generate Meta Description
  // Format: [tipo] à venda no [bairro], no [nomeEmpreendimento], [diferencial]. Ótima opção para moradia ou investimento em [bairro], [cidade].
  let metaDescription = `${tipo} à venda no ${bairro}, no ${nomeEmpreendimento}, ${diferencial}. Ótima opção para moradia ou investimento em ${bairro}, ${cidade}.`;

  // Truncate Description (Max 160)
  if (metaDescription.length > 160) {
     // Try to shorten the differential or the generic part
     const basePart = `${tipo} à venda no ${bairro}, no ${nomeEmpreendimento}`;
     const endPart = `Ótima opção em ${bairro}.`; // Shortened end part
     
     const remainingChars = 155 - (basePart.length + endPart.length + 5); // 5 for punctuation/spacing
     
     if (remainingChars > 10) {
        const shortDiff = diferencial.substring(0, remainingChars) + '...';
        metaDescription = `${basePart}, ${shortDiff}. ${endPart}`;
     } else {
        // Fallback to very basic
        metaDescription = `${basePart}. ${endPart}`;
     }
  }

  return {
    title: metaTitle,
    description: metaDescription,
    errors: []
  };
};