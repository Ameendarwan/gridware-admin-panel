// Mock the custom Select components for test reliability
let lastOnValueChange: any = undefined;
vi.mock('@app/components/Select/Select', () => ({
  Select: ({ value, onValueChange, disabled, children }: any) => {
    lastOnValueChange = onValueChange;
    return (
      <div>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange, disabled }))}</div>
    );
  },
  SelectTrigger: ({ children, disabled, ...props }: any) => (
    <button data-testid="line-type-select" disabled={disabled} {...props}>
      {children}
    </button>
  ),
  SelectValue: () => <span>P</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, disabled, children }: any) => (
    <button
      type="button"
      aria-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      onClick={() => !disabled && lastOnValueChange?.(value)}>
      {children}
    </button>
  ),
}));
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SelectSpan from './SelectSpan';
import { LineType } from '@app/pages/Deployments/components/MapBox/types';
import { describe, it, expect, vi } from 'vitest';

describe('SelectSpan', () => {
  const baseProps = {
    value: LineType.Primary,
    label: 'Line Type',
    spanTypesCount: { primary: true, transmission: true, secondary: true },
    isDisabled: false,
    onChange: vi.fn(),
  };

  it('renders label and select trigger', () => {
    const { getByText, getByTestId } = render(<SelectSpan {...baseProps} />);
    expect(getByText('Line Type')).toBeInTheDocument();
    expect(getByTestId('line-type-select')).toBeInTheDocument();
  });

  it('renders all select items enabled when counts are positive', () => {
    const { getAllByRole, getByTestId } = render(<SelectSpan {...baseProps} />);
    fireEvent.mouseDown(getByTestId('line-type-select'));
    const itemP = getAllByRole('button', { name: 'P' }).find(btn => btn !== getByTestId('line-type-select'));
    const itemT = getAllByRole('button', { name: 'T' }).find(btn => btn !== getByTestId('line-type-select'));
    const itemS = getAllByRole('button', { name: 'S' }).find(btn => btn !== getByTestId('line-type-select'));
    expect(itemP).not.toBeDisabled();
    expect(itemT).not.toBeDisabled();
    expect(itemS).not.toBeDisabled();
  });

  it('disables select when isDisabled is true', () => {
    const { getByTestId } = render(<SelectSpan {...baseProps} isDisabled={true} />);
    // The trigger should be disabled
    const trigger = getByTestId('line-type-select');
    expect(trigger).toBeDisabled();
  });

  it('disables select items when spanTypesCount is false', () => {
    const props = {
      ...baseProps,
      spanTypesCount: { primary: false, transmission: false, secondary: false },
    };
    const { getAllByRole, getByTestId } = render(<SelectSpan {...props} />);
    fireEvent.mouseDown(getByTestId('line-type-select'));
    const itemP = getAllByRole('button', { name: 'P' }).find(btn => btn !== getByTestId('line-type-select'));
    const itemT = getAllByRole('button', { name: 'T' }).find(btn => btn !== getByTestId('line-type-select'));
    const itemS = getAllByRole('button', { name: 'S' }).find(btn => btn !== getByTestId('line-type-select'));
    expect(itemP).toBeDisabled();
    expect(itemT).toBeDisabled();
    expect(itemS).toBeDisabled();
  });

  it('calls onChange when a new value is selected', () => {
    const onChange = vi.fn();
    const { getByTestId, getAllByRole } = render(<SelectSpan {...baseProps} onChange={onChange} />);
    // Open the select dropdown
    fireEvent.mouseDown(getByTestId('line-type-select'));
    // Click on 'T' (Transmission)
    const itemT = getAllByRole('button', { name: 'T' }).find(btn => btn !== getByTestId('line-type-select'));
    fireEvent.click(itemT!);
    expect(onChange).toHaveBeenCalledWith(LineType.Transmission);
  });
});
