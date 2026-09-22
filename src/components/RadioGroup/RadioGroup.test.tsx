import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  Circle: () => <div data-testid="circle-icon" />,
}));

// Mock Radix UI RadioGroup components
vi.mock('@radix-ui/react-radio-group', () => {
  // Use a factory function to create a fresh state for each test
  return {
    Root: React.forwardRef(({ children, className, value, onValueChange, defaultValue, ...props }: any, ref: any) => {
      // Create a state variable for this component instance
      const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');

      // Update the selected value when value prop changes
      React.useEffect(() => {
        if (value !== undefined) {
          setSelectedValue(value);
        }
      }, [value]);

      // Handler for value changes from child items
      const handleValueChange = React.useCallback(
        (newValue: string) => {
          setSelectedValue(newValue);
          if (onValueChange) {
            onValueChange(newValue);
          }
        },
        [onValueChange]
      );

      // Context to share state with child components
      const contextValue = React.useMemo(
        () => ({
          selectedValue,
          onChange: handleValueChange,
        }),
        [selectedValue, handleValueChange]
      );

      return (
        <div data-testid="radio-group-root" className={className} data-value={selectedValue} ref={ref} {...props}>
          <RadioGroupContext.Provider value={contextValue}>
            {typeof children === 'function' ? children({ value: selectedValue }) : children}
          </RadioGroupContext.Provider>
        </div>
      );
    }),
    Item: React.forwardRef(({ children, className, value, disabled, ...props }: any, ref: any) => {
      // Access the context to get the current selected value and change handler
      const context = React.useContext(RadioGroupContext);
      const isChecked = context.selectedValue === value;

      const handleClick = () => {
        if (!disabled && context.onChange) {
          context.onChange(value);
        }
      };

      return (
        <button
          data-testid="radio-group-item"
          className={className}
          data-value={value}
          data-state={isChecked ? 'checked' : 'unchecked'}
          data-disabled={disabled ? '' : undefined}
          onClick={handleClick}
          ref={ref}
          {...props}>
          {children}
        </button>
      );
    }),
    Indicator: ({ className, children, ...props }: any) => {
      const context = React.useContext(RadioGroupContext);

      return (
        <div
          data-testid="radio-group-indicator"
          className={className}
          data-state={context.selectedValue ? 'checked' : 'unchecked'}
          {...props}>
          {children}
        </div>
      );
    },
  };
});

// Create a context for the RadioGroup state
const RadioGroupContext = React.createContext<{
  selectedValue: string;
  onChange: (value: string) => void;
}>({
  selectedValue: '',
  onChange: () => {},
});

describe('RadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
        <RadioGroupItem value="option3" id="option3" />
      </RadioGroup>
    );

    // Check if the radio group and items are rendered
    expect(screen.getByTestId('radio-group-root')).toBeInTheDocument();
    expect(screen.getAllByTestId('radio-group-item')).toHaveLength(3);

    // Check if the first item is selected by default
    const items = screen.getAllByTestId('radio-group-item');
    expect(items[0]).toHaveAttribute('data-state', 'checked');
    expect(items[1]).toHaveAttribute('data-state', 'unchecked');
    expect(items[2]).toHaveAttribute('data-state', 'unchecked');
  });

  it('handles value change when clicking items', () => {
    const onValueChangeMock = vi.fn();

    render(
      <RadioGroup defaultValue="option1" onValueChange={onValueChangeMock}>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
        <RadioGroupItem value="option3" id="option3" />
      </RadioGroup>
    );

    // Click the second item
    const items = screen.getAllByTestId('radio-group-item');
    fireEvent.click(items[1]);

    // Check if the second item is now selected
    expect(items[0]).toHaveAttribute('data-state', 'unchecked');
    expect(items[1]).toHaveAttribute('data-state', 'checked');
    expect(items[2]).toHaveAttribute('data-state', 'unchecked');

    // Check if onValueChange was called
    expect(onValueChangeMock).toHaveBeenCalledWith('option2');
  });

  it('renders radio group with custom className', () => {
    render(
      <RadioGroup className="custom-class">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );

    const radioGroup = screen.getByTestId('radio-group-root');
    expect(radioGroup).toHaveClass('custom-class');
  });

  it('renders radio group item with custom className', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" className="custom-item-class" />
      </RadioGroup>
    );

    const radioItem = screen.getByTestId('radio-group-item');
    expect(radioItem).toHaveClass('custom-item-class');
  });

  it('renders disabled radio group item', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" disabled />
      </RadioGroup>
    );

    const radioItem = screen.getByTestId('radio-group-item');
    expect(radioItem).toHaveAttribute('data-disabled', '');
  });

  it('renders radio group with indicator and icon', () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" />
      </RadioGroup>
    );

    // When an item is selected, the indicator should be rendered
    expect(screen.getByTestId('radio-group-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
  });
});
