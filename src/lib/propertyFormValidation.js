/**
 * Validates the property form data including SEO fields.
 */

export const validateBusinessType = (type) => {
  if (!type || (type !== 'sale' && type !== 'rent')) {
    return { isValid: false, error: 'Obrigatório selecionar o Tipo de Negócio (Venda ou Locação).' };
  }
  return { isValid: true };
};

export const validatePrice = (price, businessType) => {
  const numPrice = parseFloat(price);
  
  if (businessType === 'sale') {
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      return { isValid: false, error: 'O Preço de Venda é obrigatório e deve ser maior que zero.' };
    }
  } else if (businessType === 'rent') {
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      return { isValid: false, error: 'O Valor de Locação é obrigatório e deve ser maior que zero.' };
    }
  } else {
    return { isValid: false, error: 'Tipo de negócio inválido.' };
  }
  
  return { isValid: true };
};

export const validateSEOFields = (metaTitle, metaDescription) => {
  const warnings = [];
  const errors = [];
  
  // Required Checks
  if (!metaTitle?.trim()) {
      errors.push("Meta Title é obrigatório para SEO.");
  }
  if (!metaDescription?.trim()) {
      errors.push("Meta Description é obrigatório para SEO.");
  }

  // Length Checks (Warnings)
  if (metaTitle) {
      if (metaTitle.length < 50) warnings.push("Meta Title curto demais (ideal: 50-60).");
      if (metaTitle.length > 60) warnings.push("Meta Title longo demais (ideal: 50-60).");
  }

  if (metaDescription) {
      if (metaDescription.length < 150) warnings.push("Meta Description curta demais (ideal: 150-160).");
      if (metaDescription.length > 160) warnings.push("Meta Description longa demais (ideal: 150-160).");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validatePropertyForm = (formData) => {
  const errors = [];

  // 1. Business Type
  const typeValidation = validateBusinessType(formData.business_type);
  if (!typeValidation.isValid) {
    errors.push(typeValidation.error);
    return { isValid: false, errors }; 
  }

  // 2. Price
  const activePrice = formData.business_type === 'sale' ? formData.price : formData.rental_price;
  const priceValidation = validatePrice(activePrice, formData.business_type);
  if (!priceValidation.isValid) errors.push(priceValidation.error);

  // 3. Basic Fields
  if (!formData.title?.trim()) errors.push('O título do anúncio é obrigatório.');
  if (!formData.neighborhood?.trim()) errors.push('O bairro é obrigatório.');
  if (!formData.slug?.trim()) errors.push('O slug (URL amigável) é obrigatório.');

  // 4. Slug Format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (formData.slug && !slugRegex.test(formData.slug)) {
    errors.push('O slug deve conter apenas letras minúsculas, números e hífens.');
  }

  // 5. SEO Fields (Required)
  const seoValidation = validateSEOFields(formData.meta_title, formData.meta_description);
  if (!seoValidation.isValid) {
      errors.push(...seoValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};