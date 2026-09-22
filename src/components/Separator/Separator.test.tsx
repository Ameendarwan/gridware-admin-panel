import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';

// Mock the Radix UI Separator primitive
vi.mock('@radix-ui/react-separator', () => {
  return {
    Root: ({ className, orientation, decorative, ...props }: any) => (
      <div 
        data-testid="separator-root" 
        data-orientation={orientation}
        data-decorative={decorative}
        className={className} 
        {...props} 
      />
    ),
  };
});

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Separator component', () => {
  it('renders with default props (horizontal orientation)', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-decorative', 'true');
    expect(separator.className).toContain('h-[1px] w-full');
  });

  it('renders with vertical orientation', () => {
    render(<Separator orientation="vertical" />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator.className).toContain('h-full w-[1px]');
  });

  it('applies custom className', () => {
    render(<Separator className="custom-separator" />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator.className).toContain('custom-separator');
  });

  it('forwards props to underlying component', () => {
    render(<Separator data-custom="test-value" />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-custom', 'test-value');
  });

  it('can be set as non-decorative', () => {
    render(<Separator decorative={false} />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-decorative', 'false');
  });
});
