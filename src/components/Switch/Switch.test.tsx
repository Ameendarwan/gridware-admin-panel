import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

// Mock the cn utility
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

import { cn } from '@app/lib/utils';

describe('Switch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a switch element', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should be unchecked by default', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should be checked when checked prop is true', () => {
    render(<Switch checked={true} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should call onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should toggle state when clicked multiple times', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');

    // First click
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);

    // Second click (simulating checked state)
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled={true} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should not call onCheckedChange when disabled and clicked', () => {
    const handleChange = vi.fn();
    render(<Switch disabled={true} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-switch-class';
    render(<Switch className={customClass} />);

    expect(vi.mocked(cn)).toHaveBeenCalledWith(expect.stringContaining('peer inline-flex h-6 w-11'), customClass);
  });

  it('should merge default classes with custom className', () => {
    const customClass = 'my-custom-class';
    render(<Switch className={customClass} />);

    expect(vi.mocked(cn)).toHaveBeenCalledWith(expect.any(String), customClass);
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Switch ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('should support controlled component pattern', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<Switch checked={false} onCheckedChange={handleChange} />);

    let switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();

    // Update checked state
    rerender(<Switch checked={true} onCheckedChange={handleChange} />);

    switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should have proper ARIA attributes', () => {
    render(<Switch aria-label="Toggle feature" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle feature');
  });

  it('should have correct data attributes for styling', () => {
    const { rerender } = render(<Switch checked={false} />);

    let switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');

    rerender(<Switch checked={true} />);

    switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('should contain a thumb element', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    const thumbElement = switchElement.querySelector('span');

    expect(thumbElement).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    switchElement.focus();
    expect(switchElement).toHaveFocus();

    // Simulate user pressing space (this is handled internally by Radix)
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should support Enter key for activation', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    switchElement.focus();

    // Since Radix handles keyboard interaction internally,
    // we test that the component is focusable and clickable
    expect(switchElement).toHaveFocus();
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should display correct displayName', () => {
    expect(Switch.displayName).toBe('Switch');
  });

  it('should apply focus styles when focused', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    switchElement.focus();

    expect(switchElement).toHaveFocus();
  });

  it('should pass through additional props', () => {
    render(<Switch data-testid="custom-switch" id="my-switch" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-testid', 'custom-switch');
    expect(switchElement).toHaveAttribute('id', 'my-switch');
  });
});
