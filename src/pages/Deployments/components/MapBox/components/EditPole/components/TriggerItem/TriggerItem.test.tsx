import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TriggerItem from './TriggerItem';

// Mock dependencies
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@app/components/SVGIcon', () => ({
  default: ({ icon, height, width, className }: any) => (
    <svg data-testid="svg-icon" data-icon={icon} height={height} width={width} className={className} />
  ),
}));

describe('TriggerItem', () => {
  const defaultProps = {
    selectedValue: 'Test Value',
    showOptions: false,
    setShowOptions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<TriggerItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Value');
    });

    it('should render with test id when provided', () => {
      render(<TriggerItem {...defaultProps} testId="trigger-item-test" />);

      const button = screen.getByTestId('trigger-item-test');
      expect(button).toBeInTheDocument();
    });

    it('should render placeholder when selectedValue is empty and placeholder is provided', () => {
      render(<TriggerItem {...defaultProps} selectedValue="" placeholder="Select an option" />);

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render empty when selectedValue and placeholder are both empty', () => {
      render(<TriggerItem {...defaultProps} selectedValue="" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Should have chevron icon but no text content
      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('should render SVG chevron icon', () => {
      render(<TriggerItem {...defaultProps} />);

      const icon = screen.getByTestId('svg-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'chevron');
      expect(icon).toHaveAttribute('height', '10');
      expect(icon).toHaveAttribute('width', '9');
      expect(icon).toHaveClass('-rotate-90');
    });
  });

  describe('Two Values Mode', () => {
    it('should render two values when hasTwoValues is true', () => {
      render(<TriggerItem {...defaultProps} hasTwoValues={true} selectedValue="Value 1" selectedValue2="Value 2" />);

      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
    });

    it('should render only first value when hasTwoValues is true but selectedValue2 is not provided', () => {
      render(<TriggerItem {...defaultProps} hasTwoValues={true} selectedValue="Value 1" />);

      expect(screen.getByText('Value 1')).toBeInTheDocument();
      // Second span should be empty
      const spans = screen.getAllByText('', { selector: 'span' });
      expect(spans.length).toBeGreaterThan(0);
    });

    it('should use flex layout for two values', () => {
      render(<TriggerItem {...defaultProps} hasTwoValues={true} selectedValue="Value 1" selectedValue2="Value 2" />);

      const container = screen.getByText('Value 1').closest('div');
      expect(container).toHaveClass('flex', 'w-full', 'flex-row', 'items-center');
    });
  });

  describe('Custom Children', () => {
    it('should render custom children instead of default content', () => {
      const customChild = <div data-testid="custom-content">Custom Content</div>;

      render(<TriggerItem {...defaultProps}>{customChild}</TriggerItem>);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      // Should not render the selectedValue when children are provided
      expect(screen.queryByText('Test Value')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should toggle showOptions when clicked and not disabled', () => {
      const setShowOptions = vi.fn();

      render(<TriggerItem {...defaultProps} setShowOptions={setShowOptions} showOptions={false} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(setShowOptions).toHaveBeenCalledTimes(1);
      expect(setShowOptions).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not call setShowOptions when disabled', () => {
      const setShowOptions = vi.fn();

      render(<TriggerItem {...defaultProps} setShowOptions={setShowOptions} isDisabled={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(setShowOptions).not.toHaveBeenCalled();
    });

    it('should call setShowOptions with function that toggles value', () => {
      const setShowOptions = vi.fn();

      render(<TriggerItem {...defaultProps} setShowOptions={setShowOptions} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Test the function passed to setShowOptions
      const toggleFunction = setShowOptions.mock.calls[0][0];
      expect(toggleFunction(false)).toBe(true);
      expect(toggleFunction(true)).toBe(false);
    });
  });

  describe('Styling States', () => {
    it('should apply correct classes when showOptions is false', () => {
      render(<TriggerItem {...defaultProps} showOptions={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-transparent', 'bg-grayShades-shade1');
      expect(button).not.toHaveClass('border-blueShades-shade2', 'bg-blueShades-shade3');
    });

    it('should apply correct classes when showOptions is true', () => {
      render(<TriggerItem {...defaultProps} showOptions={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-blueShades-shade2', 'bg-blueShades-shade3');
      expect(button).not.toHaveClass('border-transparent');
    });

    it('should apply disabled classes when isDisabled is true', () => {
      render(<TriggerItem {...defaultProps} isDisabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-not-allowed', 'opacity-60');
      expect(button).not.toHaveClass('cursor-pointer');
    });

    it('should apply enabled classes when isDisabled is false', () => {
      render(<TriggerItem {...defaultProps} isDisabled={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-pointer');
      expect(button).not.toHaveClass('cursor-not-allowed', 'opacity-60');
    });

    it('should apply error border when hasError is true', () => {
      render(<TriggerItem {...defaultProps} hasError={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('!border-destructive');
    });

    it('should apply error text color when hasError is true', () => {
      render(<TriggerItem {...defaultProps} hasError={true} />);

      const textElement = screen.getByText('Test Value');
      expect(textElement).toHaveClass('!text-destructive');
    });

    it('should apply normal text color when hasError is false', () => {
      render(<TriggerItem {...defaultProps} hasError={false} />);

      const textElement = screen.getByText('Test Value');
      expect(textElement).toHaveClass('text-primary');
      expect(textElement).not.toHaveClass('!text-destructive');
    });
  });

  describe('Base Classes', () => {
    it('should always apply base button classes', () => {
      render(<TriggerItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'flex',
        'min-h-[32px]',
        'h-auto',
        'items-center',
        'justify-between',
        'rounded-lg',
        'px-2',
        'hover:bg-grayShades-shade1'
      );
    });

    it('should always apply base text classes', () => {
      render(<TriggerItem {...defaultProps} />);

      const textElement = screen.getByText('Test Value');
      expect(textElement).toHaveClass(
        'whitespace-break-spaces',
        'text-justify',
        'break-all',
        'text-xs',
        'font-bold',
        'capitalize',
        'text-left'
      );
    });

    it('should apply flex classes for two values spans', () => {
      render(<TriggerItem {...defaultProps} hasTwoValues={true} selectedValue="Value 1" selectedValue2="Value 2" />);

      const value1Element = screen.getByText('Value 1');
      const value2Element = screen.getByText('Value 2');

      expect(value1Element).toHaveClass('flex-1');
      expect(value2Element).toHaveClass('flex-1');
    });
  });

  describe('Button Type', () => {
    it('should have type="button"', () => {
      render(<TriggerItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined selectedValue gracefully', () => {
      render(<TriggerItem {...defaultProps} selectedValue={undefined as any} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle null selectedValue gracefully', () => {
      render(<TriggerItem {...defaultProps} selectedValue={null as any} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle very long selectedValue', () => {
      const longValue =
        'This is a very long value that should be handled properly by the component with break-all class';

      render(<TriggerItem {...defaultProps} selectedValue={longValue} />);

      const textElement = screen.getByText(longValue);
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass('break-all');
    });

    it('should handle showOptions undefined', () => {
      render(<TriggerItem {...defaultProps} showOptions={undefined as any} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be focusable when not disabled', () => {
      render(<TriggerItem {...defaultProps} isDisabled={false} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should maintain button role', () => {
      render(<TriggerItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
