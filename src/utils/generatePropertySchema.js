export const generatePropertySchema = (property) => {
  if (!property) return {};

  const baseUrl = 'https://gilcorretorsp.com.br';
  const canonicalUrl = `${baseUrl}/imovel/${property.slug}`;
  
  // Determine specific Schema.org type
  // Defaulting to Apartment or House, falling back to RealEstateListing
  let schemaType = 'RealEstateListing';
  const typeLower = property.type?.toLowerCase() || '';
  if (typeLower.includes('apartamento')) schemaType = 'Apartment';
  else if (typeLower.includes('casa')) schemaType = 'House';

  const price = property.starting_from_price || property.price || property.rental_price || 0;
  const currency = 'BRL';

  // Construct the schema object
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": property.meta_title || property.title,
    "description": property.meta_description || property.description,
    "url": canonicalUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address,
      "addressLocality": property.neighborhood,
      "addressRegion": "SP",
      "addressCountry": "BR"
    },
    "numberOfRooms": Number(property.bedrooms) || 0,
    "numberOfBathroomsTotal": Number(property.bathrooms) || 0,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": Number(property.area) || 0,
      "unitCode": "MTK" // Square meters
    }
  };

  // Add image if available
  if (property.images && property.images.length > 0) {
    schema.image = property.images[0];
  }

  // Handle Price / Offers
  if (property.business_type === 'rent') {
    schema.offers = {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": price,
        "priceCurrency": currency,
        "unitCode": "P1M" // Per Month
      }
    };
  } else {
    schema.offers = {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock"
    };
  }

  return schema;
};