import { useCallback } from 'react';
import { generatePropertySEO } from '@/utils/generatePropertySEO';

export const useSEOGeneration = () => {
  
  const generateSEOForProperty = useCallback((propertyData) => {
    return generatePropertySEO(propertyData);
  }, []);

  const validatePropertyForSEO = useCallback((propertyData) => {
    const { errors } = generatePropertySEO(propertyData);
    return errors;
  }, []);

  const isSEOComplete = useCallback((property) => {
    return (
      property.meta_title && 
      property.meta_title.trim().length > 0 &&
      property.meta_description && 
      property.meta_description.trim().length > 0
    );
  }, []);

  return {
    generateSEOForProperty,
    validatePropertyForSEO,
    isSEOComplete
  };
};

export default useSEOGeneration;