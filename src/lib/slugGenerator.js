/**
 * Generates a URL-safe slug from a property title.
 * - Converts to lowercase
 * - Removes accents (normalization)
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Handles multiple hyphens
 */
export const generateSlug = (title) => {
  if (!title || typeof title !== 'string') return '';
  
  return title
    .toLowerCase() // Convert to lowercase
    .normalize("NFD") // Decompose combined characters (e.g., é -> e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove the accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars (keep letters, numbers, spaces, hyphens)
    .trim() // Remove whitespace from both ends
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};