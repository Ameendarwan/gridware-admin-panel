import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTableLogicalOperator from './DataTableLogicalOperator';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test', search: '' }),
}));

vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  createQueryString: vi.fn(() => 'logical_operator=and'),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: vi.fn(({ children, className, onClick, type, size, variant }) => (
    <button
      data-testid={`button-${children}`}
      className={className}
      onClick={onClick}
      type={type}
      data-size={size}
      data-variant={variant}>
      {children}
    </button>
  )),
}));

vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DataTableLogicalOperator component', () => {
  it('renders with AND selected when value is "and"', () => {
    const onChange = vi.fn();

    render(<DataTableLogicalOperator value="and" onChange={onChange} />);

    // Check label text
    expect(screen.getByText('Logical Operator:')).toBeInTheDocument();

    // Check buttons
    const andButton = screen.getByTestId('button-AND');
    const orButton = screen.getByTestId('button-OR');

    expect(andButton).toBeInTheDocument();
    expect(orButton).toBeInTheDocument();

    // Check that AND button has the selected style
    expect(andButton.className).toContain('bg-primary');
    expect(andButton.className).toContain('text-primary-foreground');

    // Check that OR button doesn't have the selected style
    expect(orButton.className).not.toContain('bg-primary');
    expect(orButton.className).not.toContain('text-primary-foreground');
  });

  it('renders with OR selected when value is "or"', () => {
    const onChange = vi.fn();

    render(<DataTableLogicalOperator value="or" onChange={onChange} />);

    // Check buttons
    const andButton = screen.getByTestId('button-AND');
    const orButton = screen.getByTestId('button-OR');

    // Check that OR button has the selected style
    expect(orButton.className).toContain('bg-primary');
    expect(orButton.className).toContain('text-primary-foreground');

    // Check that AND button doesn't have the selected style
    expect(andButton.className).not.toContain('bg-primary');
    expect(andButton.className).not.toContain('text-primary-foreground');
  });

  it('calls onChange with "and" when AND button is clicked', () => {
    const onChange = vi.fn();

    render(<DataTableLogicalOperator value="or" onChange={onChange} />);

    const andButton = screen.getByTestId('button-AND');

    // Click the AND button
    fireEvent.click(andButton);

    // Check that onChange was called with "and"
    expect(onChange).toHaveBeenCalledWith('and');
  });

  it('calls onChange with "or" when OR button is clicked', () => {
    const onChange = vi.fn();

    render(<DataTableLogicalOperator value="and" onChange={onChange} />);

    const orButton = screen.getByTestId('button-OR');

    // Click the OR button
    fireEvent.click(orButton);

    // Check that onChange was called with "or"
    expect(onChange).toHaveBeenCalledWith('or');
  });

  it('has the correct button styling and attributes', () => {
    const onChange = vi.fn();

    render(<DataTableLogicalOperator value="and" onChange={onChange} />);

    const andButton = screen.getByTestId('button-AND');
    const orButton = screen.getByTestId('button-OR');

    // Check button attributes
    expect(andButton.getAttribute('type')).toBe('button');
    expect(andButton.dataset.size).toBe('sm');
    expect(andButton.dataset.variant).toBe('ghost');

    expect(orButton.getAttribute('type')).toBe('button');
    expect(orButton.dataset.size).toBe('sm');
    expect(orButton.dataset.variant).toBe('ghost');

    // Check common styling classes
    expect(andButton.className).toContain('h-7');
    expect(andButton.className).toContain('px-2');
    expect(andButton.className).toContain('text-xs');
    expect(andButton.className).toContain('font-medium');

    expect(orButton.className).toContain('h-7');
    expect(orButton.className).toContain('px-2');
    expect(orButton.className).toContain('text-xs');
    expect(orButton.className).toContain('font-medium');
  });

  it('renders the container with correct styling', () => {
    const onChange = vi.fn();

    const { container } = render(<DataTableLogicalOperator value="and" onChange={onChange} />);

    // Check the outer container
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain('flex');
    expect(outerDiv.className).toContain('items-center');
    expect(outerDiv.className).toContain('space-x-1');
    expect(outerDiv.className).toContain('px-1');
    expect(outerDiv.className).toContain('py-2');

    // Check the buttons container
    const buttonsContainer = outerDiv.querySelector('div.flex.space-x-1.border.rounded-md');
    expect(buttonsContainer).not.toBeNull();
  });
});
