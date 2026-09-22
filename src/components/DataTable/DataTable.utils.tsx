import * as XLSX from 'xlsx-js-style';

import { Column, ColumnDef, Row, RowModel, Table } from '@tanstack/react-table';
import { NavigateFunction, SetURLSearchParams } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { API } from '@app/lib/api-config';
import { Button } from '@app/components/Button/Button';
import { CSSProperties } from 'react';
import { Checkbox } from '@app/components/Checkbox/Checkbox';
import ConfirmationDialog from '@app/components/ConfirmationDialog/ConfirmationDialog';
import DataTableColumnHeader from '@app/components/DataTable/components/DataTableColumnHeader';
import { HideColumns, Option } from './DataTable.types';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import Papa from 'papaparse';
import SVGIcon from '../SVGIcon';
import { toast } from 'sonner';
import RetryButton from './components/RetryButton';
import MarkComplete from './components/MarkComplete';

export function getCommonPinningStyles<TData>({ column }: { column: Column<TData> }): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

  let boxShadow: string | undefined;
  if (isLastLeftPinnedColumn) {
    boxShadow = '-5px 0 5px -5px hsl(var(--border)) inset';
  } else if (isFirstRightPinnedColumn) {
    boxShadow = '5px 0 5px -5px hsl(var(--border)) inset';
  }

  return {
    boxShadow,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? 'sticky' : 'relative',
    background: isPinned ? 'hsl(var(--background))' : undefined,
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

type ExportOptions<TData> = {
  filename?: string;
  excludeColumns?: (keyof TData)[];
};

type Header = {
  id: string;
  label: string;
};

function prepareTableData<TData>(
  table: Table<TData>,
  excludeColumns: (keyof TData)[]
): {
  headers: Header[];
  rows: Record<string, unknown>[];
} {
  const headers = table
    .getAllLeafColumns()
    .map(column => ({
      id: column.id,
      label: (column.columnDef as ExtendedColumnDef<TData>).label || column.id,
    }))
    .filter(header => !excludeColumns.includes(header.id as keyof TData));
  const rows =
    table.getFilteredSelectedRowModel().rows.length > 0
      ? table.getFilteredSelectedRowModel().rows
      : table.getRowModel().rows;

  return {
    headers,
    rows: rows.map(row =>
      headers.reduce(
        (acc, header) => {
          acc[header.id] = row.getValue(header.id);
          return acc;
        },
        {} as Record<string, unknown>
      )
    ),
  };
}

export function exportTableToCSV<TData>(
  table: Table<TData>,
  opts: ExportOptions<TData> & { columnMappings?: Record<string, string> } = {}
): void {
  const { filename = 'table', excludeColumns = [], columnMappings = {} } = opts;
  const { headers, rows } = prepareTableData(table, excludeColumns);
  const csvData = [
    headers.map(header => header.label),
    ...rows.map(row =>
      headers.map(header => {
        const value = row[header.id];
        let processedValue;
        if (columnMappings[header.id]) {
          const key = columnMappings[header.id];
          if (Array.isArray(value)) {
            // Extract mapped property from each object in the array
            processedValue = value
              .map(item => (item && typeof item === 'object' ? (item[key] ?? '') : ''))
              .filter(Boolean)
              .join(', ');
          } else if (value && typeof value === 'object') {
            // Extract mapped property from a single object
            // @ts-ignore
            processedValue = value[key] ?? '';
          }
        } else if (typeof value === 'object' && value !== null) {
          // Default: Stringify objects that are not mapped
          processedValue = JSON.stringify(value);
        } else {
          // Default handling for primitives
          processedValue = value ?? '';
        }
        return processedValue;
      })
    ),
  ];

  const csv = Papa.unparse(csvData, { quotes: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportTableToExcel<TData>(
  table: Table<TData>,
  opts: ExportOptions<TData> & { columnMappings?: Record<string, string> } = {}
): void {
  const { filename = 'table', excludeColumns = [], columnMappings = {} } = opts;
  const { headers, rows } = prepareTableData(table, excludeColumns);

  const excelData = [
    headers.map(header => ({
      v: header.label,
      t: 's',
      s: {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' } },
        alignment: { horizontal: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      },
    })),
    ...rows.map(row =>
      headers.map(header => {
        const value = row[header.id];
        let processedValue;
        if (columnMappings[header.id]) {
          const key = columnMappings[header.id];
          if (Array.isArray(value)) {
            processedValue = value
              .map(item => (item && typeof item === 'object' ? (item[key] ?? '') : ''))
              .filter(Boolean)
              .join(', ');
          } else if (value && typeof value === 'object') {
            // @ts-ignore
            processedValue = value[key] ?? '';
          }
        } else if (typeof value === 'object' && value !== null) {
          processedValue = JSON.stringify(value);
        } else {
          processedValue = value ?? '';
        }

        return {
          v: processedValue,
          t: 's',
          s: {
            alignment: { wrapText: true },
          },
        };
      })
    ),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  // Adjust column width dynamically based on max content length
  worksheet['!cols'] = headers.map(header => {
    const maxContentLength = Math.max(
      header.label.length,
      ...rows.map(row => (row[header.id] ? String(row[header.id]).length : 0))
    );
    return { wch: Math.min(Math.max(10, maxContentLength), 50) };
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function printTable<TData>(
  table: Table<TData>,
  opts: {
    excludeColumns?: (keyof TData)[];
    title?: string;
    columnMappings?: Record<string, string>;
  } = {}
): void {
  const { excludeColumns = [], title = 'Table Print', columnMappings = {} } = opts;
  const headers = table
    .getAllLeafColumns()
    .map(column => ({ id: column.id, label: (column.columnDef as ExtendedColumnDef<TData>).label || column.id }))
    .filter(header => !excludeColumns.includes(header.id as keyof TData));

  const rows =
    table.getFilteredSelectedRowModel().rows.length > 0
      ? table.getFilteredSelectedRowModel().rows
      : table.getRowModel().rows;

  const htmlContent = `
    <html lang="en">
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            max-width: 200px;
            word-wrap: break-word;
          }
          th {
            background-color: #f4f4f4;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                row => `
                <tr>
                  ${headers
                    .map(header => {
                      const value = row.getValue(header.id);
                      let processedValue;
                      if (columnMappings[header.id]) {
                        const key = columnMappings[header.id];
                        if (Array.isArray(value)) {
                          processedValue = value
                            .map(item => (item && typeof item === 'object' ? (item[key] ?? '') : ''))
                            .filter(Boolean)
                            .join(', ');
                        } else if (value && typeof value === 'object') {
                          // @ts-ignore
                          processedValue = value[key] ?? '';
                        }
                      } else if (typeof value === 'object' && value !== null) {
                        processedValue = JSON.stringify(value);
                      } else {
                        processedValue = value ?? '';
                      }
                      return `<td>${processedValue}</td>`;
                    })
                    .join('')}
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = globalThis.open('', '_blank');
  if (printWindow) {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    printWindow.location.href = url;
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
        URL.revokeObjectURL(url);
      };
    };
  }
}

export function formatDate(date: Date | string | number) {
  try {
    if (date === null || date === undefined || date === '') {
      return '';
    }
    let validDate;
    if (typeof date === 'string') {
      const cleanedDate = date.includes('.') ? date.split('.')[0] : date;
      validDate = parseISO(cleanedDate);
    } else {
      validDate = new Date(date);
    }

    if (Number.isNaN(validDate.getTime())) {
      return '';
    }

    let formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    };

    // Calculate browser timezone offeset in seconds.
    const userOffset = new Date().getTimezoneOffset() * 60 * 1000;
    let localDate = new Date(validDate.getTime() - userOffset);
    return localDate.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.log('date format error: ', error);
    return '';
  }
}

export function formatDateUtc(date: Date | string | number) {
  if (!date) {
    return '';
  }
  let validDate;
  if (typeof date === 'string') {
    const cleanedDate = date.includes('.') ? date.split('.')[0] : date;
    validDate = parseISO(cleanedDate);
  } else {
    validDate = new Date(date);
  }

  if (Number.isNaN(validDate.getTime())) {
    return '';
  }

  return validDate.toUTCString();
}

export const createQueryString = (params: Record<string, string | number | null>) => {
  const newSearchParams = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      newSearchParams.set(key, String(value));
    } else {
      newSearchParams.delete(key);
    }
  }
  return newSearchParams.toString();
};

export const getFilters = (columns: ExtendedColumnDef<any>[], searchParams: URLSearchParams) => {
  return columns
    .map(column => {
      if (column.accessorKey) {
        const value = searchParams.get(column.accessorKey);
        if (value) {
          const [filterValue, operator] = value.split('~');

          // Handle different operator types
          if (['between', 'not_between'].includes(operator) && filterValue.includes('|')) {
            const [startDate, endDate] = filterValue.split('|');
            // Return dates as they are (already formatted as ISO strings)
            return {
              [column.accessorKey]: {
                [operator]: [startDate, endDate],
              },
            };
          } else if (['is_true', 'is_false'].includes(operator)) {
            return {
              [column.accessorKey]: {
                [operator]: true,
              },
            };
          } else if (['is_null', 'is_not_null'].includes(operator)) {
            return {
              [column.accessorKey]: {
                [operator]: '',
              },
            };
          } else {
            // For date filters and other types, use the provided value
            return {
              [column.accessorKey]: {
                [operator]: filterValue,
              },
            };
          }
        }
      }
      return null;
    })
    .filter(Boolean);
};

interface CheckboxCellProps<TData> {
  row: Row<TData>;
  onChange: (row: Row<TData>, value: boolean) => void;
  ariaLabel: string;
}

export const CheckboxCell = <TData,>({ row, onChange, ariaLabel }: CheckboxCellProps<TData>) => (
  <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={value => onChange(row, Boolean(value))}
    aria-label={ariaLabel}
    className="translate-y-0.5"
  />
);

export const TextCell = ({
  row,
  accessorKey,
  transform,
  tooltipTransform,
}: {
  row: any;
  accessorKey: string;
  transform?: (value: any) => string;
  tooltipTransform?: (value: any) => string;
}) => {
  const value = row.getValue(accessorKey);
  return (
    <div className="flex items-center">
      <span title={tooltipTransform ? tooltipTransform(value) : undefined}>{transform ? transform(value) : value}</span>
    </div>
  );
};

export type ExtendedColumnDef<TData> = ColumnDef<TData> & {
  accessorKey?: string;
  label?: string;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  excludeFilter?: boolean;
  hide?: boolean;
  options?: Option[];
  excludeQuickFilter?: boolean;
  singleSelect?: boolean;
};

export const filterFnByIncludes = (row: any, id: string, value: any[]) =>
  Array.isArray(value) && value.includes(row.getValue(id));

export const createColumn = <TData,>(
  accessorKey: string,
  label: string,
  cellRenderer: (props: any) => JSX.Element,
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array',
  options?: Partial<ExtendedColumnDef<TData>>
): ExtendedColumnDef<TData> => ({
  accessorKey,
  label,
  type: type ?? 'string',
  header: ({ column }) => <DataTableColumnHeader column={column} title={label} hide={options?.hide} />,
  cell: cellRenderer,
  ...options,
});

interface DeleteModalProps {
  id?: string;
  url?: string;
  setSearchParams?: SetURLSearchParams;
  selectedRowIds?: number[];
}

const urlMapping: Record<string, string> = {
  user: '/user/bulk',
  pole: '/pole/bulk',
  span: '/span/bulk',
  edge: '/edge/bulk-delete',
  circuit: '/circuit/bulk',
  csv: '/csv/bulk',
  deployment: '/deployment',
  device: '/device',
  customer: '/customer',
};

const colMapping: Record<string, string> = {
  user: 'user_ids',
  pole: 'pole_ids',
  span: 'span_ids',
  edge: 'edge_ids',
  circuit: 'circuit_ids',
  csv: 'csv_ids',
};

export const deleteHandler = async ({ id, url, setSearchParams, selectedRowIds }: DeleteModalProps) => {
  try {
    if (!url) throw new Error('URL is required for deletion.');

    const resourceKey = Object.keys(urlMapping).find(key => url.includes(key));
    if (!resourceKey) throw new Error('Invalid resource type in URL.');
    const deleteUrl = urlMapping[resourceKey];
    const deleteCol = colMapping[resourceKey];

    // Special handling for edge resource - use POST with edge_ids only
    if (resourceKey === 'edge' && (selectedRowIds?.length || deleteCol)) {
      await API.post(deleteUrl, {
        edge_ids: selectedRowIds ?? [id],
      });
    } else {
      // Standard DELETE logic for other resources
      selectedRowIds?.length || deleteCol
        ? await API.delete(deleteUrl, {
            params: { [deleteCol]: selectedRowIds ?? [id] },
            paramsSerializer: params => {
              const searchParams = new URLSearchParams();
              if (Array.isArray(params[deleteCol])) {
                for (const id of params[deleteCol]) {
                  searchParams.append(deleteCol, id);
                }
              }
              return searchParams.toString();
            },
          })
        : await API.delete(`${deleteUrl}/${id}`);
    }

    setSearchParams?.(() => {
      const updatedParams = new URLSearchParams(globalThis.location.search);
      updatedParams.set('delete_id', id ?? selectedRowIds?.join(',') ?? '');
      return updatedParams;
    });
    toast.success('Record deleted successfully');
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' && url?.includes('edge')) {
      toast.error('Limit reached for bulk spans deletion. Please try with fewer spans.');
      return;
    }
    console.error('Error during delete operation:', error);
    toast.error(error?.response?.data?.detail ?? 'Error deleting record');
  }
};

interface CommonColumnsProps {
  navigate: NavigateFunction;
  url?: string;
  navigateToMap?: boolean;
  hideColumns?: HideColumns;
  handlePoleView?: (deploymentId: number) => void;
  setSearchParams?: SetURLSearchParams;
  handleExport?: (deploymentId: number, deploymentName?: string) => void;
  selectedRows?: RowModel<any>;
}

export const getCommonColumns = ({
  url,
  navigateToMap,
  hideColumns,
  handlePoleView,
  handleExport,
  setSearchParams,
}: CommonColumnsProps): ExtendedColumnDef<any>[] => {
  return [
    ...(hideColumns?.hideMultiSelect
      ? []
      : [
          {
            id: 'select',
            header: ({ table }: { table: Table<any> }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={value => table.toggleAllPageRowsSelected(Boolean(value))}
                aria-label="Select all"
                className="translate-y-0.5"
              />
            ),
            cell: ({ row }: { row: Row<any> }) => (
              <CheckboxCell row={row} onChange={(row, value) => row.toggleSelected(value)} ariaLabel="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
          },
        ]),
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title={'Actions'} />,
      cell: ({ row }) => (
        <span className="flex items-center gap-x-2">
          {!hideColumns?.hideView && (
            <button
              type="button"
              className="group relative cursor-pointer text-accent bg-transparent border-none p-0"
              title="View"
              aria-label={`View ${row?.original?.name || 'item'}`}
              onClick={() => {
                const link = navigateToMap
                  ? `/deployments/map/${row.getValue('deployment_id')}?mode=${MapMode.POLEVIEW}&pole_id=${row.getValue('id')}`
                  : `${url}/${row.getValue('id')}/view`;

                globalThis.open(link, '_blank'); // Opens the link in a new tab
              }}>
              <i className="fa-solid fa-eye" />
            </button>
          )}
          {!hideColumns?.hideEdit && (
            <button
              type="button"
              className="group relative cursor-pointer text-accent bg-transparent border-none p-0"
              title="Edit"
              aria-label={`Edit ${row?.original?.name || 'item'}`}
              onClick={() => {
                const link = navigateToMap
                  ? `/deployments/map/${row.getValue('deployment_id')}?mode=${MapMode.POLEEDIT}&pole_id=${row.getValue('id')}`
                  : `${url}/${row.getValue('id')}/edit`;
                globalThis.open(link, '_blank'); // Opens the link in a new tab
              }}>
              <i className="fa-solid fa-pen-to-square" />
            </button>
          )}
          {!hideColumns?.hideDelete && (
            <ConfirmationDialog
              description={
                url?.includes('customer')
                  ? 'Are you sure you want to DELETE this customer?” This will REMOVE it from all existing deployments associated with this customer.'
                  : 'Are you sure you want to delete this item?'
              }
              triggerComponent={
                <span className="group relative cursor-pointer text-accent" title="Delete">
                  <i className="fa-solid fa-trash-can" />
                </span>
              }
              confirmationComponent={
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded bg-redShades-shade1"
                  onClick={async () =>
                    await deleteHandler({
                      id: row.getValue('id'),
                      url,
                      setSearchParams,
                    })
                  }>
                  Yes, delete
                </Button>
              }
            />
          )}
          {!hideColumns?.hideMarkComplete && (
            <MarkComplete
              id={row.getValue('id')}
              isCompleted={row.getValue('is_completed')}
              setSearchParams={setSearchParams}
            />
          )}
          {!hideColumns?.hideRetry && (
            <RetryButton
              id={row.getValue('id')}
              isCompleted={row.getValue('is_completed')}
              dataType={row.getValue('data_type')}
              setSearchParams={setSearchParams}
            />
          )}
          {!hideColumns?.hideMap && (
            <button
              type="button"
              className="group relative cursor-pointer text-accent bg-transparent border-none p-0"
              title="Map"
              onClick={() => handlePoleView?.(row?.original?.id)}
              aria-label={`View map for ${row?.original?.name || 'item'}`}>
              <SVGIcon icon="map-view" color="fill-accent" width={16} height={15} />
            </button>
          )}
          {!hideColumns?.hideExport && (
            <ConfirmationDialog
              description="Do you wish to export the deployment data?"
              triggerComponent={
                <span className="group relative cursor-pointer text-accent" title="Export">
                  <i className="fa-solid fa-file-export" />
                </span>
              }
              confirmationComponent={
                <Button
                  type="button"
                  loading={false}
                  className="rounded bg-greenShades-shade1"
                  onClick={() => handleExport?.(row?.original?.id, row?.original?.name)}>
                  Yes, proceed
                </Button>
              }
            />
          )}
        </span>
      ),
    },
  ];
};

interface FetchDataParams {
  url: string;
  limit: number;
  skip: number;
  where?: string | null;
  order_by?: string;
  filters?: FilterItem[];
}

interface FilterItem {
  [key: string]: FilterValue;
}

interface FilterValue {
  contains?: string;
  between?: string[];
  not_between?: string[];
  [key: string]: any;
}

// Helper function to process comma-separated contains values
const processContainsFilter = (key: string, value: string): FilterItem[] => {
  const parts = value.split(',').map(part => part.trim());
  return parts.map(part => ({
    [key]: { contains: part }
  }));
};

// Helper function to process date range filters
const processDateRangeFilter = (key: string, operator: string, value: string): FilterItem => {
  const [startDate, endDate] = value.split('|').map(part => part.trim());
  return {
    [key]: {
      [operator]: [startDate, endDate]
    }
  };
};

// Helper function to get the logical operator from URL
const getLogicalOperator = (): string => {
  const urlParams = new URLSearchParams(globalThis.location.search);
  return urlParams.get('logical_operator') || 'and';
};

// Helper function to process a single filter
const processFilter = (filter: FilterItem): FilterItem[] => {
  const filterEntry = Object.entries(filter)[0];
  if (!filterEntry) return [];

  const [key, valueObj] = filterEntry;
  const operator = Object.keys(valueObj)[0];
  const value = valueObj[operator];

  // Handle comma-separated contains values
  if (operator === 'contains' && typeof value === 'string' && value.includes(',')) {
    return processContainsFilter(key, value);
  }

  // Handle date range filters
  if ((operator === 'between' || operator === 'not_between') &&
      typeof value === 'string' && value.includes('|')) {
    return [processDateRangeFilter(key, operator, value)];
  }

  // Return filter as-is for other cases
  return [filter];
};

const buildSearchParams = (params: FetchDataParams) => {
  const searchParams = new URLSearchParams({
    skip: params.skip.toString(),
    limit: params.limit.toString(),
  });

  if (params.where) {
    searchParams.append('where', params.where);
  }

  if (params.filters && params.filters.length > 0) {
    // Process all filters
    const newFilters = params.filters.flatMap(processFilter);

    // Create the JSON filter with the specified logical operator
    const logicalOperator = getLogicalOperator();
    const filtersJson = JSON.stringify({ [logicalOperator]: newFilters });
    searchParams.append('where', filtersJson);
  }

  if (params.order_by) {
    searchParams.append('order_by', params.order_by);
  }

  return searchParams;
};

export const fetchTableData = async ({ url, limit, skip, where, order_by, filters }: FetchDataParams) => {
  const params = buildSearchParams({ url, limit, skip, where, order_by, filters });
  try {
    const response = await API.get(`${url}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
