/**
 * Parses CSV content into an array of objects.
 * Handles quoted fields and different delimiters (comma or semicolon).
 * @param {string} csvText - The raw CSV string.
 * @returns {Array<Object>} - Array of parsed objects.
 */
export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Detect delimiter (checking first line)
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  // Parse headers
  // We need a robust splitter that handles quotes
  const splitLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const headers = splitLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    // Skip empty lines
    if (!currentLine.trim()) continue;
    
    const values = splitLine(currentLine);
    
    // Ensure we don't process malformed lines that are significantly shorter than headers
    // (though sometimes CSVs drop trailing empty columns)
    if (values.length > 0) {
      const entry = {};
      headers.forEach((header, index) => {
        // Clean value: remove surrounding quotes if present
        let val = values[index] ? values[index].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        entry[header] = val;
      });
      data.push(entry);
    }
  }

  return data;
}