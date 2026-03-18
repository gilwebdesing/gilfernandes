
import { supabase } from '@/lib/supabase';

export const deletePropertiesWithoutDescription = async () => {
  let deletedCount = 0;
  let errors = [];

  try {
    // 1. Fetch properties where description is null or empty
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .or('description.is.null,description.eq.,description.eq."",description.eq.<p></p>,description.eq.<p><br></p>');

    if (fetchError) {
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      return { deletedCount: 0, errors: [] };
    }

    // 2. Iterate and delete
    for (const property of properties) {
      try {
        // Optional: Extract image paths from property.images to delete them from storage
        // If images are stored in 'property-images' bucket
        if (property.images && Array.isArray(property.images)) {
          const pathsToDelete = property.images
            .filter(url => url.includes('supabase.co/storage/v1/object/public/property-images/'))
            .map(url => url.split('property-images/')[1]);
            
          if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('property-images')
              .remove(pathsToDelete);
              
            if (storageError) {
              console.warn(`Failed to delete images for property ${property.id}:`, storageError);
            }
          }
        }

        // Delete the property record
        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', property.id);

        if (deleteError) {
          throw deleteError;
        }

        deletedCount++;
      } catch (err) {
        console.error(`Error deleting property ${property.id}:`, err);
        errors.push({ propertyId: property.id, message: err.message });
      }
    }

    return { deletedCount, errors };
  } catch (error) {
    console.error('Error fetching properties to delete:', error);
    errors.push({ message: error.message });
    return { deletedCount, errors };
  }
};
