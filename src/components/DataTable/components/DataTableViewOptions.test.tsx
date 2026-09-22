import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableViewOptions from './DataTableViewOptions';
import { Table as TanstackTable } from '@tanstack/react-table';

// Mock dependencies using shared helpers
vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
  DropdownMenu: vi.fn(({ children }) => <div data-testid="dropdown-menu">{children}</div>),
  DropdownMenuCheckboxItem: vi.fn(({ children, checked, onCheckedChange, onSelect }) => (
    <button
      type="button"
      data-testid="dropdown-menu-checkbox-item"
      data-checked={checked}
      onClick={e => {
        onSelect?.(e);
        onCheckedChange?.(!checked);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(e);
          onCheckedChange?.(!checked);
        }
      }}>
      {children}
    </button>
  )),
  DropdownMenuContent: vi.fn(({ children, align, className }) => (
    <div data-testid="dropdown-menu-content" data-align={align} className={className}>
      {children}
    </div>
  )),
  DropdownMenuLabel: vi.fn(({ children }) => <div data-testid="dropdown-menu-label">{children}</div>),
  DropdownMenuSeparator: vi.fn(() => <hr data-testid="dropdown-menu-separator" />),
  DropdownMenuTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: vi.fn(({ children, variant, size, className, 'aria-label': ariaLabel }) => (
    <button
      data-testid="view-options-button"
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}>
      {children}
    </button>
  )),
}));

describe('DataTableViewOptions component', () => {
  // Define a type for our mock columns to avoid type errors
  type MockColumn = {
    id: string;
    accessorFn?: () => void;
    getCanHide: () => boolean;
    getIsVisible: () => boolean;
    toggleVisibility: ReturnType<typeof vi.fn>;
    columnDef: { label: string };
  };

  const createMockTable = (columns: MockColumn[] = []) => {
    // Create a minimal mock that satisfies the Table interface
    const mockTable = {
      // Required properties for the Table interface
      _features: [],
      _getAllFlatColumnsById: vi.fn(),
      _getColumnDefs: vi.fn(),
      _getDefaultColumnDef: vi.fn(),
      options: { state: {} },
      getCoreRowModel: vi.fn(() => ({ rows: [] })),
      getState: vi.fn(() => ({ pagination: { pageIndex: 0, pageSize: 10 } })),
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
      getColumn: vi.fn(),
      getAllColumns: vi.fn(() => columns),
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
      getSelectedRowModel: vi.fn(() => ({ rows: [] })),
      getFilteredSelectedRowModel: vi.fn(() => ({ rows: [] })),
      resetRowSelection: vi.fn(),
      getPageCount: vi.fn(() => 1),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      getCanPreviousPage: vi.fn(() => false),
      getCanNextPage: vi.fn(() => false),
      previousPage: vi.fn(),
      nextPage: vi.fn(),
    };

    return mockTable as unknown as TanstackTable<any>;
  };

  function renderViewOptions(columns: MockColumn[] = []) {
    const mockTable = createMockTable(columns);
    return {
      mockTable,
      ...render(<DataTableViewOptions table={mockTable} />),
    };
  }

  it('renders the view options button', () => {
    renderViewOptions();

    const button = screen.getByTestId('view-options-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Show/Hide Columns');
    expect(button.ariaLabel).toBe('Toggle columns');
  });

  it('renders dropdown content with correct alignment', () => {
    renderViewOptions();

    const content = screen.getByTestId('dropdown-menu-content');
    expect(content).toBeInTheDocument();
    expect(content.dataset.align).toBe('start');
    expect(content).toHaveClass('max-h-[30rem]');
    expect(content).toHaveClass('w-[13rem]');
    expect(content).toHaveClass('overflow-y-scroll');
  });

  it('renders dropdown label and separator', () => {
    renderViewOptions();

    expect(screen.getByTestId('dropdown-menu-label')).toHaveTextContent('Toggle columns');
    expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument();
  });

  it('renders checkbox items for each hideable column', () => {
    const mockColumns = [
      {
        id: 'col1',
        accessorFn: () => {},
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: vi.fn(),
        columnDef: { label: 'Column 1' },
      },
      {
        id: 'col2',
        accessorFn: () => {},
        getCanHide: () => true,
        getIsVisible: () => false,
        toggleVisibility: vi.fn(),
        columnDef: { label: 'Column 2' },
      },
      {
        id: 'col3',
        accessorFn: () => {},
        getCanHide: () => false, // This one can't be hidden
        getIsVisible: () => true,
        toggleVisibility: vi.fn(),
        columnDef: { label: 'Column 3' },
      },
    ];

    renderViewOptions(mockColumns);

    const checkboxItems = screen.getAllByTestId('dropdown-menu-checkbox-item');
    expect(checkboxItems).toHaveLength(2); // Only 2 columns can be hidden

    expect(checkboxItems[0]).toHaveTextContent('Column 1');
    expect(checkboxItems[0].dataset.checked).toBe('true');

    expect(checkboxItems[1]).toHaveTextContent('Column 2');
    expect(checkboxItems[1].dataset.checked).toBe('false');
  });

  it('calls toggleVisibility when checkbox is clicked', () => {
    const toggleVisibility = vi.fn();
    const mockColumns = [
      {
        id: 'col1',
        accessorFn: () => {},
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility,
        columnDef: { label: 'Column 1' },
      },
    ];

    renderViewOptions(mockColumns);

    const checkboxItem = screen.getByTestId('dropdown-menu-checkbox-item');
    fireEvent.click(checkboxItem);

    expect(toggleVisibility).toHaveBeenCalledWith(false); // Toggle from true to false
  });

  it('does not render columns without accessorFn', () => {
    const mockColumns = [
      {
        id: 'col1',
        accessorFn: () => {},
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: vi.fn(),
        columnDef: { label: 'Column 1' },
      },
      {
        id: 'col2',
        // No accessorFn
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: vi.fn(),
        columnDef: { label: 'Column 2' },
      },
    ];

    renderViewOptions(mockColumns);

    const checkboxItems = screen.getAllByTestId('dropdown-menu-checkbox-item');
    expect(checkboxItems).toHaveLength(1);
    expect(checkboxItems[0]).toHaveTextContent('Column 1');
  });
});
