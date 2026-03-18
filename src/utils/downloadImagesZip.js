
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export const downloadPropertyImagesZip = async (onProgress) => {
  try {
    // Admin verification: Check session for gilfernandesml@gmail.com
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== 'gilfernandesml@gmail.com') {
      throw new Error('Acesso negado. Apenas o administrador gilfernandesml@gmail.com pode baixar backups de imagens.');
    }

    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, images, title');

    if (error) throw error;
    if (!properties || properties.length === 0) {
      throw new Error('Nenhuma propriedade encontrada.');
    }

    const zip = new JSZip();
    let totalImages = 0;
    let downloadedImages = 0;

    // Count total images
    const imageTasks = [];
    properties.forEach(prop => {
      let imgs = [];
      if (Array.isArray(prop.images)) imgs = prop.images;
      
      imgs.forEach((url, index) => {
        if (url) {
          totalImages++;
          imageTasks.push({ propId: prop.id, url, index });
        }
      });
    });

    if (totalImages === 0) {
      throw new Error('Nenhuma imagem encontrada nas propriedades.');
    }

    // Download images and add to zip
    for (const task of imageTasks) {
      try {
        let blob;
        // Check if it's a Supabase storage URL to use the client, otherwise fetch
        if (task.url.includes('supabase.co/storage/v1/object/public/property-images/')) {
           const path = task.url.split('property-images/')[1];
           const { data, error: downloadError } = await supabase.storage.from('property-images').download(path);
           if (downloadError) throw downloadError;
           blob = data;
        } else {
           const response = await fetch(task.url);
           if (!response.ok) throw new Error(`HTTP ${response.status}`);
           blob = await response.blob();
        }

        const ext = task.url.split('.').pop().split('?')[0] || 'jpg';
        const filename = `property-${task.propId}/image-${task.index + 1}.${ext.length > 4 ? 'jpg' : ext}`;
        
        zip.file(filename, blob);
      } catch (err) {
        console.warn(`Failed to download image ${task.url}:`, err);
        // Continue even if one fails
      } finally {
        downloadedImages++;
        if (onProgress) onProgress(downloadedImages, totalImages);
      }
    }

    // Generate ZIP
    if (onProgress) onProgress(totalImages, totalImages, 'Gerando arquivo ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `images-export-${timestamp}.zip`;
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(zipBlob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: 'ZIP com imagens exportado com sucesso!' };

  } catch (err) {
    console.error('Download ZIP Error:', err);
    return { success: false, message: err.message || 'Erro ao criar ZIP de imagens' };
  }
};
