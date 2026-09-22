import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock Radix UI Label component
vi.mock('@radix-ui/react-label', () => ({
  Root: ({ children, className, htmlFor, ...props }: any) => (
    <label data-testid="radix-label" className={className} htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

describe('Label', () => {
  it('should render with default styles', () => {
    render(<Label>Test Label</Label>);
    
    const label = screen.getByTestId('radix-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Test Label');
    expect(label.className).toContain('text-sm font-medium leading-none');
  });

  it('should render with custom className', () => {
    render(<Label className="custom-class">Test Label</Label>);
    
    const label = screen.getByTestId('radix-label');
    expect(label).toBeInTheDocument();
    expect(label.className).toContain('custom-class');
  });

  it('should forward additional props', () => {
    const mockProps = { htmlFor: 'test-input' };
    render(
      <Label {...mockProps}>Label Text</Label>
    );
    
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });
});
