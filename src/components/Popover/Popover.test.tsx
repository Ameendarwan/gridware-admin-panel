import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock Radix UI Popover components
vi.mock('@radix-ui/react-popover', () => {
  // Keep track of popover state
  let isOpen = false;

  return {
    Root: ({ children, open }: any) => {
      if (open !== undefined) {
        isOpen = open;
      }

      return (
        <div data-testid="popover-root" data-state={isOpen ? 'open' : 'closed'}>
          {typeof children === 'function' ? children({ open: isOpen }) : children}
        </div>
      );
    },
    Trigger: ({ children, ...props }: any) => (
      <button
        data-testid="popover-trigger"
        onClick={() => {
          isOpen = true;
        }}
        {...props}>
        {children}
      </button>
    ),
    Portal: ({ children }: any) => <div data-testid="popover-portal">{children}</div>,
    Content: React.forwardRef(({ children, className, align, sideOffset, ...props }: any, ref: any) => (
      <div
        data-testid="popover-content"
        className={className}
        data-align={align}
        data-side-offset={sideOffset}
        data-state={isOpen ? 'open' : 'closed'}
        ref={ref}
        {...props}>
        {children}
      </div>
    )),
  };
});

describe('Popover', () => {
  it('renders popover with trigger and content', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );

    // Check if the trigger is rendered
    expect(screen.getByTestId('popover-root')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();

    // Click the trigger to open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));

    // Check if the content is rendered
    expect(screen.getByTestId('popover-portal')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('renders popover content with custom className', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent className="custom-class">Popover content</PopoverContent>
      </Popover>
    );

    // Click the trigger to open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));

    // Check if the content has the custom class
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('custom-class');
  });

  it('renders popover content with custom align', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent align="start">Popover content</PopoverContent>
      </Popover>
    );

    // Click the trigger to open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));

    // Check if the content has the custom align
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveAttribute('data-align', 'start');
  });

  it('renders popover content with custom sideOffset', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent sideOffset={10}>Popover content</PopoverContent>
      </Popover>
    );

    // Click the trigger to open the popover
    fireEvent.click(screen.getByTestId('popover-trigger'));

    // Check if the content has the custom sideOffset
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveAttribute('data-side-offset', '10');
  });

  it('renders controlled popover', () => {
    const onOpenChangeMock = vi.fn();

    const { rerender } = render(
      <Popover open={false} onOpenChange={onOpenChangeMock}>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );

    // Check initial state
    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-state', 'closed');

    // Rerender with open=true
    rerender(
      <Popover open={true} onOpenChange={onOpenChangeMock}>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );

    // Check if state changed
    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('popover-content')).toHaveAttribute('data-state', 'open');
  });
});
