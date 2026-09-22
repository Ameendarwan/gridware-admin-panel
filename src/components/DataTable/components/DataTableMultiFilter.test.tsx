import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTableMultiFilter } from './DataTableMultiFilter';
import { createMockTable } from './testHelpers';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '' }),
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

vi.mock('@app/components/Separator/Separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@app/components/Select/Select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <button data-testid="select" data-value={value} onClick={() => onValueChange?.('contains')}>
      {children}
    </button>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectGroup: ({ children }: any) => <div data-testid="select-group">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock('@app/components/Input/Input', () => ({
  Input: ({ placeholder, value, onChange, className }: any) => (
    <input
      data-testid="filter-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
  DropdownMenu: vi.fn(({ children }) => <div data-testid="dropdown-menu">{children}</div>),
  DropdownMenuContent: vi.fn(({ children, align }) => (
    <div data-testid="dropdown-menu-content" data-align={align}>
      {children}
    </div>
  )),
  DropdownMenuItem: vi.fn(({ children, onClick }) => (
    <button data-testid="dropdown-menu-item" onClick={onClick}>
      {children}
    </button>
  )),
  DropdownMenuTrigger: vi.fn(({ children, asChild }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  )),
}));

vi.mock('./DataTableFacetedFilter', () => ({
  __esModule: true,
  default: vi.fn(({ _column, title, options }) => (
    <div data-testid="faceted-filter" data-title={title}>
      {options.length} options
    </div>
  )),
}));

// Define the Option type to match the expected interface
type Option = {
  label: string;
  value: string;
};

// Define the DataTableFilterOption type to match the expected interface
type DataTableFilterOption = {
  id: string;
  label: string;
  value: string;
  isMulti: boolean;
  options: Option[];
  filterOperator?: string;
  filterValues?: string[];
};

describe('DataTableMultiFilter component', () => {
  const mockOptions = [
    {
      id: 'option1',
      label: 'Name',
      value: 'name',
      isMulti: true,
      filterOperator: 'contains',
      filterValues: ['John'],
      options: [{ label: 'John', value: 'John' }],
    },
    {
      id: 'option2',
      label: 'Status',
      value: 'status',
      isMulti: true,
      filterOperator: 'equals',
      filterValues: ['active'],
      options: [{ label: 'Active', value: 'active' }],
    },
  ] as DataTableFilterOption[];

  const mockAllOptions = [
    ...mockOptions,
    {
      id: 'option3',
      label: 'Age',
      value: 'age',
      isMulti: false,
      options: [{ label: '30', value: '30' }],
    },
  ] as DataTableFilterOption[];

  // Helper function to render DataTableMultiFilter
  const renderMultiFilter = (options = mockOptions, defaultOpen = false) => {
    const mockTable = createMockTable({
      getColumn: vi.fn(id => {
        if (id === 'name' || id === 'status') {
          return {
            id,
            setFilterValue: vi.fn(),
          };
        }
        return null;
      }),
    });
    const setSelectedOptions = vi.fn();

    render(
      <DataTableMultiFilter
        table={mockTable}
        allOptions={mockAllOptions}
        options={options}
        setSelectedOptions={setSelectedOptions}
        defaultOpen={defaultOpen}
      />
    );

    return { mockTable, setSelectedOptions };
  };

  it('renders with the correct number of rules', () => {
    renderMultiFilter();

    // Use a more specific query to find the button with the rule count
    const buttons = screen.getAllByTestId('button-default');
    const triggerButton = buttons.find(button => button.textContent?.includes('rule'));
    expect(triggerButton).toBeTruthy();
    expect(triggerButton).toHaveTextContent('2 rule');
  });

  it('opens popover when trigger is clicked', () => {
    renderMultiFilter();

    const popover = screen.getByTestId('popover');
    expect(popover.dataset.open).toBe('false');

    fireEvent.click(popover);

    expect(popover.dataset.open).toBe('true');
  });

  it('renders popover content with the correct alignment', () => {
    renderMultiFilter(mockOptions, true);

    const popoverContent = screen.getByTestId('popover-content');
    expect(popoverContent).toBeInTheDocument();
    expect(popoverContent.dataset.align).toBe('start');
    expect(popoverContent).toHaveClass('w-fit');
    expect(popoverContent).toHaveClass('p-0');
  });

  it('renders a row for each filter option', () => {
    renderMultiFilter(mockOptions, true);

    // Since we don't have direct access to MultiFilterRow in our mocks,
    // we can check for elements that would be rendered for each row
    const selects = screen.getAllByTestId('select');
    expect(selects.length).toBeGreaterThanOrEqual(mockOptions.length);
  });

  it('has a delete filter button', () => {
    renderMultiFilter(mockOptions, true);

    const deleteButton = screen.getByTestId('button-delete-filter');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent('Delete filter');
  });

  it('removes multi filters when delete button is clicked', () => {
    const { setSelectedOptions } = renderMultiFilter(mockOptions, true);

    const deleteButton = screen.getByTestId('button-delete-filter');
    fireEvent.click(deleteButton);

    expect(setSelectedOptions).toHaveBeenCalled();
    // Check that the callback would filter out multi filters
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback(mockAllOptions);
    expect(result).toEqual([mockAllOptions[2]]); // Only the non-multi option should remain
  });

  it('opens with defaultOpen=true', () => {
    renderMultiFilter(mockOptions, true);

    const popover = screen.getByTestId('popover');
    expect(popover.dataset.open).toBe('true');
  });
});
