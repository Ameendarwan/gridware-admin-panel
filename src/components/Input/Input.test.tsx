import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

// Mock the cn utility
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

import { cn } from '@app/lib/utils';

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input element', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should apply default type when not specified', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    // HTML input elements have a default type of "text" even if not explicitly set
    expect(input).toHaveProperty('type', 'text');
  });

  it('should apply specified type', () => {
    render(<Input type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle password type', () => {
    render(<Input type="password" />);
    
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should handle number type', () => {
    render(<Input type="number" />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" />);
    
    expect(vi.mocked(cn)).toHaveBeenCalledWith(
      expect.stringContaining('flex h-10 w-full'),
      'custom-class'
    );
  });

  it('should handle value prop', () => {
    render(<Input value="test value" readOnly />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
  });

  it('should handle defaultValue prop', () => {
    render(<Input defaultValue="default value" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('default value');
  });

  it('should handle placeholder prop', () => {
    render(<Input placeholder="Enter text here" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('should handle disabled prop', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should handle readOnly prop', () => {
    render(<Input readOnly />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('should handle required prop', () => {
    render(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should handle onChange event', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'new value' })
    }));
  });

  it('should handle onFocus event', () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle onBlur event', () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle onKeyDown event', () => {
    const handleKeyDown = vi.fn();
    render(<Input onKeyDown={handleKeyDown} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should pass through additional props', () => {
    render(<Input data-testid="custom-input" aria-label="Custom input" />);
    
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('aria-label', 'Custom input');
  });

  it('should handle name prop', () => {
    render(<Input name="username" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'username');
  });

  it('should handle id prop', () => {
    render(<Input id="email-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email-input');
  });

  it('should handle maxLength prop', () => {
    render(<Input maxLength={10} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should handle minLength prop', () => {
    render(<Input minLength={5} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('minLength', '5');
  });

  it('should handle pattern prop', () => {
    render(<Input pattern="[0-9]*" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });

  it('should handle autoComplete prop', () => {
    render(<Input autoComplete="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('should handle autoFocus prop', () => {
    render(<Input autoFocus />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('should handle multiple input types correctly', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  describe('accessibility', () => {
    it('should be focusable when not disabled', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should support aria attributes', () => {
      render(
        <Input 
          aria-label="Search input" 
          aria-describedby="search-help"
          aria-invalid="false"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
      expect(input).toHaveAttribute('aria-describedby', 'search-help');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('form integration', () => {
    it('should work with form submission', () => {
      const handleSubmit = vi.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test" defaultValue="form value" />
          <button type="submit">Submit</button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should validate required field', () => {
      render(<Input required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
      expect(input).toBeInvalid();
    });
  });
});
