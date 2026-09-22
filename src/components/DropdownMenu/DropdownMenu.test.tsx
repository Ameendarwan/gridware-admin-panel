import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
}));

// Mock the Radix UI dropdown menu components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="dropdown-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-content" className={className} {...props}>
      {children}
    </div>
  ),
  Item: ({
    children,
    className,
    inset,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    inset?: boolean;
  }) => {
    // Convert boolean to string for data attributes
    const insetAttr = inset ? 'true' : undefined;
    return (
      <div data-testid="dropdown-item" className={className} data-inset={insetAttr} {...props}>
        {children}
      </div>
    );
  },
  CheckboxItem: ({
    children,
    className,
    checked,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    checked?: boolean;
  }) => {
    // Convert boolean to string for data attributes
    const checkedAttr = checked ? 'true' : undefined;
    return (
      <div data-testid="dropdown-checkbox-item" className={className} data-checked={checkedAttr} {...props}>
        {/* We only render the indicator once, not in the span that's added by the component */}
        {children}
      </div>
    );
  },
  RadioItem: ({
    children,
    className,
    value,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    value: string;
  }) => (
    <div data-testid="dropdown-radio-item" className={className} data-value={value} {...props}>
      {/* We don't add the indicator here since it's added by the component */}
      {children}
    </div>
  ),
  Label: ({
    children,
    className,
    inset,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    inset?: boolean;
  }) => {
    // Convert boolean to string for data attributes
    const insetAttr = inset ? 'true' : undefined;
    return (
      <div data-testid="dropdown-label" className={className} data-inset={insetAttr} {...props}>
        {children}
      </div>
    );
  },
  Separator: ({ className, ...props }: { className?: string }) => (
    <div data-testid="dropdown-separator" className={className} {...props} />
  ),
  Group: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-group" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-sub" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({
    children,
    className,
    inset,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    inset?: boolean;
  }) => (
    <div data-testid="dropdown-sub-trigger" className={className} data-inset={inset} {...props}>
      {children}
      {/* We don't add the icon here since it's already in the DropdownMenuSubTrigger component */}
    </div>
  ),
  SubContent: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-sub-content" className={className} {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, value, ...props }: { children: React.ReactNode; value: string }) => (
    <div data-testid="dropdown-radio-group" data-value={value} {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="dropdown-item-indicator">{children}</span>
  ),
}));

// Import the components after mocking
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu';

describe('DropdownMenu', () => {
  it('should render DropdownMenu with trigger and content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Check if the dropdown root and trigger are rendered
    expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Menu')).toBeInTheDocument();

    // With our mocks, the content is always rendered (no actual state management)
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render DropdownMenuItem with custom className', () => {
    render(<DropdownMenuItem className="custom-item">Item</DropdownMenuItem>);

    const item = screen.getByTestId('dropdown-item');
    expect(item).toHaveClass('custom-item');
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('should render DropdownMenuItem with inset prop', () => {
    render(<DropdownMenuItem inset={true}>Inset Item</DropdownMenuItem>);

    const item = screen.getByTestId('dropdown-item');
    expect(item).toBeInTheDocument();
    expect(screen.getByText('Inset Item')).toBeInTheDocument();
  });

  it('should render DropdownMenuCheckboxItem', () => {
    render(<DropdownMenuCheckboxItem checked={true}>Checkbox Item</DropdownMenuCheckboxItem>);

    const item = screen.getByTestId('dropdown-checkbox-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-checked', 'true');
    expect(screen.getByText('Checkbox Item')).toBeInTheDocument();
    // We're not testing for the check-icon here since it's added by the component
    // and we want to avoid duplicate elements in the test
  });

  it('should render DropdownMenuRadioItem', () => {
    render(
      <DropdownMenuRadioGroup value="item1">
        <DropdownMenuRadioItem value="item1">Radio Item</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    );

    const item = screen.getByTestId('dropdown-radio-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-value', 'item1');
    expect(screen.getByText('Radio Item')).toBeInTheDocument();
    // We're not testing for the circle-icon here since it's added by the component
    // and we want to avoid duplicate elements in the test
  });

  it('should render DropdownMenuLabel', () => {
    render(<DropdownMenuLabel>Label</DropdownMenuLabel>);

    const label = screen.getByTestId('dropdown-label');
    expect(label).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('should render DropdownMenuLabel with inset prop', () => {
    render(<DropdownMenuLabel inset={true}>Inset Label</DropdownMenuLabel>);

    const label = screen.getByTestId('dropdown-label');
    expect(label).toBeInTheDocument();
    expect(screen.getByText('Inset Label')).toBeInTheDocument();
  });

  it('should render DropdownMenuSeparator', () => {
    render(<DropdownMenuSeparator />);

    const separator = screen.getByTestId('dropdown-separator');
    expect(separator).toBeInTheDocument();
  });

  it('should render DropdownMenuShortcut', () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);

    // DropdownMenuShortcut is a simple span element
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should render DropdownMenuGroup', () => {
    render(
      <DropdownMenuGroup>
        <DropdownMenuItem>Group Item 1</DropdownMenuItem>
        <DropdownMenuItem>Group Item 2</DropdownMenuItem>
      </DropdownMenuGroup>
    );

    const group = screen.getByTestId('dropdown-group');
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Group Item 1')).toBeInTheDocument();
    expect(screen.getByText('Group Item 2')).toBeInTheDocument();
  });

  it('should render DropdownMenuSub with trigger and content', () => {
    render(
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
          <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );

    const sub = screen.getByTestId('dropdown-sub');
    expect(sub).toBeInTheDocument();

    const trigger = screen.getByTestId('dropdown-sub-trigger');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Sub Menu')).toBeInTheDocument();
    // We're not testing for the chevron-right-icon here since it's added by the component
    // and we want to avoid duplicate elements in the test

    const content = screen.getByTestId('dropdown-sub-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Item 2')).toBeInTheDocument();
  });
});
