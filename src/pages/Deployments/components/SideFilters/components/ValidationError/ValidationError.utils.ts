import { format } from 'date-fns';
import * as XLSX from 'xlsx-js-style';

export const HIGHLIGHT_WORDS = [
  'upstream_pole',
  'upstream_device',
  'none',
  'transformer',
  'secondary_fuse',
  'primary_riser',
  'transmission_riser',
  'riser_fuse',
  'riser_switch',
  'capacitor_bank',
  'cap_bank_fuse',
  'fuse',
  'switch',
  'recloser',
  'phase_count',
  'secondary_upstream_pole label',
  'phase_count',
  'line_count',
  'disconnected',
];

export const exportSerialNumbers = (serialNumbers: number[], fileName?: string) => {
  // Step 1: Convert array into worksheet data
  const data = serialNumbers.map(num => ({ 'Serial Number': num }));

  // Step 2: Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Optional: Apply header style
  worksheet['A1'].s = {
    font: { bold: true },
    alignment: { horizontal: 'center' },
    fill: { fgColor: { rgb: 'FFFF00' } },
  };

  // Step 3: Create a workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Serials');

  // Step 4: Export to file
  XLSX.writeFile(workbook, `${format(new Date(), 'yyyy-MM-dd')}-${fileName}.xlsx`);
};
