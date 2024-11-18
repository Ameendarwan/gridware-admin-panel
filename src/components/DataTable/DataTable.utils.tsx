import { Column, ColumnDef, Row, Table } from '@tanstack/react-table';
import { Checkbox } from '@app/components/Checkbox/Checkbox';
import DataTableColumnHeader from '@app/components/DataTable/components/DataTableColumnHeader';

export function getCommonPinningStyles<TData>({ column }: { column: Column<TData> }): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-5px 0 5px -5px hsl(var(--border)) inset'
      : isFirstRightPinnedColumn
        ? '5px 0 5px -5px hsl(var(--border)) inset'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? 'sticky' : 'relative',
    background: isPinned ? 'hsl(var(--background))' : undefined,
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

export function exportTableToCSV<TData>(
  /**
   * The table to export.
   * @type Table<TData>
   */
  table: Table<TData>,
  opts: {
    /**
     * The filename for the CSV file.
     * @default "table"
     * @example "tasks"
     */
    filename?: string;
    /**
     * The columns to exclude from the CSV file.
     * @default []
     * @example ["select", "actions"]
     */
    excludeColumns?: (keyof TData | 'select' | 'actions')[];

    /**
     * Whether to export only the selected rows.
     * @default false
     */
    onlySelected?: boolean;
  } = {}
): void {
  const { filename = 'table', excludeColumns = [], onlySelected = false } = opts;

  // Retrieve headers (column names)
  const headers = table
    .getAllLeafColumns()
    .map(column => column.id)
    .filter(id => !excludeColumns.includes(id as keyof TData));

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...(onlySelected ? table.getFilteredSelectedRowModel().rows : table.getRowModel().rows).map(row =>
      headers
        .map(header => {
          const cellValue = row.getValue(header);
          // Handle values that might contain commas or newlines
          return typeof cellValue === 'string' ? `"${cellValue.replace(/"/g, '""')}"` : cellValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create a Blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDate(date: Date | string | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: opts.month ?? 'long',
    day: opts.day ?? 'numeric',
    year: opts.year ?? 'numeric',
    ...opts,
  }).format(new Date(date));
}

export const createQueryString = (params: Record<string, string | number | null>) => {
  const newSearchParams = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
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
          return { filter: column.accessorKey, value: filterValue, operator };
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
    onCheckedChange={value => onChange(row, !!value)}
    aria-label={ariaLabel}
    className="translate-y-0.5"
  />
);

export const TextCell = ({
  row,
  accessorKey,
  transform,
}: {
  row: any;
  accessorKey: string;
  transform?: (value: any) => string;
}) => {
  const value = row.getValue(accessorKey);
  return (
    <div className="flex items-center">
      <span className="capitalize">{transform ? transform(value) : value}</span>
    </div>
  );
};

export type ExtendedColumnDef<TData> = ColumnDef<TData> & {
  accessorKey?: string;
  label?: string;
};

export const filterFnByIncludes = (row: any, id: string, value: any[]) =>
  Array.isArray(value) && value.includes(row.getValue(id));

export const createColumn = <TData,>(
  accessorKey: string,
  label: string,
  cellRenderer: (props: any) => JSX.Element,
  options?: Partial<ExtendedColumnDef<TData>>
): ExtendedColumnDef<TData> => ({
  accessorKey,
  label,
  header: ({ column }) => <DataTableColumnHeader column={column} title={label} />,
  cell: cellRenderer,
  ...options,
});

export const getCommonColumns = (): ExtendedColumnDef<any>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <CheckboxCell row={row} onChange={(row, value) => row.toggleSelected(value)} ariaLabel="Select row" />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title={'Actions'} />,
      cell: () => (
        <span className="flex items-center gap-x-2">
          <span className="group relative cursor-pointer text-[#5283ED]" title="View">
            <i className="fa-solid fa-eye" />
          </span>
          <span className="group relative cursor-pointer text-[#5283ED]" title="Edit">
            <i className="fa-solid fa-pen-to-square" />
          </span>
          <span className="group relative cursor-pointer text-[#5283ED]" title="Delete">
            <i className="fa-solid fa-trash-can" />
          </span>
          <span className="group relative cursor-pointer text-[#5283ED]" title="Export">
            <i className="fa-solid fa-file-export" />
          </span>
          <span className="group relative cursor-pointer text-[#5283ED]" title="Map">
            <i className="fa-solid fa-map" />
          </span>
        </span>
      ),
    },
  ];
};
