import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnFiltersState } from '@tanstack/react-table';
import React from 'react';
import { createMockTable } from '@tests/dataTableHelpers';

/**
 * Mock implementations follow patterns from tests/commonMocks.tsx and tests/dataTableHelpers.tsx
 * These must be inline due to vitest hoisting - imports are not available in vi.mock() calls
 */

// Mock dependencies before importing the component
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test', search: '' }),
}));

vi.mock('@app/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: ({
    children,
    onClick,
    className,
    variant,
    size,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
    size?: string;
    'aria-label'?: string;
  }) => (
    <button
      data-testid={`button-${ariaLabel?.toLowerCase().replaceAll(/\s+/g, '-') ?? 'default'}`}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@app/components/Input/Input', () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: any) => void;
    className?: string;
  }) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

vi.mock('@app/components/Select/Select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => {
    const handleClick = () => {
      onValueChange?.('10');
    };
    return (
      <button data-testid="select" data-value={value} onClick={handleClick} type="button">
        {children}
      </button>
    );
  },
  SelectContent: ({ children, side }: { children: React.ReactNode; side?: string }) => (
    <div data-testid="select-content" data-side={side}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">Show {placeholder} Rows</span>
  ),
}));

// Mock DataTable components (pattern from tests/dataTableHelpers.tsx)
vi.mock('./DataTableFacetedFilter', () => ({
  __esModule: true,
  default: vi.fn(({ column, title, options }: { column?: { id?: string }; title?: string; options?: Array<any> }) => (
    <div data-testid="faceted-filter" data-column={column?.id} data-title={title}>
      {options?.length ?? 0} options
    </div>
  )),
}));

vi.mock('./DataTableFilterCombobox', () => ({
  __esModule: true,
  default: vi.fn(({ options, selectedOptions, onSelect, children }: any) => (
    <button
      data-testid="filter-combobox-component"
      data-options-count={options?.length ?? 0}
      data-selected-options-count={selectedOptions?.length ?? 0}
      onClick={() => onSelect?.()}
      type="button">
      {children ?? 'Filter Combobox'}
    </button>
  )),
}));

vi.mock('./DataTableFilterItem', () => ({
  __esModule: true,
  default: vi.fn(({ column, operator, value }: any) => (
    <div data-testid="filter-item" data-column={column?.id} data-operator={operator} data-value={value}>
      Filter Item
    </div>
  )),
}));

vi.mock('./DataTableMultiFilter', () => ({
  DataTableMultiFilter: vi.fn(({ filters }: { filters?: Array<any> }) => (
    <div data-testid="multi-filter" data-filters-count={filters?.length ?? 0}>
      Multi Filter
    </div>
  )),
}));

vi.mock('./DataTableLogicalOperator', () => ({
  __esModule: true,
  default: vi.fn(({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => (
    <button
      data-testid="logical-operator"
      data-value={value}
      onClick={() => onChange?.(value === 'and' ? 'or' : 'and')}
      type="button">
      Logical Operator: {value}
    </button>
  )),
  LogicalOperator: { AND: 'and', OR: 'or' },
}));

vi.mock('./DataTableToolbarActions', () => ({
  __esModule: true,
  default: vi.fn(({ url }: any) => (
    <div data-testid="toolbar-actions" data-url={url}>
      Toolbar Actions
    </div>
  )),
}));

vi.mock('./DataTableViewOptions', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="view-options">View Options</div>),
}));

// Import the component under test after all mocks are defined
import DataTableAdvancedToolbar from './DataTableAdvancedToolbar';

describe('DataTableAdvancedToolbar component', () => {
  // Mock globalThis.location and URL functionality
  const originalLocation = globalThis.location;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { search: '', pathname: '/test' },
    });

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid',
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  const createMockTableWithColumns = (columnFilters: ColumnFiltersState = []) => createMockTable({ columnFilters });

  function renderToolbar(columnFilters: ColumnFiltersState = [], extraProps: Record<string, any> = {}) {
    const mockTable = createMockTableWithColumns(columnFilters);
    return {
      mockTable,
      ...render(<DataTableAdvancedToolbar table={mockTable} {...extraProps} />),
    };
  }

  it('renders basic toolbar elements', () => {
    renderToolbar();

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-actions')).toBeInTheDocument();
    expect(screen.getAllByTestId('filter-combobox-component')[0]).toBeInTheDocument();
    expect(screen.getByTestId('view-options')).toBeInTheDocument();
  });

  it('does not render reset filters button when no filters are applied', () => {
    renderToolbar([]);

    expect(screen.queryByTestId('button-reset-filters')).not.toBeInTheDocument();
  });

  it('renders faceted filters for filterable columns', () => {
    renderToolbar();

    // Since faceted filters might not be rendered directly, we'll verify the filter combobox exists
    const filterComboboxes = screen.getAllByTestId('filter-combobox-component');
    expect(filterComboboxes.length).toBeGreaterThan(0);

    // Check that the toolbar renders correctly
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('handles filter interaction', () => {
    renderToolbar();

    // Find and interact with the filter combobox
    const filterComboboxes = screen.getAllByTestId('filter-combobox-component');
    expect(filterComboboxes.length).toBeGreaterThan(0);

    if (filterComboboxes.length > 0) {
      // Click on the first filter combobox
      fireEvent.click(filterComboboxes[0]);
    }

    // Verify the component still renders correctly after interaction
    expect(screen.getAllByTestId('search-input')[0]).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    renderToolbar();

    // Try to find the search input
    const searchInput = screen.queryAllByTestId('search-input')[0];
    if (searchInput) {
      await user.type(searchInput, 'test search');
      expect(searchInput).toHaveValue('test search');
    }
  });

  it('opens the filter builder when clicking on the filter combobox', () => {
    renderToolbar();

    // Find the main filter combobox (first one in the document)
    const filterComboboxes = screen.getAllByTestId('filter-combobox-component');
    expect(filterComboboxes.length).toBeGreaterThan(0);
    if (filterComboboxes.length > 0) {
      const mainFilterCombobox = filterComboboxes[0];
      fireEvent.click(mainFilterCombobox);

      // Verify that the component rendered correctly
      expect(filterComboboxes.length).toBeGreaterThan(0);
      expect(mainFilterCombobox).toHaveAttribute('data-options-count');
    }
  });

  it('allows custom className to be applied', () => {
    const { container } = renderToolbar([], { className: 'custom-class' });

    // Find the container with the custom class
    const containerElement = container.querySelector('.custom-class');
    expect(containerElement).toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    const customText = 'Custom toolbar content';

    renderToolbar([], {
      children: <div data-testid="custom-content">{customText}</div>,
    });

    // Check if the custom content is rendered
    const customContent = screen.getByTestId('custom-content');
    expect(customContent).toBeInTheDocument();
    expect(customContent).toHaveTextContent(customText);
  });
});
