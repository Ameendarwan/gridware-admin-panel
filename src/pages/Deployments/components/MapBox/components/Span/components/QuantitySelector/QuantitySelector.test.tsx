import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import QuantitySelector from './QuantitySelector';

describe('QuantitySelector', () => {
  const leftIcon = 'drag';
  const rightIcon = 'search';
  const className = 'custom-class';

  it('renders with correct value and icons', () => {
    const { getByText, getByTestId } = render(
      <QuantitySelector value={5} leftIcon={leftIcon} rightIcon={rightIcon} className={className} onChange={() => {}} />
    );
    expect(getByText('5')).toBeInTheDocument();
    expect(getByTestId('decrement-btn')).toBeInTheDocument();
    expect(getByTestId('increment-btn')).toBeInTheDocument();
  });

  it('calls onChange with value - 1 when decrement clicked', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector value={5} leftIcon={leftIcon} rightIcon={rightIcon} className={className} onChange={onChange} />
    );
    fireEvent.click(getByTestId('decrement-btn'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with value + 1 when increment clicked', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector value={5} leftIcon={leftIcon} rightIcon={rightIcon} className={className} onChange={onChange} />
    );
    fireEvent.click(getByTestId('increment-btn'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('does not decrement below 1', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector value={1} leftIcon={leftIcon} rightIcon={rightIcon} className={className} onChange={onChange} />
    );
    fireEvent.click(getByTestId('decrement-btn'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not increment above 9', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector value={9} leftIcon={leftIcon} rightIcon={rightIcon} className={className} onChange={onChange} />
    );
    fireEvent.click(getByTestId('increment-btn'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows both buttons as visually disabled and does not call onChange when disabled is true', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector
        value={5}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={className}
        onChange={onChange}
        disabled
      />
    );
    const dec = getByTestId('decrement-btn');
    const inc = getByTestId('increment-btn');
    expect(dec.className).toMatch(/cursor-not-allowed|opacity-50/);
    expect(inc.className).toMatch(/cursor-not-allowed|opacity-50/);
    fireEvent.click(dec);
    fireEvent.click(inc);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows increment button as visually disabled and does not call onChange when incrementDisabled is true', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector
        value={5}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={className}
        onChange={onChange}
        incrementDisabled
      />
    );
    const inc = getByTestId('increment-btn');
    const dec = getByTestId('decrement-btn');
    expect(inc.className).toMatch(/cursor-not-allowed|opacity-50/);
    expect(dec.className).not.toMatch(/cursor-not-allowed|opacity-50/);
    fireEvent.click(inc);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(dec);
    // dec should still work
  });

  it('shows decrement button as visually disabled and does not call onChange when decrementDisabled is true', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector
        value={5}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={className}
        onChange={onChange}
        decrementDisabled
      />
    );
    const dec = getByTestId('decrement-btn');
    const inc = getByTestId('increment-btn');
    expect(dec.className).toMatch(/cursor-not-allowed|opacity-50/);
    expect(inc.className).not.toMatch(/cursor-not-allowed|opacity-50/);
    fireEvent.click(dec);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(inc);
    // inc should still work
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <QuantitySelector
        value={5}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={className}
        onChange={onChange}
        disabled
      />
    );
    fireEvent.click(getByTestId('increment-btn'));
    fireEvent.click(getByTestId('decrement-btn'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
