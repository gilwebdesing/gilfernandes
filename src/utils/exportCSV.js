
import { supabase } from '@/lib/supabase';

export const exportPropertiesCSV = async () => {
  try {
    // Admin verification: Check session for gilfernandesml@gmail.com
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== 'gilfernandesml@gmail.com') {
      throw new Error('Acesso negado. Apenas o administrador gilfernandesml@gmail.com pode exportar dados.');
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');

    if (error) throw error;
    if (!properties || properties.length === 0) {
      throw new Error('Nenhuma propriedade encontrada para exportar.');
    }

    // Define columns based on the first item + common fields
    const columns = [
      'id', 'title', 'description', 'price', 'rental_price', 'business_type',
      'bedrooms', 'bathrooms', 'suites', 'parking_spaces', 'area',
      'type', 'neighborhood', 'address', 'location', 'lat', 'lng',
      'status', 'property_status', 'created_at', 'updated_at', 'images'
    ];

    // Create CSV header
    const csvRows = [columns.join(',')];

    // Escape CSV cell
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    // Format rows
    properties.forEach(prop => {
      const row = columns.map(col => {
        if (col === 'images') {
          let imgs = '';
          if (Array.isArray(prop.images)) {
            imgs = prop.images.join('|');
          } else if (typeof prop.image_url === 'string') {
            imgs = prop.image_url;
          }
          return escapeCsv(imgs);
        }
        return escapeCsv(prop[col]);
      });
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `properties-export-${timestamp}.csv`;
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return { success: true, message: 'CSV exportado com sucesso!' };
  } catch (err) {
    console.error('Export CSV Error:', err);
    return { success: false, message: err.message || 'Erro ao exportar CSV' };
  }
};
