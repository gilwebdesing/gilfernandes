import { supabase } from '@/lib/supabase';

/**
 * Validates and inserts a batch of properties into Supabase.
 * @param {Array<Object>} mappedProperties - Array of property objects ready for DB.
 * @param {string} brokerId - The ID of the broker to assign these properties to.
 * @returns {Promise<Object>} - Summary of success/failure counts and errors.
 */
export async function importProperties(mappedProperties, brokerId) {
  let successCount = 0;
  let failedCount = 0;
  const errors = [];
  const batchSize = 10; // Insert in small batches to avoid timeouts or huge payload errors

  // 1. Validation Logic
  const validProperties = [];
  
  mappedProperties.forEach((prop, index) => {
    // Inject broker_id ensuring it overwrites or sets if missing
    const propWithBroker = {
      ...prop,
      broker_id: brokerId
    };

    const missingFields = [];
    if (!propWithBroker.title) missingFields.push('title');
    if (!propWithBroker.neighborhood) missingFields.push('neighborhood');
    if (!propWithBroker.broker_id) missingFields.push('broker_id');

    if (missingFields.length > 0) {
      failedCount++;
      errors.push({
        row: index + 1,
        title: propWithBroker.title || 'Sem título',
        error: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
      });
    } else {
      validProperties.push(propWithBroker);
    }
  });

  // 2. Batch Insertion
  for (let i = 0; i < validProperties.length; i += batchSize) {
    const batch = validProperties.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('properties')
        .insert(batch);

      if (error) {
        throw error;
      }

      successCount += batch.length;
    } catch (error) {
      failedCount += batch.length;
      
      let friendlyError = `Erro ao inserir lote de ${batch.length} imóveis: ${error.message}`;
      
      // Handle Foreign Key Constraint Violation for Broker ID
      if (error.message && error.message.includes('properties_broker_id_fkey')) {
        friendlyError = "Erro ao vincular imóveis ao seu perfil. Verifique se seu perfil de corretor está completo e tente novamente.";
      }

      errors.push({
        batch_index: i,
        error: friendlyError
      });
      console.error('Batch insert error:', error);
    }
  }

  return {
    successCount,
    failedCount,
    totalProcessed: mappedProperties.length,
    errors
  };
}