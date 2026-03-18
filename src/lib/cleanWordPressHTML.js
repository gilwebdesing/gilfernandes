/**
 * Cleans WordPress-specific HTML comments and tags from content.
 * @param {string} html - The raw HTML content from WordPress export.
 * @returns {string} - Cleaned text content.
 */
export function cleanWordPressHTML(html) {
  if (!html) return '';

  let clean = html;

  // 1. Remove WordPress block comments (e.g., <!-- wp:paragraph -->, <!-- /wp:paragraph -->)
  clean = clean.replace(/<!--\s*\/?wp:.*?-->/g, '');

  // 2. Remove standard HTML comments
  clean = clean.replace(/<!--.*?-->/g, '');

  // 3. Remove HTML tags but keep line breaks for structure if needed, or just strip them.
  // For a description field, we might want to keep some formatting or just plain text.
  // Let's strip tags for a clean plain text description, or maybe convert <p> and <br> to newlines.
  
  // Replace <br>, <br/>, <p>, </div> with newlines to preserve some structure
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  clean = clean.replace(/<\/p>/gi, '\n\n');
  clean = clean.replace(/<\/div>/gi, '\n');
  
  // Remove all remaining HTML tags
  clean = clean.replace(/<[^>]+>/g, '');

  // 4. Decode HTML entities (basic ones)
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '-',
    '&#8212;': '—'
  };
  
  clean = clean.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);

  // 5. Remove extra whitespace
  // Replace multiple newlines with a max of 2
  clean = clean.replace(/\n\s*\n\s*\n/g, '\n\n');
  // Trim start and end
  clean = clean.trim();

  return clean;
}