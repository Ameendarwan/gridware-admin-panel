import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableColumnHeader from './DataTableColumnHeader';
import { createMockColumn } from '@app/utils/testHelpers';

// Mock dependencies
vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-menu-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, 'aria-label': ariaLabel }: any) => {
    const testId = ariaLabel
      ? 'dropdown-menu-item-' + ariaLabel.toLowerCase().replaceAll(/\s+/g, '-')
      : 'dropdown-menu-item';
    return (
      <button data-testid={testId} onClick={onClick}>
        {children}
      </button>
    );
  },
  DropdownMenuSeparator: () => <hr data-testid="dropdown-menu-separator" />,
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, variant, size, className, 'aria-label': ariaLabel }: any) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  ArrowDownIcon: ({ className }: any) => <span data-testid="arrow-down-icon" className={className} />,
  ArrowUpIcon: ({ className }: any) => <span data-testid="arrow-up-icon" className={className} />,
}));

describe('DataTableColumnHeader component', () => {
  it('renders simple header when column cannot be sorted or hidden', () => {
    const column = createMockColumn({
      getCanSort: () => false,
      getCanHide: () => false,
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    expect(screen.getByText('Test Column')).toBeInTheDocument();
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('renders a sortable column header', () => {
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => false,
      toggleSorting: vi.fn(),
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveTextContent('Test Column');
    expect(screen.getByTestId('button').ariaLabel).toBe('Not sorted. Click to sort ascending.');
  });

  it('renders ascending sort indicator when column is sorted ascending', () => {
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => 'asc',
      toggleSorting: vi.fn(),
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Use a more specific selector to avoid matching multiple elements with the same test ID
    // Find the arrow-up-icon that is a direct child of the button
    const arrowUpIcons = screen.getAllByTestId('arrow-up-icon');
    const buttonArrowIcon = arrowUpIcons.find(
      icon => icon.className.includes('ml-2') && icon.className.includes('size-4')
    );
    expect(buttonArrowIcon).toBeInTheDocument();
    expect(screen.getByTestId('button').ariaLabel).toBe('Sorted ascending. Click to sort descending.');
  });

  it('renders descending sort indicator when column is sorted descending', () => {
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => 'desc',
      toggleSorting: vi.fn(),
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Use a more specific selector to avoid matching multiple elements with the same test ID
    // Find the arrow-down-icon that is a direct child of the button
    const arrowDownIcons = screen.getAllByTestId('arrow-down-icon');
    const buttonArrowIcon = arrowDownIcons.find(
      icon => icon.className.includes('ml-2') && icon.className.includes('size-4')
    );
    expect(buttonArrowIcon).toBeInTheDocument();
    expect(screen.getByTestId('button').ariaLabel).toBe('Sorted descending. Click to sort ascending.');
  });

  it('calls toggleSorting with false when sort ascending is clicked', () => {
    const toggleSorting = vi.fn();
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => false,
      toggleSorting,
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Click sort ascending
    fireEvent.click(screen.getByTestId('dropdown-menu-item-sort-ascending'));

    expect(toggleSorting).toHaveBeenCalledWith(false);
  });

  it('calls toggleSorting with true when sort descending is clicked', () => {
    const toggleSorting = vi.fn();
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => false,
      toggleSorting,
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Click sort descending
    fireEvent.click(screen.getByTestId('dropdown-menu-item-sort-descending'));

    expect(toggleSorting).toHaveBeenCalledWith(true);
  });

  it('renders hide option when column can be hidden', () => {
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => true,
      getIsSorted: () => false,
      toggleSorting: vi.fn(),
      toggleVisibility: vi.fn(),
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    expect(screen.getByTestId('dropdown-menu-item-hide-column')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument();
  });

  it('calls toggleVisibility with false when hide is clicked', () => {
    const toggleVisibility = vi.fn();
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => true,
      getIsSorted: () => false,
      toggleSorting: vi.fn(),
      toggleVisibility,
    });

    render(<DataTableColumnHeader column={column} title="Test Column" />);

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Click hide
    fireEvent.click(screen.getByTestId('dropdown-menu-item-hide-column'));

    expect(toggleVisibility).toHaveBeenCalledWith(false);
  });

  it('applies custom className', () => {
    const column = createMockColumn({
      getCanSort: () => true,
      getCanHide: () => false,
      getIsSorted: () => false,
      toggleSorting: vi.fn(),
    });

    render(<DataTableColumnHeader column={column} title="Test Column" className="custom-class" />);

    const container = screen.getByTestId('dropdown-menu').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
