import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column, ColumnDef, RowData } from '@tanstack/react-table';
import DataTableAdvancedFacetedFilter from './DataTableAdvancedFacetedFilter';
import { DataTableFilterOption } from '@app/components/DataTable/DataTable.types';

// Mock dependencies
vi.mock('@app/components/Command/Command', () => ({
  Command: vi.fn(({ children, className }) => (
    <div data-testid="command" className={className}>
      {children}
    </div>
  )),
  CommandEmpty: vi.fn(({ children }) => <div data-testid="command-empty">{children}</div>),
  CommandGroup: vi.fn(({ children, className }) => (
    <div data-testid="command-group" className={className}>
      {children}
    </div>
  )),
  CommandInput: vi.fn(({ placeholder, className, autoFocus }) => (
    <input data-testid="command-input" placeholder={placeholder} className={className} autoFocus={autoFocus} />
  )),
  CommandItem: vi.fn(({ children, onSelect, className }) => (
    <button data-testid="command-item" className={className} onClick={onSelect} type="button">
      {children}
    </button>
  )),
  CommandList: vi.fn(({ children }) => <div data-testid="command-list">{children}</div>),
  CommandSeparator: vi.fn(() => <hr data-testid="command-separator" />),
}));

vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Create a factory function to generate a fully typed mock Column object
function createMockColumn<TData extends RowData = any, TValue = any>(
  overrides?: Partial<Column<TData, TValue>>
): Column<TData, TValue> {
  return {
    id: 'status',
    depth: 0,
    columnDef: {} as ColumnDef<TData, TValue>,
    columns: [],
    getFlatColumns: () => [],
    getLeafColumns: () => [],
    getIsVisible: () => true,
    getCanPin: () => false,
    pin: () => {},
    getFilterIndex: () => -1,
    getCanGlobalFilter: () => false,
    clearSorting: () => {},
    getCanSort: () => false,
    getCanFilter: () => true,
    getCanHide: () => false,
    getCanResize: () => false,
    getCanMultiSort: () => false,
    getPinnedIndex: () => -1,
    getIsPinned: () => false,
    getSortIndex: () => -1,
    getIsSorted: () => false,
    toggleSorting: vi.fn(),
    getToggleSortingHandler: () => (() => {}) as any,
    getFilterValue: () => undefined,
    setFilterValue: vi.fn(),
    getAutoFilterFn: () => undefined,
    getFilterFn: () => undefined,
    getFacetedRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
    getFacetedUniqueValues: vi.fn(
      () =>
        new Map([
          ['option1', 5],
          ['option2', 3],
        ])
    ),
    getFacetedMinMaxValues: () => undefined as any,
    getIsFiltered: () => false,
    getAutoSortingFn: () => undefined as any,
    getSortingFn: () => undefined as any,
    toggleVisibility: vi.fn(),
    getToggleVisibilityHandler: () => (() => {}) as any,
    getIsGrouped: () => false,
    getGroupedIndex: () => -1,
    getFirstSortDir: () => undefined as any,
    getNextSortingOrder: () => undefined as any,
    getCanGroup: () => false,
    getToggleGroupingHandler: () => (() => {}) as any,
    getAutoSortDir: () => 'asc',
    getIsLastColumn: () => false,
    ...overrides,
  } as Column<TData, TValue>;
}

describe('DataTableAdvancedFacetedFilter component', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1', withCount: true },
    { label: 'Option 2', value: 'option2', withCount: true },
    { label: 'Option 3', value: 'option3', withCount: false },
  ];

  const renderFilter = (selectedValues: Set<string> = new Set<string>()) => {
    const mockColumn = createMockColumn();
    const setSelectedOptions = vi.fn();

    return {
      mockColumn,
      setSelectedOptions,
      ...render(
        <DataTableAdvancedFacetedFilter
          column={mockColumn}
          title="Filter Status"
          options={mockOptions}
          selectedValues={selectedValues}
          setSelectedOptions={setSelectedOptions}
        />
      ),
    };
  };

  it('renders with the correct title in input placeholder', () => {
    renderFilter();

    const input = screen.getByTestId('command-input');
    expect(input).toHaveAttribute('placeholder', 'Filter Status');
  });

  it('renders all options as command items', () => {
    renderFilter();

    // Check that all options are rendered
    const commandItems = screen.getAllByTestId('command-item');
    expect(commandItems.length).toBe(3); // 3 options

    // Check option content
    expect(commandItems[0]).toHaveTextContent('Option 1');
    expect(commandItems[1]).toHaveTextContent('Option 2');
    expect(commandItems[2]).toHaveTextContent('Option 3');
  });

  it('displays counts for options with withCount=true', () => {
    renderFilter();

    const commandItems = screen.getAllByTestId('command-item');

    // Option 1 and 2 have withCount=true and should display counts
    expect(commandItems[0]).toHaveTextContent('5'); // Count from getFacetedUniqueValues
    expect(commandItems[1]).toHaveTextContent('3'); // Count from getFacetedUniqueValues
  });

  it('adds value to selectedValues when unselected option is clicked', () => {
    const mockColumn = createMockColumn();
    const selectedValues = new Set<string>();
    const setSelectedOptions = vi.fn();

    render(
      <DataTableAdvancedFacetedFilter
        column={mockColumn}
        title="Filter Status"
        options={mockOptions}
        selectedValues={selectedValues}
        setSelectedOptions={setSelectedOptions}
      />
    );

    const commandItems = screen.getAllByTestId('command-item');

    // Click on the first option
    fireEvent.click(commandItems[0]);

    // Check that column.setFilterValue was called with the selected value
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(['option1']);

    // Check that setSelectedOptions was called with updated options
    expect(setSelectedOptions).toHaveBeenCalled();
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback([
      {
        id: 'status-filter',
        label: 'Status',
        value: 'status',
        options: [],
        filterValues: [],
      } as DataTableFilterOption<any>,
    ]);
    expect(result[0].filterValues).toEqual(['option1']);
  });

  it('removes value from selectedValues when selected option is clicked', () => {
    const mockColumn = createMockColumn();
    const selectedValues = new Set<string>(['option1']);
    const setSelectedOptions = vi.fn();

    render(
      <DataTableAdvancedFacetedFilter
        column={mockColumn}
        title="Filter Status"
        options={mockOptions}
        selectedValues={selectedValues}
        setSelectedOptions={setSelectedOptions}
      />
    );

    const commandItems = screen.getAllByTestId('command-item');

    // Click on the first option (which is already selected)
    fireEvent.click(commandItems[0]);

    // Check that column.setFilterValue was called with undefined (no filters)
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);

    // Check that setSelectedOptions was called with updated options
    expect(setSelectedOptions).toHaveBeenCalled();
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback([
      {
        id: 'status-filter',
        label: 'Status',
        value: 'status',
        options: [],
        filterValues: ['option1'],
      } as DataTableFilterOption<any>,
    ]);
    expect(result[0].filterValues).toEqual([]);
  });

  it('shows clear filters option when values are selected', () => {
    const mockColumn = createMockColumn();
    const selectedValues = new Set<string>(['option1', 'option2']);
    const setSelectedOptions = vi.fn();

    render(
      <DataTableAdvancedFacetedFilter
        column={mockColumn}
        title="Filter Status"
        options={mockOptions}
        selectedValues={selectedValues}
        setSelectedOptions={setSelectedOptions}
      />
    );

    // Check that separator and clear filters option are shown
    expect(screen.getByTestId('command-separator')).toBeInTheDocument();

    const commandItems = screen.getAllByTestId('command-item');
    const clearFiltersItem = commandItems.at(-1);
    expect(clearFiltersItem).toHaveTextContent('Clear filters');

    // Click on clear filters
    if (clearFiltersItem) {
      fireEvent.click(clearFiltersItem);
    }

    // Check that column.setFilterValue was called with undefined
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith(undefined);

    // Check that setSelectedOptions was called with empty filter values
    expect(setSelectedOptions).toHaveBeenCalled();
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback([
      {
        id: 'status-filter',
        label: 'Status',
        value: 'status',
        options: [],
        filterValues: ['option1', 'option2'],
      } as DataTableFilterOption<any>,
    ]);
    expect(result[0].filterValues).toEqual([]);
  });

  it('does not show clear filters option when no values are selected', () => {
    const mockColumn = createMockColumn();
    const selectedValues = new Set<string>();
    const setSelectedOptions = vi.fn();

    render(
      <DataTableAdvancedFacetedFilter
        column={mockColumn}
        title="Filter Status"
        options={mockOptions}
        selectedValues={selectedValues}
        setSelectedOptions={setSelectedOptions}
      />
    );

    // Check that separator and clear filters option are not shown
    expect(screen.queryByTestId('command-separator')).not.toBeInTheDocument();

    const commandItems = screen.getAllByTestId('command-item');
    for (const item of commandItems) {
      expect(item).not.toHaveTextContent('Clear filters');
    }
  });

  it('displays empty state when no options are provided', () => {
    const mockColumn = createMockColumn();
    const selectedValues = new Set<string>();
    const setSelectedOptions = vi.fn();

    render(
      <DataTableAdvancedFacetedFilter
        column={mockColumn}
        title="Filter Status"
        options={[]}
        selectedValues={selectedValues}
        setSelectedOptions={setSelectedOptions}
      />
    );

    expect(screen.getByTestId('command-empty')).toHaveTextContent('No results found.');
  });
});
