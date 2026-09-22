import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

describe('Checkbox', () => {
  it('should render the checkbox component', () => {
    render(<Checkbox />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-checkbox');
  });

  it('should handle checked state', () => {
    render(<Checkbox checked />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('should handle unchecked state', () => {
    render(<Checkbox checked={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('should handle disabled state', () => {
    render(<Checkbox disabled />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
  });

  it('should call onCheckedChange when clicked', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onCheckedChange when disabled and clicked', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} disabled />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('should render the indicator when checked', () => {
    render(<Checkbox checked />);
    
    // The indicator is a span with data-state="checked"
    const indicator = screen.getByText('', { selector: 'span[data-state="checked"]' });
    expect(indicator).toBeInTheDocument();
    
    // Check that the svg is present inside the indicator
    const svg = indicator.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should not render the indicator when unchecked', () => {
    render(<Checkbox checked={false} />);
    
    // The indicator should not be present
    const indicator = screen.queryByRole('img', { hidden: true });
    expect(indicator).not.toBeInTheDocument();
  });
});
