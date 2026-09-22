import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command';

// Mock cmdk library
vi.mock('cmdk', () => {
  const MockCommand = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
    <div data-testid="cmdk-command" className={className}>
      {children}
    </div>
  );

  MockCommand.Input = function ({ className, placeholder }: { className?: string; placeholder?: string }) {
    return <input data-testid="cmdk-input" className={className} placeholder={placeholder} />;
  };

  MockCommand.List = function ({ className, children }: { className?: string; children?: React.ReactNode }) {
    return (
      <div data-testid="cmdk-list" className={className}>
        {children}
      </div>
    );
  };

  MockCommand.Empty = function ({ children }: { children?: React.ReactNode }) {
    return (
      <div data-testid="cmdk-empty" className="py-6 text-center text-sm">
        {children}
      </div>
    );
  };

  MockCommand.Group = function ({
    className,
    children,
    heading,
  }: {
    className?: string;
    children?: React.ReactNode;
    heading?: string;
  }) {
    return (
      <div data-testid="cmdk-group" className={className} data-heading={heading}>
        {heading && <div data-testid="cmdk-group-heading">{heading}</div>}
        {children}
      </div>
    );
  };

  MockCommand.Separator = function ({ className }: { className?: string }) {
    return <div data-testid="cmdk-separator" className={className} />;
  };

  MockCommand.Item = function ({ className, children }: { className?: string; children?: React.ReactNode }) {
    return (
      <div data-testid="cmdk-item" className={className}>
        {children}
      </div>
    );
  };

  return {
    Command: MockCommand,
  };
});

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Mock Dialog component
vi.mock('@app/components/Dialog/Dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
}));

describe('Command', () => {
  it('should render Command component', () => {
    render(
      <Command>
        <div>Command Content</div>
      </Command>
    );

    const command = screen.getByTestId('cmdk-command');
    expect(command).toBeInTheDocument();
    expect(screen.getByText('Command Content')).toBeInTheDocument();
  });

  it('should apply custom className to Command', () => {
    render(
      <Command className="custom-command">
        <div>Command Content</div>
      </Command>
    );

    const command = screen.getByTestId('cmdk-command');
    expect(command).toHaveClass('custom-command');
  });

  it('should render CommandDialog component', () => {
    render(
      <CommandDialog>
        <div>Dialog Content</div>
      </CommandDialog>
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('should render CommandInput component', () => {
    render(<CommandInput placeholder="Search..." />);

    const input = screen.getByTestId('cmdk-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search...');

    // Check for the wrapper div
    const wrapper = input.parentElement;
    expect(wrapper).toBeInTheDocument();
  });

  it('should apply custom className to CommandInput', () => {
    render(<CommandInput className="custom-input" placeholder="Search..." />);

    const input = screen.getByTestId('cmdk-input');
    expect(input).toHaveClass('custom-input');
  });

  it('should render CommandList component', () => {
    render(
      <CommandList>
        <div>List Content</div>
      </CommandList>
    );

    const list = screen.getByTestId('cmdk-list');
    expect(list).toBeInTheDocument();
    expect(screen.getByText('List Content')).toBeInTheDocument();
  });

  it('should apply custom className to CommandList', () => {
    render(
      <CommandList className="custom-list">
        <div>List Content</div>
      </CommandList>
    );

    const list = screen.getByTestId('cmdk-list');
    expect(list).toHaveClass('custom-list');
  });

  it('should render CommandEmpty component', () => {
    render(<CommandEmpty>No results found</CommandEmpty>);

    const empty = screen.getByTestId('cmdk-empty');
    expect(empty).toBeInTheDocument();
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should render CommandGroup component', () => {
    render(
      <CommandGroup heading="Commands">
        <div>Group Content</div>
      </CommandGroup>
    );

    const group = screen.getByTestId('cmdk-group');
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
    expect(screen.getByText('Group Content')).toBeInTheDocument();
  });

  it('should apply custom className to CommandGroup', () => {
    render(
      <CommandGroup className="custom-group" heading="Commands">
        <div>Group Content</div>
      </CommandGroup>
    );

    const group = screen.getByTestId('cmdk-group');
    expect(group).toHaveClass('custom-group');
  });

  it('should render CommandSeparator component', () => {
    render(<CommandSeparator />);

    const separator = screen.getByTestId('cmdk-separator');
    expect(separator).toBeInTheDocument();
  });

  it('should render CommandItem component', () => {
    render(<CommandItem>Item Content</CommandItem>);

    const item = screen.getByTestId('cmdk-item');
    expect(item).toBeInTheDocument();
    expect(screen.getByText('Item Content')).toBeInTheDocument();
  });

  it('should apply custom className to CommandItem', () => {
    render(<CommandItem className="custom-item">Item Content</CommandItem>);

    const item = screen.getByTestId('cmdk-item');
    expect(item).toHaveClass('custom-item');
  });

  it('should render CommandShortcut component', () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);

    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should apply custom className to CommandShortcut', () => {
    render(<CommandShortcut className="custom-shortcut">⌘K</CommandShortcut>);

    expect(screen.getByText('⌘K')).toHaveClass('custom-shortcut');
  });
});
