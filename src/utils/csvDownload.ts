/**
 * Converts JSON data to CSV format and triggers download
 * @param data - Array of objects to convert to CSV
 * @param filename - Name of the file to download (without extension)
 * @param headers - Optional custom headers mapping
 * @param options - Optional configuration for CSV generation
 */
export function downloadCSV(
  data: any[],
  filename: string,
  headers?: { [key: string]: string },
  options?: {
    forceTextFormat?: boolean; // Forces all values to be treated as text in Excel/Sheets
    defaultHeaders?: string[]; // Default headers to use when data is empty
  }
) {
  let csvContent: string;

  if (!data || data.length === 0) {
    // If no data but default headers provided, create CSV with just headers
    if (options?.defaultHeaders && options.defaultHeaders.length > 0) {
      csvContent = options.defaultHeaders.join(',');
    } else if (headers && Object.keys(headers).length > 0) {
      // Use the values from headers mapping as column headers
      csvContent = Object.values(headers).join(',');
    } else {
      console.warn('No data and no headers provided for CSV export');
      // Still create an empty file
      csvContent = '';
    }
  } else {
    // Get all unique keys from the data
    const keys = Object.keys(data[0]);

    // Create header row
    const headerRow = keys.map(key => headers?.[key] ?? key).join(',');

    // Create data rows
    const dataRows = data.map(item => {
      return keys
        .map(key => {
          const value = item[key];
          // Handle null/undefined
          if (value === null || value === undefined) {
            return '';
          }

          // Force text format by prepending with '=' and wrapping in quotes
          // This tells Excel/Sheets to treat the value as text and align left
          if (options?.forceTextFormat && value !== '') {
            return `"=""${String(value).replaceAll('"', '""')}"""`;
          }

          // Handle strings that might contain commas or quotes
          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replaceAll('"', '""')}"`;
            }
            return value;
          }
          return value;
        })
        .join(',');
    });

    // Combine header and data rows
    csvContent = [headerRow, ...dataRows].join('\n');
  }

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
