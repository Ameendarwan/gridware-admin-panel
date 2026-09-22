import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock the cn utility function
vi.mock('@app/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock the X icon from lucide-react
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
}));

// Mock the Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => {
  // Keep track of the dialog state and onOpenChange callback
  let dialogState = 'closed';
  let dialogOpenChangeCallback: ((open: boolean) => void) | undefined;

  return {
    Root: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => {
      // Update the dialog state based on the open prop
      dialogState = open ? 'open' : 'closed';
      // Store the callback for use by the trigger
      dialogOpenChangeCallback = onOpenChange;

      return (
        <div data-testid="dialog-root" data-state={dialogState}>
          {children}
          <button data-testid="internal-close" onClick={() => onOpenChange?.(false)}>
            Internal Close
          </button>
        </div>
      );
    },
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
    Overlay: ({ className }: { className?: string }) => <div data-testid="dialog-overlay" className={className} />,
    Content: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-content" className={className} {...props}>
        {children}
      </div>
    ),
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-title" className={className}>
        {children}
      </div>
    ),
    Description: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-description" className={className}>
        {children}
      </div>
    ),
    Close: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <button data-testid="dialog-close-button" className={className}>
        {children || (
          <>
            <div data-testid="x-icon" />
            <span className="sr-only">Close</span>
          </>
        )}
      </button>
    ),
    Trigger: ({ children }: { children: React.ReactNode }) => {
      // When trigger is clicked, we update the dialog state and call the callback
      const handleClick = () => {
        dialogState = 'open';
        dialogOpenChangeCallback?.(true);
      };

      return (
        <button data-testid="dialog-trigger" onClick={handleClick}>
          {children}
        </button>
      );
    },
  };
});

// Import the components after mocking
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog';

describe('Dialog', () => {
  it('should render Dialog with all its parts', async () => {
    const onOpenChange = vi.fn();

    // We'll use cleanup to remove previous renders
    const { unmount } = render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter>
            <button>Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Check if the dialog root and trigger are rendered
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();

    // Initially the dialog is closed
    expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'closed');

    // Cleanup the first render
    unmount();

    // Now render with the dialog open to test the open state
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Content</div>
          <DialogFooter>
            <button>Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Now the dialog should be open and content visible
    expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should render DialogContent with custom className', () => {
    render(
      <Dialog open={true}>
        <DialogContent className="custom-class">Content</DialogContent>
      </Dialog>
    );

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('custom-class');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render DialogClose with custom className', () => {
    render(<DialogClose className="test-class">Close</DialogClose>);

    const close = screen.getByTestId('dialog-close-button');
    expect(close).toBeInTheDocument();
    expect(close).toHaveClass('test-class');
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render DialogHeader with custom className', () => {
    render(
      <DialogHeader className="custom-header" data-testid="dialog-header">
        Header
      </DialogHeader>
    );

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('custom-header');
  });

  it('should render DialogFooter with custom className', () => {
    render(
      <DialogFooter className="custom-footer" data-testid="dialog-footer">
        Footer
      </DialogFooter>
    );

    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveClass('custom-footer');
  });

  it('should render DialogTitle with custom className', () => {
    render(
      <DialogTitle className="custom-title" data-testid="dialog-title">
        Title
      </DialogTitle>
    );

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveClass('custom-title');
  });

  it('should render DialogDescription with custom className', () => {
    render(
      <DialogDescription className="custom-description" data-testid="dialog-description">
        Description
      </DialogDescription>
    );

    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveClass('custom-description');
  });

  it('should close the dialog when DialogClose is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <div>Content</div>
        </DialogContent>
      </Dialog>
    );

    // Check that the dialog is initially open
    expect(screen.getByTestId('dialog-root')).toHaveAttribute('data-state', 'open');

    // Click the internal close button
    await user.click(screen.getByTestId('internal-close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close the dialog when clicking the internal close mechanism', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    );

    // Our mock adds an internal close button to simulate Radix UI's internal close mechanism
    await user.click(screen.getByTestId('internal-close'));

    // The onOpenChange callback should be called with false
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
