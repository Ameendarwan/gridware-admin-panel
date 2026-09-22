import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from './Toast';

// Mock cn utility
vi.mock('@app/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />
}));

// Mock Radix UI Toast primitives
vi.mock('@radix-ui/react-toast', () => {
  const React = require('react');
  
  return {
    Provider: ({ children, ...props }: React.PropsWithChildren<any>) => (
      <div data-testid="toast-provider" {...props}>
        {children}
      </div>
    ),
    Viewport: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="toast-viewport" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
    Root: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="toast-root" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
    Action: React.forwardRef(({ children, className, altText, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <button data-testid="toast-action" className={className} aria-label={altText} ref={ref} {...props}>
        {children}
      </button>
    )),
    Close: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <button data-testid="toast-close" className={className} ref={ref} {...props}>
        {children}
      </button>
    )),
    Title: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="toast-title" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
    Description: React.forwardRef(({ children, className, ...props }: React.PropsWithChildren<any>, ref: any) => (
      <div data-testid="toast-description" className={className} ref={ref} {...props}>
        {children}
      </div>
    )),
    Arrow: ({ className, ...props }: any) => (
      <div data-testid="toast-arrow" className={className} {...props} />
    ),
  };
});

describe('Toast components', () => {
  describe('ToastProvider', () => {
    it('renders with children', () => {
      render(
        <ToastProvider>
          <div>Provider content</div>
        </ToastProvider>
      );
      
      const provider = screen.getByTestId('toast-provider');
      expect(provider).toBeInTheDocument();
      expect(provider).toHaveTextContent('Provider content');
    });
  });

  describe('ToastViewport', () => {
    it('renders with default props', () => {
      render(<ToastViewport />);
      
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport.className).toContain('fixed');
      expect(viewport.className).toContain('top-0');
      expect(viewport.className).toContain('z-[100]');
      expect(viewport.className).toContain('flex');
      expect(viewport.className).toContain('max-h-screen');
      expect(viewport.className).toContain('w-full');
    });

    it('applies custom className', () => {
      render(<ToastViewport className="custom-viewport" />);
      
      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport.className).toContain('custom-viewport');
    });
  });

  describe('Toast', () => {
    it('renders with default variant', () => {
      render(
        <Toast>
          <div>Toast content</div>
        </Toast>
      );
      
      const toast = screen.getByTestId('toast-root');
      expect(toast).toBeInTheDocument();
      expect(toast.className).toContain('border');
      expect(toast.className).toContain('bg-background');
      expect(toast.className).toContain('text-foreground');
      expect(toast).toHaveTextContent('Toast content');
    });

    it('renders with destructive variant', () => {
      render(
        <Toast variant="destructive">
          <div>Destructive toast</div>
        </Toast>
      );
      
      const toast = screen.getByTestId('toast-root');
      expect(toast.className).toContain('destructive');
      expect(toast.className).toContain('border-destructive');
      expect(toast.className).toContain('bg-destructive');
      expect(toast.className).toContain('text-destructive-foreground');
    });

    it('renders with success variant', () => {
      render(
        <Toast variant="success">
          <div>Success toast</div>
        </Toast>
      );
      
      const toast = screen.getByTestId('toast-root');
      expect(toast.className).toContain('bg-green-100');
      expect(toast.className).toContain('text-green-800');
    });

    it('applies custom className', () => {
      render(
        <Toast className="custom-toast">
          <div>Toast content</div>
        </Toast>
      );
      
      const toast = screen.getByTestId('toast-root');
      expect(toast.className).toContain('custom-toast');
    });
  });

  describe('ToastAction', () => {
    it('renders with default props', () => {
      render(
        <ToastAction altText="Action">
          Action text
        </ToastAction>
      );
      
      const action = screen.getByTestId('toast-action');
      expect(action).toBeInTheDocument();
      expect(action.className).toContain('inline-flex');
      expect(action.className).toContain('h-8');
      expect(action.className).toContain('shrink-0');
      expect(action).toHaveTextContent('Action text');
      expect(action).toHaveAttribute('aria-label', 'Action');
    });

    it('applies custom className', () => {
      render(
        <ToastAction altText="Action" className="custom-action">
          Action text
        </ToastAction>
      );
      
      const action = screen.getByTestId('toast-action');
      expect(action.className).toContain('custom-action');
    });
  });

  describe('ToastClose', () => {
    it('renders with default props', () => {
      render(<ToastClose />);
      
      const close = screen.getByTestId('toast-close');
      expect(close).toBeInTheDocument();
      expect(close.className).toContain('absolute');
      expect(close.className).toContain('top-2');
      expect(close.className).toContain('right-2');
      expect(close.className).toContain('rounded-md');
      
      const icon = screen.getByTestId('x-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ToastClose className="custom-close" />);
      
      const close = screen.getByTestId('toast-close');
      expect(close.className).toContain('custom-close');
    });
  });

  describe('ToastTitle', () => {
    it('renders with default props', () => {
      render(
        <ToastTitle>
          Toast title
        </ToastTitle>
      );
      
      const title = screen.getByTestId('toast-title');
      expect(title).toBeInTheDocument();
      expect(title.className).toContain('text-sm');
      expect(title.className).toContain('font-semibold');
      expect(title).toHaveTextContent('Toast title');
    });

    it('applies custom className', () => {
      render(
        <ToastTitle className="custom-title">
          Toast title
        </ToastTitle>
      );
      
      const title = screen.getByTestId('toast-title');
      expect(title.className).toContain('custom-title');
    });
  });

  describe('ToastDescription', () => {
    it('renders with default props', () => {
      render(
        <ToastDescription>
          Toast description
        </ToastDescription>
      );
      
      const description = screen.getByTestId('toast-description');
      expect(description).toBeInTheDocument();
      expect(description.className).toContain('text-sm');
      expect(description.className).toContain('opacity-90');
      expect(description).toHaveTextContent('Toast description');
    });

    it('applies custom className', () => {
      render(
        <ToastDescription className="custom-description">
          Toast description
        </ToastDescription>
      );
      
      const description = screen.getByTestId('toast-description');
      expect(description.className).toContain('custom-description');
    });
  });

  it('renders a complete toast example', () => {
    render(
      <ToastProvider>
        <Toast>
          <div className="grid gap-1">
            <ToastTitle>Toast Title</ToastTitle>
            <ToastDescription>Toast description text</ToastDescription>
          </div>
          <ToastAction altText="Action">Action</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toast-root')).toBeInTheDocument();
    expect(screen.getByTestId('toast-title')).toHaveTextContent('Toast Title');
    expect(screen.getByTestId('toast-description')).toHaveTextContent('Toast description text');
    expect(screen.getByTestId('toast-action')).toHaveTextContent('Action');
    expect(screen.getByTestId('toast-close')).toBeInTheDocument();
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
  });
});
