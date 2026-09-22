import React from 'react';
import { vi } from 'vitest';
import type { Table, ColumnFiltersState } from '@tanstack/react-table';

/**
 * DataTable-specific test helpers to reduce code duplication
 */

// Create a minimal mock table implementation
export const createMockTable = (
  options: {
    columnFilters?: ColumnFiltersState;
    selectedRows?: Array<{ id: string; original: { id: number } }>;
    columns?: Array<any>;
    pageSize?: number;
  } = {}
) => {
  const {
    columnFilters = [],
    selectedRows = [],
    columns = [
      { columnDef: { accessorKey: 'name', label: 'Name' } },
      {
        columnDef: {
          accessorKey: 'status',
          label: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      },
      { columnDef: { accessorKey: 'created_at', label: 'Created At', excludeFilter: true } },
    ],
    pageSize = 10,
  } = options;

  const mockTable = {
    getAllColumns: vi.fn(() => columns),
    getState: vi.fn(() => ({
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
      columnVisibility: {},
      columnOrder: [],
      columnPinning: { left: [], right: [] },
      rowPinning: { top: [], bottom: [] },
      globalFilter: '',
      sorting: [],
      columnSizing: {},
      columnSizingInfo: {
        startOffset: null,
        startSize: null,
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false as const,
        columnSizingStart: [],
      },
      expanded: {},
      grouping: [],
      rowSelection: {},
    })),
    setColumnFilters: vi.fn(),
    setGlobalFilter: vi.fn(),
    getColumn: vi.fn(id => {
      if (id === 'status') {
        return {
          id: 'status',
          getFilterValue: vi.fn(() => undefined),
          setFilterValue: vi.fn(),
        };
      }
      return null;
    }),
    resetColumnFilters: vi.fn(),
    setPageSize: vi.fn(),
    options: { state: { pagination: { pageSize } } },
    getCoreRowModel: vi.fn(() => ({ rows: [] })),
    getRowModel: vi.fn(() => ({ rows: [] })),
    getPaginationRowModel: vi.fn(() => ({ rows: [] })),
    getFilteredRowModel: vi.fn(() => ({ rows: [] })),
    getSortedRowModel: vi.fn(() => ({ rows: [] })),
    getGroupedRowModel: vi.fn(() => ({ rows: [] })),
    getExpandedRowModel: vi.fn(() => ({ rows: [] })),
    getPreFilteredRowModel: vi.fn(() => ({ rows: [] })),
    getPrePaginationRowModel: vi.fn(() => ({ rows: [] })),
    getPreSortedRowModel: vi.fn(() => ({ rows: [] })),
    setOptions: vi.fn(),
    reset: vi.fn(),
    getAllFlatColumns: vi.fn(() => []),
    getAllLeafColumns: vi.fn(() => []),
    getVisibleFlatColumns: vi.fn(() => []),
    getVisibleLeafColumns: vi.fn(() => []),
    getLeftVisibleLeafColumns: vi.fn(() => []),
    getRightVisibleLeafColumns: vi.fn(() => []),
    getCenterVisibleLeafColumns: vi.fn(() => []),
    getHeaderGroups: vi.fn(() => []),
    getFooterGroups: vi.fn(() => []),
    getFlatHeaders: vi.fn(() => []),
    getLeafHeaders: vi.fn(() => []),
    getRow: vi.fn(),
    getPageCount: vi.fn(() => 5),
    getFilteredSelectedRowModel: vi.fn(() => ({ rows: [] })),
    getSelectedRowModel: vi.fn(() => ({ rows: selectedRows })),
    resetRowSelection: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    getCanPreviousPage: vi.fn(() => true),
    getCanNextPage: vi.fn(() => true),
  };

  return mockTable as unknown as Table<any>;
};

// Mock DataTable component factories
export const createDataTableComponentMocks = () => ({
  DataTableFacetedFilter: vi.fn(
    ({ column, title, options }: { column?: { id?: string }; title?: string; options?: Array<any> }) => (
      <div data-testid="faceted-filter" data-column={column?.id} data-title={title}>
        {options?.length ?? 0} options
      </div>
    )
  ),
  DataTableFilterCombobox: vi.fn(({ options, selectedOptions, onSelect, children }: any) => (
    <button
      data-testid="filter-combobox-component"
      data-options-count={options?.length ?? 0}
      data-selected-options-count={selectedOptions?.length ?? 0}
      onClick={() => onSelect?.()}
      type="button">
      {children ?? 'Filter Combobox'}
    </button>
  )),
  DataTableFilterItem: vi.fn(({ column, operator, value }: any) => (
    <div data-testid="filter-item" data-column={column?.id} data-operator={operator} data-value={value}>
      Filter Item
    </div>
  )),
  DataTableMultiFilter: vi.fn(({ filters }: { filters?: Array<any> }) => (
    <div data-testid="multi-filter" data-filters-count={filters?.length ?? 0}>
      Multi Filter
    </div>
  )),
  DataTableLogicalOperator: vi.fn(({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => (
    <button
      data-testid="logical-operator"
      data-value={value}
      onClick={() => onChange?.(value === 'and' ? 'or' : 'and')}
      type="button">
      Logical Operator: {value}
    </button>
  )),
  DataTableToolbarActions: vi.fn(({ url }: { table?: Table<any>; url?: string }) => (
    <div data-testid="toolbar-actions" data-url={url}>
      Toolbar Actions
    </div>
  )),
  DataTableViewOptions: vi.fn((_props: { table?: Table<any> }) => <div data-testid="view-options">View Options</div>),
});

// Mock hooks commonly used in DataTable tests
export const createDataTableMockHooks = () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test', search: '' }),
  useDebounce: (value: any) => value,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
});
