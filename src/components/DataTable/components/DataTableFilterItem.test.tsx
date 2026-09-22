import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableFilterItem from './DataTableFilterItem';
import { DataTableFilterOption } from '@app/components/DataTable/DataTable.types';
import { createMockTable } from './testHelpers';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test', search: '' }),
}));

vi.mock('@app/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@app/components/Popover/Popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <button data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {children}
    </button>
  ),
  PopoverContent: ({ children, className, align }: any) => (
    <div data-testid="popover-content" className={className} data-align={align}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: any) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, variant, size, className, onClick, 'aria-label': ariaLabel }: any) => {
    const testId = ariaLabel ? 'button-' + ariaLabel.toLowerCase().replaceAll(/\s+/g, '-') : 'button-default';
    return (
      <button data-testid={testId} data-variant={variant} data-size={size} className={className} onClick={onClick}>
        {children}
      </button>
    );
  },
}));

vi.mock('@app/components/Select/Select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <button data-testid="select" data-value={value} onClick={() => onValueChange?.('contains')}>
      {children}
    </button>
  ),
  SelectContent: ({ children, side }: any) => (
    <div data-testid="select-content" data-side={side}>
      {children}
    </div>
  ),
  SelectGroup: ({ children }: any) => <div data-testid="select-group">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock('@app/components/Input/Input', () => ({
  Input: ({ placeholder, value, onChange, className, type }: any) => (
    <input
      data-testid={`input-${type || 'text'}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      type={type}
    />
  ),
}));

vi.mock('./DataTableAdvancedFacetedFilter', () => ({
  __esModule: true,
  default: vi.fn(({ _column, title, options, selectedValues, setSelectedValues }) => (
    <button
      data-testid="advanced-faceted-filter"
      data-title={title}
      data-selected-count={selectedValues.size}
      onClick={() => {
        const newValues = new Set(selectedValues);
        if (newValues.has('test-value')) {
          newValues.delete('test-value');
        } else {
          newValues.add('test-value');
        }
        setSelectedValues(newValues);
      }}>
      {options.length} options
    </button>
  )),
}));

describe('DataTableFilterItem component', () => {
  // Mock window.location
  const originalLocation = globalThis.location;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { search: '', pathname: '/test' },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  // Helper function to render DataTableFilterItem with common setup
  const renderFilterItem = (selectedOption: DataTableFilterOption<any>, defaultOpen = false) => {
    const mockTable = createMockTable({
      getColumn: vi.fn(id => {
        if (id === 'name' || id === 'status' || id === 'age' || id === 'created_at') {
          let type: string;
          if (id === 'age') {
            type = 'number';
          } else if (id === 'created_at') {
            type = 'date';
          } else {
            type = 'string';
          }

          const label = id === 'created_at' ? 'Created At' : id.charAt(0).toUpperCase() + id.slice(1);

          return {
            id,
            columnDef: {
              type,
              label,
            },
            setFilterValue: vi.fn(),
          };
        }
        return null;
      }),
    });
    const setSelectedOptions = vi.fn();

    render(
      <DataTableFilterItem
        table={mockTable}
        selectedOption={selectedOption}
        selectedOptions={[selectedOption]}
        setSelectedOptions={setSelectedOptions}
        defaultOpen={defaultOpen}
      />
    );

    return { mockTable, setSelectedOptions };
  };

  // Helper function to create a filter option
  const createFilterOption = (overrides: Partial<DataTableFilterOption<any>>): DataTableFilterOption<any> => ({
    id: 'option1',
    label: 'Name',
    value: 'name',
    options: [],
    filterOperator: 'contains',
    filterValues: ['John'],
    ...overrides,
  });

  // Test cases for different filter types

  it('renders string filter with contains operator', () => {
    const selectedOption = createFilterOption({
      filterOperator: 'contains',
      filterValues: ['John'],
    });

    renderFilterItem(selectedOption, false);

    const filterButton = screen.getByTestId('button-default');
    expect(filterButton).toHaveTextContent('Name: John');

    const popover = screen.getByTestId('popover');
    expect(popover.dataset.open).toBe('false');

    fireEvent.click(popover);
    expect(popover.dataset.open).toBe('true');

    const input = screen.getByTestId('input-text');
    expect(input).toHaveValue('John');
  });

  it('renders number filter with between operator', () => {
    const selectedOption = createFilterOption({
      id: 'option2',
      label: 'Age',
      value: 'age',
      filterOperator: 'between',
      filterValues: ['18', '65'],
    });

    renderFilterItem(selectedOption, true);

    const filterButton = screen.getByTestId('button-default');
    expect(filterButton).toHaveTextContent('Age: 18 - 65');

    const inputs = screen.getAllByTestId('input-number');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue(18);
    expect(inputs[1]).toHaveValue(65);
  });

  it('renders date filter with equals operator', () => {
    const selectedOption = createFilterOption({
      id: 'option3',
      label: 'Created At',
      value: 'created_at',
      filterOperator: 'equals',
      filterValues: ['2023-01-01T12:00:00+00:00'],
    });

    renderFilterItem(selectedOption, true);

    const filterButton = screen.getByTestId('button-default');
    expect(filterButton).toHaveTextContent('Created At: 2023-01-01 12:00');

    const dateInput = screen.getByTestId('input-date');
    const timeInput = screen.getByTestId('input-time');

    expect(dateInput).toHaveValue('2023-01-01');
    expect(timeInput).toHaveValue('12:00');
  });

  it('renders filter with options as faceted filter', () => {
    const selectedOption = createFilterOption({
      id: 'option4',
      label: 'Status',
      value: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      filterOperator: 'in',
      filterValues: ['active'],
    });

    renderFilterItem(selectedOption, true);

    const filterButton = screen.getByTestId('button-default');
    expect(filterButton).toHaveTextContent('Status: Active');

    const facetedFilter = screen.getByTestId('advanced-faceted-filter');
    expect(facetedFilter).toBeInTheDocument();
    expect(facetedFilter.dataset.title).toBe('Status');
  });

  it('removes filter when delete button is clicked', () => {
    const selectedOption = createFilterOption({
      filterOperator: 'contains',
      filterValues: ['John'],
    });

    const { setSelectedOptions } = renderFilterItem(selectedOption, true);

    const deleteButton = screen.getByTestId('button-remove-filter');
    fireEvent.click(deleteButton);

    expect(setSelectedOptions).toHaveBeenCalled();
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback([selectedOption]);
    expect(result).toEqual([]);
  });

  it('updates operator when select is changed', () => {
    const selectedOption = createFilterOption({
      filterOperator: 'equals',
      filterValues: ['John'],
    });

    renderFilterItem(selectedOption, true);

    const select = screen.getByTestId('select');
    fireEvent.click(select);

    const filterButton = screen.getByTestId('button-default');
    expect(filterButton).toHaveTextContent('Name: John');
  });

  it('opens with defaultOpen=true', () => {
    const selectedOption = createFilterOption({
      filterOperator: 'contains',
      filterValues: ['John'],
    });

    renderFilterItem(selectedOption, true);

    const popover = screen.getByTestId('popover');
    expect(popover.dataset.open).toBe('true');
  });
});
