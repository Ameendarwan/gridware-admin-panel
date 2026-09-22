import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableFacetedFilter from './DataTableFacetedFilter';
import { Column, ColumnDef } from '@tanstack/react-table';

// Mock React Router hooks
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/test', search: '' };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock DeferredFilterContext
vi.mock('@app/components/DataTable/contexts/DeferredFilterContext', () => ({
  useDeferredFilter: () => ({
    deferFilters: false,
    pendingParams: null,
    setPendingParams: vi.fn(),
    hasPendingChanges: false,
    setHasPendingChanges: vi.fn(),
    applyFilters: vi.fn(),
    cancelFilters: vi.fn(),
    updatePendingFilter: vi.fn(),
  }),
}));

// Mock DataTable utils
vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  createQueryString: vi.fn(() => 'mocked-query-string'),
}));

// Mock dependencies
vi.mock('@app/components/Popover/Popover', () => ({
  Popover: vi.fn(({ children }) => <div data-testid="popover">{children}</div>),
  PopoverContent: vi.fn(({ children, className, align }) => (
    <div data-testid="popover-content" className={className} data-align={align}>
      {children}
    </div>
  )),
  PopoverTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: vi.fn(({ children, variant, size, className }) => (
    <button data-testid="filter-button" data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  )),
}));

vi.mock('@app/components/Separator/Separator', () => ({
  Separator: vi.fn(({ orientation, className }) => (
    <div data-testid="separator" data-orientation={orientation} className={className}></div>
  )),
}));

vi.mock('@app/components/Badge/Badge', () => ({
  Badge: vi.fn(({ children, variant, className }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )),
}));

vi.mock('@app/components/Command/Command', () => ({
  Command: vi.fn(({ children }) => <div data-testid="command">{children}</div>),
  CommandEmpty: vi.fn(({ children }) => <div data-testid="command-empty">{children}</div>),
  CommandGroup: vi.fn(({ children }) => <div data-testid="command-group">{children}</div>),
  CommandInput: vi.fn(({ placeholder }) => <input data-testid="command-input" placeholder={placeholder} />),
  CommandItem: vi.fn(({ children, onSelect }) => (
    <button data-testid="command-item" onClick={onSelect} type="button">
      {children}
    </button>
  )),
  CommandList: vi.fn(({ children }) => <div data-testid="command-list">{children}</div>),
  CommandSeparator: vi.fn(() => <hr data-testid="command-separator" />),
}));

vi.mock('lucide-react', () => ({
  CheckIcon: vi.fn(({ className }) => <span data-testid="check-icon" className={className}></span>),
}));

// Create a fully typed mock Column factory function
function createMockColumn<TData = unknown, TValue = unknown>(
  overridesOrFilterValue: Partial<Column<TData, TValue>> | any[] = {}
): Column<TData, TValue> {
  // Determine if the first argument is a filter value array or overrides object
  const isFilterValueArray = Array.isArray(overridesOrFilterValue);
  const filterValue = isFilterValueArray ? overridesOrFilterValue : [];
  const overrides = isFilterValueArray ? {} : overridesOrFilterValue;

  const mockColumn: Column<TData, TValue> = {
    id: 'mockColumn',
    accessorFn: undefined,
    columnDef: {} as ColumnDef<TData, TValue>,
    columns: [],
    depth: 0,
    getFlatColumns: () => [],
    getLeafColumns: () => [],
    getIsVisible: () => true,
    getCanPin: () => false,
    pin: () => {},
    getFilterIndex: () => -1,
    getCanGlobalFilter: () => false,
    clearSorting: () => {},
    getIsPinned: () => false,
    getCanSort: () => false,
    getCanFilter: () => true,
    getCanHide: () => false,
    getCanResize: () => false,
    getIsSorted: () => false,
    getSortIndex: () => 0,
    toggleSorting: vi.fn(),
    getToggleSortingHandler: () => (() => {}) as any,
    getIsGrouped: () => false,
    getGroupedIndex: () => 0,
    getCanGroup: () => false,
    toggleGrouping: () => {},
    getToggleGroupingHandler: () => (() => {}) as any,
    getSize: () => 0,
    getStart: () => 0,
    resetSize: () => {},
    getIsLastColumn: () => false,
    getIsFirstColumn: () => false,
    getPinnedIndex: () => 0,
    getAfter: () => 0,
    getIndex: () => 0,
    getCanMultiSort: () => false,
    getIsResizing: () => false,
    toggleVisibility: vi.fn(),
    getToggleVisibilityHandler: () => (() => {}) as any,
    getFilterValue: vi.fn(() => filterValue),
    setFilterValue: vi.fn(),
    getFacetedUniqueValues: vi.fn(
      () =>
        new Map([
          ['option1', 5],
          ['option2', 3],
          ['option3', 7],
        ])
    ),
    getFacetedMinMaxValues: () => [0, 10] as any,
    getFilterFn: () => undefined,
    getAutoFilterFn: () => undefined,
    getFacetedRowModel: () => ({ rows: [], rowsById: {}, flatRows: [] }),
    getIsFiltered: () => false,
    getAutoSortingFn: () => undefined as any,
    getSortingFn: () => undefined as any,
    getFirstSortDir: () => undefined as any,
    getNextSortingOrder: () => undefined as any,
    getAutoSortDir: () => 'asc',
    getAggregationFn: () => undefined,
    getAutoAggregationFn: () => undefined,
    ...overrides,
  };

  return mockColumn;
}

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

describe('DataTableFacetedFilter component', () => {
  it('renders with title and no selected values', () => {
    const mockColumn = createMockColumn();

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    expect(screen.getByTestId('filter-button')).toHaveTextContent('Test Filter');
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('renders with selected values (less than 3)', () => {
    const mockColumn = createMockColumn(['option1', 'option2']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    // In test environment, we're seeing the mobile view which shows the count
    expect(badges[0]).toHaveTextContent('2');
  });

  it('renders with selected values (3 or more)', () => {
    const mockColumn = createMockColumn(['option1', 'option2', 'option3']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[1]).toHaveTextContent('3 selected');
  });

  it('renders popover content with command input', () => {
    const mockColumn = createMockColumn();

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByTestId('command-input')).toHaveAttribute('placeholder', 'Test Filter');
  });

  it('renders command items for each option', () => {
    const mockColumn = createMockColumn();

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const commandItems = screen.getAllByTestId('command-item');
    expect(commandItems).toHaveLength(3);
    expect(commandItems[0]).toHaveTextContent('Option 1');
    expect(commandItems[1]).toHaveTextContent('Option 2');
    expect(commandItems[2]).toHaveTextContent('Option 3');
  });

  it('adds value to filter when unselected option is clicked', () => {
    const mockColumn = createMockColumn(['option1']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const commandItems = screen.getAllByTestId('command-item');
    fireEvent.click(commandItems[1]); // Click "Option 2"

    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('removes value from filter when selected option is clicked', () => {
    const mockColumn = createMockColumn(['option1', 'option2']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const commandItems = screen.getAllByTestId('command-item');
    fireEvent.click(commandItems[0]); // Click "Option 1" which is already selected

    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(['option2']);
  });

  it('sets filter to undefined when last value is removed', () => {
    const mockColumn = createMockColumn(['option1']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    const commandItems = screen.getAllByTestId('command-item');
    fireEvent.click(commandItems[0]); // Click "Option 1" which is the only selected option

    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);
  });

  it('renders option count when withCount is true', () => {
    const mockColumn = createMockColumn();
    const optionsWithCount = mockOptions.map(option => ({ ...option, withCount: true }));

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={optionsWithCount} />);

    const commandItems = screen.getAllByTestId('command-item');
    expect(commandItems[0]).toHaveTextContent('5'); // Count for option1
    expect(commandItems[1]).toHaveTextContent('3'); // Count for option2
    expect(commandItems[2]).toHaveTextContent('7'); // Count for option3
  });

  it('clears filters and navigates when clear filters is clicked', () => {
    const mockColumn = createMockColumn(['option1', 'option2']);

    render(<DataTableFacetedFilter column={mockColumn} title="Test Filter" options={mockOptions} />);

    // Find and click the "Clear filters" button
    const clearButton = screen.getByText('Clear filters');
    fireEvent.click(clearButton);

    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);
    expect(mockNavigate).toHaveBeenCalledWith('/test?mocked-query-string', { replace: true });
  });
});
