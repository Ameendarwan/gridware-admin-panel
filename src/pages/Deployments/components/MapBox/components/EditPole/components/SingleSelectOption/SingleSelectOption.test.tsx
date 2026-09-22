import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import SingleSelectOption from './SingleSelectOption';
import { MultiSelectOptionProps, OptionItem } from './types';
import { createMockReduxStore } from '@tests/commonMocks';

// Mock dependencies
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
}));

vi.mock('../../../OptionsListSection', () => ({
  default: ({
    children,
    title,
    onSaveClick,
    buttonTitle,
    buttonClass,
    disabled,
    isValueChanged,
    handleClose,
    ...props
  }: any) => (
    <div
      data-testid="options-list-section"
      data-title={title}
      data-button-title={buttonTitle}
      data-button-class={buttonClass}
      data-disabled={disabled}
      data-is-value-changed={isValueChanged}
      {...props}>
      <button data-testid="save-button" onClick={onSaveClick}>
        {buttonTitle}
      </button>
      <button data-testid="close-button" onClick={handleClose}>
        Close
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../TriggerItem', () => ({
  default: ({
    isDisabled,
    showOptions,
    setShowOptions,
    selectedValue,
    selectedValue2,
    hasError,
    hasTwoValues,
    placeholder,
    ...props
  }: any) => (
    <button
      data-testid="trigger-item"
      data-disabled={isDisabled}
      data-show-options={showOptions}
      data-selected-value={selectedValue}
      data-selected-value2={selectedValue2}
      data-has-error={hasError}
      data-has-two-values={hasTwoValues}
      data-placeholder={placeholder}
      onClick={() => setShowOptions(!showOptions)}
      {...props}>
      {selectedValue || placeholder}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  X: ({ className, ...props }: any) => (
    <svg data-testid="x-icon" className={className} {...props}>
      <path d="X" />
    </svg>
  ),
}));

vi.mock('@app/store/slices/polesSlice', () => ({
  setIsMovingPole: vi.fn(),
}));

// Mock Redux store
const mockStore = createMockReduxStore();

// Helper function to render component with Redux
const renderWithRedux = (props: MultiSelectOptionProps) => {
  return render(
    <Provider store={mockStore}>
      <SingleSelectOption {...props} />
    </Provider>
  );
};

// Helper to create default props
const createDefaultProps = (overrides: Partial<MultiSelectOptionProps> = {}): MultiSelectOptionProps => ({
  title: 'Test Title',
  value: 'test-value',
  onSaveClick: vi.fn(),
  onClose: vi.fn(),
  optionsList: ['Option 1', 'Option 2', 'Option 3'],
  ...overrides,
});

describe('SingleSelectOption', () => {
  const defaultProps: MultiSelectOptionProps = createDefaultProps();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderWithRedux(defaultProps);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByTestId('trigger-item')).toBeInTheDocument();
    });

    it('should render without title when not provided', () => {
      renderWithRedux({ ...defaultProps, title: undefined });

      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
      expect(screen.getByTestId('trigger-item')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithRedux({ ...defaultProps, className: 'custom-class' });

      const container = screen.getByText('Test Title').closest('div')?.parentElement;
      expect(container).toHaveClass('flex', 'w-full', 'flex-col', 'gap-2', 'custom-class');
    });

    it('should render custom trigger component when provided', () => {
      const customTrigger = <div data-testid="custom-trigger">Custom Trigger</div>;
      renderWithRedux({ ...defaultProps, triggerComponent: customTrigger });

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
      expect(screen.queryByTestId('trigger-item')).not.toBeInTheDocument();
    });
  });

  describe('TriggerItem Props', () => {
    it('should pass correct props to TriggerItem', () => {
      renderWithRedux({
        ...defaultProps,
        disabled: true,
        hasError: true,
        hasTwoValues: true,
        placeholder: 'Select option',
        value2: 'second-value',
        visibleValue: 'visible-value',
      });

      const triggerItem = screen.getByTestId('trigger-item');
      expect(triggerItem).toHaveAttribute('data-disabled', 'true');
      expect(triggerItem).toHaveAttribute('data-has-error', 'true');
      expect(triggerItem).toHaveAttribute('data-has-two-values', 'true');
      expect(triggerItem).toHaveAttribute('data-placeholder', 'Select option');
      expect(triggerItem).toHaveAttribute('data-selected-value', 'visible-value');
      expect(triggerItem).toHaveAttribute('data-selected-value2', 'second-value');
    });

    it('should use value when visibleValue is not provided', () => {
      renderWithRedux({ ...defaultProps, visibleValue: undefined });

      const triggerItem = screen.getByTestId('trigger-item');
      expect(triggerItem).toHaveAttribute('data-selected-value', 'test-value');
    });

    it('should use empty string when both visibleValue and value are not provided', () => {
      renderWithRedux({ ...defaultProps, visibleValue: undefined, value: undefined });

      const triggerItem = screen.getByTestId('trigger-item');
      expect(triggerItem).toHaveAttribute('data-selected-value', '');
    });
  });

  describe('Options Display', () => {
    it('should show options when trigger is clicked', () => {
      renderWithRedux(defaultProps);

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('options-list-section')).toBeInTheDocument();
    });

    it('should not show options initially', () => {
      renderWithRedux(defaultProps);

      expect(screen.queryByTestId('options-list-section')).not.toBeInTheDocument();
    });

    it('should render string options correctly', () => {
      renderWithRedux(defaultProps);

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render OptionItem objects correctly', () => {
      const objectOptions: OptionItem[] = [
        { value: 'val1', label: 'Label 1' },
        { value: 'val2', label: 'Label 2' },
      ];

      renderWithRedux({ ...defaultProps, optionsList: objectOptions });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
    });

    it('should handle mixed string and object options', () => {
      const mixedOptions = ['String Option', { value: 'obj-val', label: 'Object Label' }];

      renderWithRedux({ ...defaultProps, optionsList: mixedOptions });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByText('String Option')).toBeInTheDocument();
      expect(screen.getByText('Object Label')).toBeInTheDocument();
    });

    it('should render custom children instead of options when provided', () => {
      const customChildren = <div data-testid="custom-children">Custom Content</div>;

      renderWithRedux({ ...defaultProps, children: customChildren });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('custom-children')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should select option when clicked', () => {
      renderWithRedux(defaultProps);

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      // Check if option is selected (visual feedback)
      const optionButton = option.closest('button');
      expect(optionButton).toHaveClass('border-transparent', 'bg-secondary', 'text-white');
    });

    it('should not select disabled option', () => {
      renderWithRedux({
        ...defaultProps,
        disabledOptions: [false, true, false],
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const disabledOption = screen.getByText('Option 2');
      fireEvent.click(disabledOption);

      // Should not change selection
      const optionButton = disabledOption.closest('button');
      expect(optionButton).toHaveClass('border-muted', 'bg-white', 'text-primary');
    });

    it('should show correct styling for selected option', () => {
      renderWithRedux({ ...defaultProps, value: 'Option 1' });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const selectedOption = screen.getAllByText('Option 1').find(el => el.tagName === 'LABEL');
      const selectedButton = selectedOption?.closest('button');
      expect(selectedButton).toHaveClass('border-transparent', 'bg-secondary', 'text-white');

      const unselectedOption = screen.getByText('Option 2');
      const unselectedButton = unselectedOption.closest('button');
      expect(unselectedButton).toHaveClass('border-muted', 'bg-white', 'text-primary');
    });
  });

  describe('Save and Close Actions', () => {
    it('should call onSaveClick with selected value when save button is clicked', () => {
      const onSaveClick = vi.fn();
      renderWithRedux({ ...defaultProps, onSaveClick });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      // Select an option
      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      // Click save button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      expect(onSaveClick).toHaveBeenCalledWith('Option 2');
    });

    it('should close options when save button is clicked', () => {
      renderWithRedux(defaultProps);

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('options-list-section')).toBeInTheDocument();

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      expect(screen.queryByTestId('options-list-section')).not.toBeInTheDocument();
    });
  });

  describe('Button Title Logic', () => {
    it('should show "Save & Close" when value is changed', () => {
      renderWithRedux({ ...defaultProps, value: 'Option 1' });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      // Change selection
      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-button-title', 'Save & Close');
    });

    it('should show "Save & Close" when value is "WEATHER STATION"', () => {
      renderWithRedux({ ...defaultProps, value: 'WEATHER STATION' });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-button-title', 'Save & Close');
    });

    it('should show "Close" when value is not changed', () => {
      renderWithRedux({ ...defaultProps, value: 'Option 1' });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-button-title', 'Close');
    });

    it('should show different button class when value is not changed', () => {
      renderWithRedux({ ...defaultProps, value: 'Option 1' });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-button-class', '!bg-primary hover:!bg-label');
    });
  });

  describe('Deselect Functionality', () => {
    it('should show deselect button when deselect prop is true and option is selected', () => {
      renderWithRedux({
        ...defaultProps,
        deselect: true,
        value: 'Option 1',
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should not show deselect button when deselect prop is false', () => {
      renderWithRedux({
        ...defaultProps,
        deselect: false,
        value: 'Option 1',
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled Options', () => {
    it('should apply disabled styling to disabled options', () => {
      renderWithRedux({
        ...defaultProps,
        disabledOptions: [false, true, false],
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const disabledOption = screen.getByText('Option 2').closest('button');
      expect(disabledOption).toHaveClass('cursor-not-allowed');

      const enabledOption = screen.getByText('Option 1').closest('button');
      expect(enabledOption).toHaveClass('cursor-pointer');
    });
  });

  describe('Data Test IDs', () => {
    it('should apply correct data-testid to options', () => {
      renderWithRedux({
        ...defaultProps,
        dataTestId: 'test-select',
        optionsList: [{ value: 'val1', label: 'Label 1' }],
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('test-select-val1')).toBeInTheDocument();
    });
  });

  describe('Options List Section Props', () => {
    it('should pass correct props to OptionsListSection', () => {
      renderWithRedux({
        ...defaultProps,
        sectionTitle: 'Custom Section Title',
        disabled: true,
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-title', 'Custom Section Title');
      expect(optionsSection).toHaveAttribute('data-disabled', 'true');
    });

    it('should use title as sectionTitle when sectionTitle is not provided', () => {
      renderWithRedux({ ...defaultProps, sectionTitle: undefined });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-title', 'Test Title');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options list', () => {
      renderWithRedux({ ...defaultProps, optionsList: [] });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('options-list-section')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should handle undefined options list', () => {
      renderWithRedux({ ...defaultProps, optionsList: undefined });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      expect(screen.getByTestId('options-list-section')).toBeInTheDocument();
    });

    it('should handle tempValueParent logic', () => {
      renderWithRedux({
        ...defaultProps,
        value: 'Option 1',
        tempValueParent: 'Option 2',
      });

      const triggerItem = screen.getByTestId('trigger-item');
      fireEvent.click(triggerItem);

      const optionsSection = screen.getByTestId('options-list-section');
      expect(optionsSection).toHaveAttribute('data-is-value-changed', 'true');
    });
  });
});
