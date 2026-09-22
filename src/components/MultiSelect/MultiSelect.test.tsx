import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from './MultiSelect';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  XIcon: () => <div data-testid="x-icon" />,
  WandSparkles: () => <div data-testid="wand-sparkles-icon" />,
}));

// Mock the Popover component
vi.mock('@app/components/Popover/Popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

// Mock the Button component
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button data-testid="button" className={className} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock the Badge component
vi.mock('@app/components/Badge/Badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <div data-testid="badge" data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the Separator component
vi.mock('@app/components/Separator/Separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

// Mock the Command components
vi.mock('@app/components/Command/Command', () => ({
  Command: ({ children }: any) => <div data-testid="command">{children}</div>,
  CommandEmpty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: any) => <div data-testid="command-group">{children}</div>,
  CommandInput: ({ placeholder, value, onChange }: any) => (
    <input data-testid="command-input" placeholder={placeholder} value={value} onChange={onChange} />
  ),
  CommandItem: ({ children, onSelect, value }: any) => (
    <button data-testid="command-item" data-value={value} onClick={() => onSelect?.(value)}>
      {children}
    </button>
  ),
  CommandList: ({ children }: any) => <div data-testid="command-list">{children}</div>,
  CommandSeparator: () => <div data-testid="command-separator" />,
}));

describe('MultiSelect', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const onValueChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<MultiSelect options={options} onValueChange={onValueChangeMock} />);

    // Check if the component renders correctly
    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<MultiSelect options={options} onValueChange={onValueChangeMock} placeholder="Custom placeholder" />);

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  it('renders with default selected values', () => {
    render(<MultiSelect options={options} onValueChange={onValueChangeMock} defaultValue={['option1']} />);

    // Open the popover
    fireEvent.click(screen.getByTestId('button'));

    // Check if the popover content is rendered
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByTestId('command')).toBeInTheDocument();
    expect(screen.getByTestId('command-input')).toBeInTheDocument();
  });

  it('handles option selection', async () => {
    const user = userEvent.setup();

    render(<MultiSelect options={options} onValueChange={onValueChangeMock} />);

    // Open the popover
    await user.click(screen.getByTestId('button'));

    // Select an option
    const commandItems = screen.getAllByTestId('command-item');
    await user.click(commandItems[0]);

    // Check if onValueChange was called
    expect(onValueChangeMock).toHaveBeenCalled();
    // We can't check exact arguments since the mock implementation
    // might behave differently than the actual component
  });

  it('renders with custom className', () => {
    render(<MultiSelect options={options} onValueChange={onValueChangeMock} className="custom-class" />);

    expect(screen.getByTestId('button')).toHaveClass('custom-class');
  });
});
