import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

// Mock the Radix UI Select primitives
vi.mock('@radix-ui/react-select', () => {
  // Create a shared state for the select component
  let selectValue = '';
  let onValueChangeCallback: ((value: string) => void) | null = null;

  return {
    Root: ({ value, onValueChange, children }: any) => {
      selectValue = value || '';
      onValueChangeCallback = onValueChange || null;
      return (
        <div data-testid="select-root" data-value={value}>
          {children}
        </div>
      );
    },
    Group: ({ children, ...props }: any) => (
      <div data-testid="select-group" {...props}>
        {children}
      </div>
    ),
    Value: ({ children, ...props }: any) => (
      <div data-testid="select-value" {...props}>
        {children || selectValue}
      </div>
    ),
    Trigger: ({ children, ...props }: any) => (
      <button data-testid="select-trigger" {...props}>
        {children}
      </button>
    ),
    Icon: ({ asChild, children }: any) => <div data-testid="select-icon">{asChild ? children : null}</div>,
    Portal: ({ children }: any) => <div data-testid="select-portal">{children}</div>,
    Content: ({ children, position, ...props }: any) => (
      <div data-testid="select-content" data-position={position} {...props}>
        {children}
      </div>
    ),
    Viewport: ({ children, ...props }: any) => (
      <div data-testid="select-viewport" {...props}>
        {children}
      </div>
    ),
    Item: ({ children, value, ...props }: any) => (
      <button
        data-testid="select-item"
        data-value={value}
        onClick={() => onValueChangeCallback?.(value)}
        type="button"
        {...props}>
        {children}
      </button>
    ),
    ItemText: ({ children }: any) => <div data-testid="select-item-text">{children}</div>,
    ItemIndicator: ({ children }: any) => <div data-testid="select-item-indicator">{children}</div>,
    Label: ({ children, ...props }: any) => (
      <div data-testid="select-label" {...props}>
        {children}
      </div>
    ),
    Separator: ({ ...props }: any) => <div data-testid="select-separator" {...props} />,
    ScrollUpButton: ({ children, ...props }: any) => (
      <div data-testid="select-scroll-up-button" {...props}>
        {children}
      </div>
    ),
    ScrollDownButton: ({ children, ...props }: any) => (
      <div data-testid="select-scroll-down-button" {...props}>
        {children}
      </div>
    ),
  };
});

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
}));

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Select components', () => {
  describe('SelectTrigger', () => {
    it('renders with default props', () => {
      render(<SelectTrigger>Select option</SelectTrigger>);

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Select option');
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SelectTrigger className="custom-trigger">Select option</SelectTrigger>);

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.className).toContain('custom-trigger');
    });
  });

  describe('SelectContent', () => {
    it('renders with default props', () => {
      render(
        <SelectContent>
          <div>Content</div>
        </SelectContent>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-position', 'popper');
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down-button')).toBeInTheDocument();
    });

    it('applies custom position', () => {
      render(<SelectContent position="item-aligned">Content</SelectContent>);

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'item-aligned');
    });

    it('applies custom className', () => {
      render(<SelectContent className="custom-content">Content</SelectContent>);

      const content = screen.getByTestId('select-content');
      expect(content.className).toContain('custom-content');
    });
  });

  describe('SelectItem', () => {
    it('renders with default props', () => {
      render(<SelectItem value="option">Option 1</SelectItem>);

      const item = screen.getByTestId('select-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('data-value', 'option');
      expect(screen.getByTestId('select-item-text')).toHaveTextContent('Option 1');
      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <SelectItem className="custom-item" value="option">
          Option 1
        </SelectItem>
      );

      const item = screen.getByTestId('select-item');
      expect(item.className).toContain('custom-item');
    });
  });

  describe('SelectLabel', () => {
    it('renders with default props', () => {
      render(<SelectLabel>Category</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Category');
    });

    it('applies custom className', () => {
      render(<SelectLabel className="custom-label">Category</SelectLabel>);

      const label = screen.getByTestId('select-label');
      expect(label.className).toContain('custom-label');
    });
  });

  describe('SelectSeparator', () => {
    it('renders with default props', () => {
      render(<SelectSeparator />);

      const separator = screen.getByTestId('select-separator');
      expect(separator).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SelectSeparator className="custom-separator" />);

      const separator = screen.getByTestId('select-separator');
      expect(separator.className).toContain('custom-separator');
    });
  });

  describe('Select integration', () => {
    it('renders a complete select with options', () => {
      render(
        <Select defaultValue="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      const root = screen.getByTestId('select-root');
      const trigger = screen.getByTestId('select-trigger');

      expect(root).toBeInTheDocument();
      expect(trigger).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
    });
  });
});
