import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Textarea component', () => {
  it('renders with default props', () => {
    render(<Textarea data-testid="textarea-test" />);

    const textarea = screen.getByTestId('textarea-test');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('flex');
    expect(textarea).toHaveClass('min-h-[80px]');
    expect(textarea).toHaveClass('w-full');
    expect(textarea).toHaveClass('rounded-md');
    expect(textarea).toHaveClass('border');
    expect(textarea).toHaveClass('border-input');
    expect(textarea).toHaveClass('bg-background');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="textarea-test" />);

    const textarea = screen.getByTestId('textarea-test');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('forwards props to textarea element', () => {
    render(
      <Textarea
        data-testid="textarea-test"
        placeholder="Enter text here"
        maxLength={100}
        required
      />
    );

    const textarea = screen.getByTestId('textarea-test');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text here');
    expect(textarea).toHaveAttribute('maxlength', '100');
    expect(textarea).toHaveAttribute('required');
  });

  it('handles user input correctly', () => {
    render(<Textarea data-testid="textarea-test" />);

    const textarea = screen.getByTestId('textarea-test');
    fireEvent.change(textarea, { target: { value: 'Test input text' } });

    expect(textarea).toHaveValue('Test input text');
  });

  it('applies disabled styling when disabled', () => {
    render(<Textarea data-testid="textarea-test" disabled />);

    const textarea = screen.getByTestId('textarea-test');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed');
    expect(textarea).toHaveClass('disabled:opacity-50');
  });

  it('handles controlled component pattern', () => {
    const handleChange = vi.fn();

    const { rerender } = render(
      <Textarea
        data-testid="textarea-test"
        value="Initial value"
        onChange={handleChange}
      />
    );

    const textarea = screen.getByTestId('textarea-test');
    expect(textarea).toHaveValue('Initial value');

    fireEvent.change(textarea, { target: { value: 'Updated value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);

    // Simulate parent component updating the value
    rerender(
      <Textarea
        data-testid="textarea-test"
        value="Updated value"
        onChange={handleChange}
      />
    );

    expect(textarea).toHaveValue('Updated value');
  });

  it('applies ref correctly', () => {
    const ref = { current: null };

    render(<Textarea data-testid="textarea-test" ref={ref as any} />);

    const textarea = screen.getByTestId('textarea-test');
    expect(ref.current).toBe(textarea);
  });
});
