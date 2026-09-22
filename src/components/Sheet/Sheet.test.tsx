import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from './Sheet';

// Mock the Radix UI Dialog primitives (used by Sheet)
vi.mock('@radix-ui/react-dialog', () => {
  // Create a shared state for the dialog component
  let dialogState = 'closed';
  let onOpenChangeCallback: ((open: boolean) => void) | null = null;

  return {
    Root: ({ open, onOpenChange, children }: any) => {
      dialogState = open ? 'open' : 'closed';
      onOpenChangeCallback = onOpenChange || null;
      return (
        <div data-testid="sheet-root" data-state={dialogState}>
          {children}
        </div>
      );
    },
    Trigger: ({ children }: any) => {
      const handleClick = () => {
        dialogState = 'open';
        onOpenChangeCallback?.(true);
      };
      return (
        <button data-testid="sheet-trigger" onClick={handleClick}>
          {children}
        </button>
      );
    },
    Portal: ({ children }: any) => <div data-testid="sheet-portal">{children}</div>,
    Overlay: ({ className, ...props }: any) => <div data-testid="sheet-overlay" className={className} {...props} />,
    Content: ({ className, children, ...props }: any) => (
      <div data-testid="sheet-content" data-state={dialogState} className={className} {...props}>
        {children}
      </div>
    ),
    Title: ({ className, children, ...props }: any) => (
      <div data-testid="sheet-title" className={className} {...props}>
        {children}
      </div>
    ),
    Description: ({ className, children, ...props }: any) => (
      <div data-testid="sheet-description" className={className} {...props}>
        {children}
      </div>
    ),
    Close: ({ children }: any) => {
      const handleClick = () => {
        dialogState = 'closed';
        onOpenChangeCallback?.(false);
      };
      return (
        <button data-testid="sheet-close" onClick={handleClick}>
          {children}
        </button>
      );
    },
  };
});

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
}));

// Mock class-variance-authority
vi.mock('class-variance-authority', () => {
  return {
    cva: () => {
      return ({ side }: any) => `sheet-${side}`;
    },
  };
});

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Sheet components', () => {
  describe('SheetContent', () => {
    it('renders with default props (right side)', () => {
      render(
        <Sheet>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );

      const content = screen.getByTestId('sheet-content');
      expect(content).toBeInTheDocument();
      expect(content.className).toContain('sheet-right');
      expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });

    it('renders with custom side', () => {
      render(
        <Sheet>
          <SheetContent side="left">Sheet content</SheetContent>
        </Sheet>
      );

      const content = screen.getByTestId('sheet-content');
      expect(content.className).toContain('sheet-left');
    });

    it('applies custom className', () => {
      render(
        <Sheet>
          <SheetContent className="custom-sheet">Sheet content</SheetContent>
        </Sheet>
      );

      const content = screen.getByTestId('sheet-content');
      expect(content.className).toContain('custom-sheet');
    });
  });

  describe('SheetHeader', () => {
    it('renders with default props', () => {
      render(<SheetHeader>Header content</SheetHeader>);

      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('flex flex-col space-y-2');
    });

    it('applies custom className', () => {
      render(<SheetHeader className="custom-header">Header content</SheetHeader>);

      const header = screen.getByText('Header content');
      expect(header.className).toContain('custom-header');
    });
  });

  describe('SheetFooter', () => {
    it('renders with default props', () => {
      render(<SheetFooter>Footer content</SheetFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer.className).toContain('flex flex-col-reverse');
    });

    it('applies custom className', () => {
      render(<SheetFooter className="custom-footer">Footer content</SheetFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer.className).toContain('custom-footer');
    });
  });

  describe('SheetTitle', () => {
    it('renders with default props', () => {
      render(<SheetTitle>Sheet Title</SheetTitle>);

      const title = screen.getByTestId('sheet-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Sheet Title');
      expect(title.className).toContain('text-lg font-semibold');
    });

    it('applies custom className', () => {
      render(<SheetTitle className="custom-title">Sheet Title</SheetTitle>);

      const title = screen.getByTestId('sheet-title');
      expect(title.className).toContain('custom-title');
    });
  });

  describe('SheetDescription', () => {
    it('renders with default props', () => {
      render(<SheetDescription>Sheet description</SheetDescription>);

      const description = screen.getByTestId('sheet-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Sheet description');
      expect(description.className).toContain('text-sm text-muted-foreground');
    });

    it('applies custom className', () => {
      render(<SheetDescription className="custom-description">Sheet description</SheetDescription>);

      const description = screen.getByTestId('sheet-description');
      expect(description.className).toContain('custom-description');
    });
  });

  describe('Sheet integration', () => {
    it('renders a complete sheet with all components', () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>Sheet description text.</SheetDescription>
            </SheetHeader>
            <div>Main content</div>
            <SheetFooter>
              <SheetClose>Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
      expect(screen.getByText('Open Sheet')).toBeInTheDocument();
    });
  });
});
