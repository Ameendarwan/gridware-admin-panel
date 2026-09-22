import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataTable from './DataTable';
import { createColumnHelper, Table as TanstackTable } from '@tanstack/react-table';

// Mock the dependencies
vi.mock('@app/components/Table/Table', () => ({
  Table: vi.fn(({ children }) => <table data-testid="table">{children}</table>),
  TableBody: vi.fn(({ children }) => <tbody data-testid="table-body">{children}</tbody>),
  TableCell: vi.fn(({ children, colSpan }) => (
    <td data-testid="table-cell" colSpan={colSpan}>
      {children}
    </td>
  )),
  TableHead: vi.fn(({ children }) => <th data-testid="table-head">{children}</th>),
  TableHeader: vi.fn(({ children, className }) => (
    <thead data-testid="table-header" className={className}>
      {children}
    </thead>
  )),
  TableRow: vi.fn(({ children, 'data-state': dataState }) => (
    <tr data-testid="table-row" data-state={dataState}>
      {children}
    </tr>
  )),
}));

vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  getCommonPinningStyles: vi.fn(() => ({})),
}));

vi.mock('@app/components/DataTable/components/DataTablePagination', () => ({
  default: vi.fn(({ _table, totalRows }) => (
    <div data-testid="data-table-pagination" data-total-rows={totalRows}>
      Pagination Component
    </div>
  )),
}));

vi.mock('@app/components/Loader/Loader', () => ({
  default: vi.fn(() => <div data-testid="loader">Loading...</div>),
}));

// Mock flexRender
vi.mock('@tanstack/react-table', async () => {
  const actual = await vi.importActual('@tanstack/react-table');
  return {
    ...actual,
    flexRender: vi.fn((component, props) => {
      if (typeof component === 'function') {
        return component(props);
      }
      return component;
    }),
  };
});

// Test data and setup
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

const data: Person[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    age: 25,
  },
];

describe('DataTable component', () => {
  const columnHelper = createColumnHelper<Person>();

  // For tests, we'll simplify the column definitions to avoid using getValue
  const columns = [
    columnHelper.accessor('firstName', {
      header: 'First Name',
      // Use a simple string instead of a function that calls getValue
      cell: 'First Name Cell',
    }),
    columnHelper.accessor('lastName', {
      header: 'Last Name',
      cell: 'Last Name Cell',
    }),
    columnHelper.accessor('age', {
      header: 'Age',
      cell: 'Age Cell',
    }),
  ];

  // Create a type for our mock options to help TypeScript understand the properties
  interface MockTableOptions {
    emptyData?: boolean;
    selectedRows?: any[];
    getRowModel?: () => { rows: any[]; flatRows?: any[]; rowsById?: Record<string, any> };
    getFilteredSelectedRowModel?: () => { rows: any[]; flatRows?: any[]; rowsById?: Record<string, any> };
    [key: string]: any;
  }

  // Helper functions to reduce nesting
  const createHeaderGroups = () => [
    {
      id: 'headerGroup_1',
      headers: columns.map((col, i) => ({
        id: `header_${i}`,
        column: {
          id: `col_${i}`,
          columnDef: {
            header: col.header,
          },
        },
        colSpan: 1,
        getContext: () => ({}),
        isPlaceholder: false,
      })),
    },
  ];

  const createRowModel = (emptyData?: boolean) => ({
    rows: emptyData
      ? []
      : data.map((d, i) => ({
          id: d.id,
          original: d,
          index: i,
          depth: 0,
          parentId: null,
          getIsSelected: () => false,
          getVisibleCells: () => createVisibleCells(d),
        })),
    flatRows: [],
    rowsById: {},
  });

  const createVisibleCells = (d: Person) =>
    columns.map((col, j) => ({
      id: `${d.id}_${j}`,
      column: {
        id: `col_${j}`,
        columnDef: {
          header: col.header,
          cell: col.cell,
        },
      },
      getContext: () => ({}),
    }));

  const createColumns = () =>
    columns.map((col, i) => ({
      id: `col_${i}`,
      getIsVisible: () => true,
    }));

  const createPaginationState = () => ({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  });

  const createFilteredSelectedRowModel = (selectedRows?: any[]) => ({
    rows: selectedRows || [],
    flatRows: [],
    rowsById: {},
  });

  const setupTable = (options: MockTableOptions = {}) => {
    // Create a minimal mock that satisfies the DataTable component's requirements
    const mockTable = {
      // Header groups for rendering the table header
      getHeaderGroups: createHeaderGroups,

      // Row model for rendering table rows
      getRowModel: options.getRowModel || (() => createRowModel(options.emptyData)),

      // Column information
      getAllColumns: createColumns,

      // Pagination state and methods
      getState: createPaginationState,
      getPageCount: () => 1,
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      getCanPreviousPage: () => false,
      getCanNextPage: () => false,
      previousPage: vi.fn(),
      nextPage: vi.fn(),

      // Selection state
      getFilteredSelectedRowModel:
        options.getFilteredSelectedRowModel || (() => createFilteredSelectedRowModel(options.selectedRows)),
      resetRowSelection: vi.fn(),

      // Override with any custom options
      ...options,
    };

    return mockTable as unknown as TanstackTable<any>;
  };

  it('renders the DataTable with data', () => {
    const table = setupTable();
    render(<DataTable table={table} />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getAllByTestId('table-row').length).toBe(data.length + 1); // +1 for header row
  });

  it('renders loading state correctly', () => {
    const table = setupTable();
    render(<DataTable table={table} loading={true} />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    const table = setupTable({
      getRowModel: () => ({
        rows: [],
        flatRows: [],
        rowsById: {},
      }),
    });
    render(<DataTable table={table} />);

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('renders pagination with total rows', () => {
    const table = setupTable();
    render(<DataTable table={table} totalRows={100} />);

    const pagination = screen.getByTestId('data-table-pagination');
    expect(pagination).toBeInTheDocument();
    expect(pagination.dataset.totalRows).toBe('100');
  });

  it('renders floating bar when rows are selected', () => {
    const table = setupTable({
      getFilteredSelectedRowModel: () => ({
        rows: [{ id: '1' }],
        flatRows: [],
        rowsById: {},
      }),
    });

    render(<DataTable table={table} floatingBar={<div data-testid="floating-bar">Selected Actions</div>} />);

    expect(screen.getByTestId('floating-bar')).toBeInTheDocument();
  });

  it('does not render floating bar when no rows are selected', () => {
    const table = setupTable();

    render(<DataTable table={table} floatingBar={<div data-testid="floating-bar">Selected Actions</div>} />);

    expect(screen.queryByTestId('floating-bar')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const table = setupTable();
    const { container } = render(<DataTable table={table} className="custom-class" />);

    // The custom class is applied to the outermost div
    // Find the first div in the container and check if it has the custom class
    const dataTableDiv = container.firstChild as HTMLElement;
    expect(dataTableDiv).toHaveClass('custom-class');
  });
});
