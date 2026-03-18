/**
 * Image Optimization Utilities
 * Handles image URL transformation, srcset generation, and format optimization.
 */

// Helper to check if URL is external
const isExternalUrl = (url) => {
  return url.startsWith('http') || url.startsWith('//');
};

/**
 * Generates an optimized image URL.
 * Note: This is a simulation. In a real scenario, you'd append query params 
 * for an image CDN (like Cloudinary, Imgix, or Supabase Storage image transformation).
 * Since we are using standard URLs, we'll return the original for now, 
 * but structured to easily plug in a CDN.
 */
export const getOptimizedImageUrl = (url, width, format = 'webp') => {
  if (!url) return '';
  
  // Example for Supabase Storage transformation (if enabled) or other CDNs:
  // if (url.includes('supabase.co')) {
  //   return `${url}?width=${width}&format=${format}&quality=80`;
  // }
  
  // For Unsplash (often used in placeholders)
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&fmt=${format}&q=80`;
  }

  return url;
};

/**
 * Generates a standard srcset string for responsive images.
 * @param {string} url - The source image URL
 * @param {Array<number>} widths - Array of widths to generate (default: [480, 768, 1200])
 */
export const generateSrcSet = (url, widths = [480, 768, 1200]) => {
  if (!url) return '';
  
  return widths
    .map((width) => `${getOptimizedImageUrl(url, width)} ${width}w`)
    .join(', ');
};

/**
 * Hook logic helper for Intersection Observer
 * (Usually implemented as a React hook, see useImageIntersection.js)
 */
export const observeElement = (element, callback, options = {}) => {
  if (!element || typeof IntersectionObserver === 'undefined') {
    callback(); // Fallback for no support
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });

  observer.observe(element);
  return observer;
};