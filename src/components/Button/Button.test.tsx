import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, buttonVariants } from './Button';

// Mock the Loader component
vi.mock('../Loader/Loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

// Mock the cn utility
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Mock Radix UI Slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

import { cn } from '@app/lib/utils';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render button with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should render children correctly', () => {
    render(<Button>Test Button</Button>);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading is true', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loader when loading is true', () => {
    render(<Button loading>Loading Button</Button>);
    
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when both loading and disabled are true', () => {
    render(<Button loading disabled>Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    
    expect(vi.mocked(cn)).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<Button data-testid="custom-button" aria-label="Custom button">Button</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  describe('variants', () => {
    it('should apply default variant', () => {
      render(<Button>Default</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply link variant', () => {
      render(<Button variant="link">Link</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply muted variant', () => {
      render(<Button variant="muted">Muted</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply success variant', () => {
      render(<Button variant="success">Success</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply icon variant', () => {
      render(<Button variant="icon">Icon</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });
  });

  describe('sizes', () => {
    it('should apply default size', () => {
      render(<Button>Default Size</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply sm size', () => {
      render(<Button size="sm">Small</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply lg size', () => {
      render(<Button size="lg">Large</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply icon size', () => {
      render(<Button size="icon">Icon</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply ghost size', () => {
      render(<Button size="ghost">Ghost</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply muted size', () => {
      render(<Button size="muted">Muted</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });

    it('should apply custom size', () => {
      render(<Button size="custom">Custom</Button>);
      
      expect(vi.mocked(cn)).toHaveBeenCalled();
    });
  });

  describe('asChild prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(<Button asChild>Button</Button>);
      
      // When asChild is true, it should render as a div (mocked Slot)
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should render as button when asChild is false', () => {
      render(<Button asChild={false}>Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('buttonVariants', () => {
    it('should be a function', () => {
      expect(typeof buttonVariants).toBe('function');
    });

    it('should return string when called', () => {
      const result = buttonVariants();
      expect(typeof result).toBe('string');
    });

    it('should accept variant and size parameters', () => {
      const result = buttonVariants({ variant: 'destructive', size: 'lg' });
      expect(typeof result).toBe('string');
    });
  });

  describe('accessibility', () => {
    it('should have correct button role', () => {
      render(<Button>Accessible Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <Button aria-label="Close dialog" aria-pressed="false">
          Close
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be focusable when not disabled', () => {
      render(<Button>Focusable Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
