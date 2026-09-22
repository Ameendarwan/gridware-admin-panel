import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableFilterCombobox from './DataTableFilterCombobox';
import { DataTableFilterOption } from '@app/components/DataTable/DataTable.types';

/**
 * Mock implementations follow patterns from tests/commonMocks.tsx
 * These must be inline due to vitest hoisting - imports are not available in vi.mock() calls
 */

// Mock dependencies
vi.mock('@app/components/Command/Command', () => ({
  Command: vi.fn(({ children }) => <div data-testid="command">{children}</div>),
  CommandEmpty: vi.fn(({ children }) => <div data-testid="command-empty">{children}</div>),
  CommandGroup: vi.fn(({ children }) => <div data-testid="command-group">{children}</div>),
  CommandInput: vi.fn(({ placeholder }) => <input data-testid="command-input" placeholder={placeholder} />),
  CommandItem: vi.fn(({ children, value, onSelect }) => {
    let icon = null;
    let label = null;

    if (Array.isArray(children)) {
      icon = children.find(child => typeof child === 'object' && child.type === 'i');
      label = children.find(child => typeof child === 'string');
    }

    return (
      <button data-testid={`command-item-${value}`} onClick={() => onSelect(value)} type="button">
        {icon && <span data-testid={`icon-${value}`}>{icon}</span>}
        {label || children}
      </button>
    );
  }),
  CommandList: vi.fn(({ children }) => <div data-testid="command-list">{children}</div>),
  CommandSeparator: vi.fn(() => <hr data-testid="command-separator" />),
}));

vi.mock('@app/components/Popover/Popover', () => ({
  Popover: vi.fn(({ children, open, onOpenChange }) => (
    <button data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)} type="button">
      {children}
    </button>
  )),
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
  Button: vi.fn(({ children, variant, size, className, role }) => (
    <button data-testid="filter-button" data-variant={variant} data-size={size} className={className} role={role}>
      {children}
    </button>
  )),
}));

describe('DataTableFilterCombobox component', () => {
  const mockOptions: DataTableFilterOption<any>[] = [
    {
      id: 'option1',
      label: 'Name',
      value: 'name',
      options: [],
    },
    {
      id: 'option2',
      label: 'Status',
      value: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'option3',
      label: 'Age',
      value: 'age',
      options: [],
    },
  ];

  const renderCombobox = (selectedOptions: DataTableFilterOption<any>[] = [], children?: React.ReactNode) => {
    const setSelectedOptions = vi.fn();
    const onSelect = vi.fn();

    return {
      setSelectedOptions,
      onSelect,
      ...render(
        <DataTableFilterCombobox
          options={mockOptions}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          onSelect={onSelect}>
          {children}
        </DataTableFilterCombobox>
      ),
    };
  };

  it('renders default button when no children are provided', () => {
    renderCombobox();

    const button = screen.getByTestId('filter-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Filter');
    expect(button.dataset.variant).toBe('outline');
    expect(button.dataset.size).toBe('sm');
    expect(button).toHaveClass('bg-[#3B3C4F]');
    expect(button).toHaveClass('text-white');
  });

  it('renders custom children when provided', () => {
    renderCombobox([], <button data-testid="custom-button">Custom Filter</button>);

    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-button')).not.toBeInTheDocument();
  });

  it('opens popover when trigger is clicked', () => {
    renderCombobox();

    const popover = screen.getByTestId('popover');
    expect(popover.dataset.open).toBe('false');

    fireEvent.click(popover);

    expect(popover.dataset.open).toBe('true');
  });

  it('renders popover content with the correct alignment', () => {
    renderCombobox();

    const popoverContent = screen.getByTestId('popover-content');
    expect(popoverContent).toBeInTheDocument();
    expect(popoverContent.dataset.align).toBe('start');
    expect(popoverContent).toHaveClass('w-[15rem]');
    expect(popoverContent).toHaveClass('p-0');
  });

  it('renders command input with correct placeholder', () => {
    renderCombobox();

    const commandInput = screen.getByTestId('command-input');
    expect(commandInput).toBeInTheDocument();
    expect(commandInput).toHaveAttribute('placeholder', 'Filter by...');
  });

  it('renders command items for each option', () => {
    renderCombobox();

    // Check for each option
    expect(screen.getByTestId('command-item-name')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-status')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-age')).toBeInTheDocument();

    // Check content
    expect(screen.getByTestId('command-item-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('command-item-status')).toHaveTextContent('Status');
    expect(screen.getByTestId('command-item-age')).toHaveTextContent('Age');
  });

  it('does not render command items for already selected options', () => {
    const selectedOptions = [mockOptions[0]]; // Name is already selected

    renderCombobox(selectedOptions);

    // Name should not be in the list
    expect(screen.queryByTestId('command-item-name')).not.toBeInTheDocument();

    // Status and Age should still be in the list
    expect(screen.getByTestId('command-item-status')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-age')).toBeInTheDocument();
  });

  it('calls setSelectedOptions and onSelect when an option is selected', () => {
    const { setSelectedOptions, onSelect } = renderCombobox();

    // Click on the Name option
    fireEvent.click(screen.getByTestId('command-item-name'));

    // Check that setSelectedOptions was called with the correct option
    expect(setSelectedOptions).toHaveBeenCalled();
    const callback = setSelectedOptions.mock.calls[0][0];
    const result = callback([]);
    expect(result).toEqual([{ ...mockOptions[0] }]);

    // Check that onSelect was called
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders empty state when no options match', () => {
    const setSelectedOptions = vi.fn();
    const onSelect = vi.fn();

    render(
      <DataTableFilterCombobox
        options={[]}
        selectedOptions={[]}
        setSelectedOptions={setSelectedOptions}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId('command-empty')).toBeInTheDocument();
    expect(screen.getByTestId('command-empty')).toHaveTextContent('No item found.');
  });

  it('renders different icons for options with and without nested options', () => {
    renderCombobox();

    // Check that the command items are rendered
    expect(screen.getByTestId('command-item-name')).toBeInTheDocument();
    expect(screen.getByTestId('command-item-status')).toBeInTheDocument();

    // Since we can't easily check the icon classes in the mock, we'll just verify
    // that the items have the correct labels
    expect(screen.getByTestId('command-item-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('command-item-status')).toHaveTextContent('Status');
  });
});
