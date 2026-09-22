import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from './Toaster';

// Mock the useToast hook
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [
      {
        id: 'toast-1',
        title: 'Test Toast Title',
        description: 'Test Toast Description',
        variant: 'default',
      },
      {
        id: 'toast-2',
        title: 'Another Toast',
        variant: 'destructive',
      },
    ],
  }),
}));

// Mock Toast components
vi.mock('@app/components/Toast/Toast', () => {
  return {
    Toast: ({ children, ...props }: React.PropsWithChildren<any>) => (
      <div data-testid="toast" data-toast-props={JSON.stringify(props)}>
        {children}
      </div>
    ),
    ToastClose: () => <button data-testid="toast-close">Close</button>,
    ToastDescription: ({ children }: React.PropsWithChildren<any>) => (
      <div data-testid="toast-description">{children}</div>
    ),
    ToastProvider: ({ children }: React.PropsWithChildren<any>) => <div data-testid="toast-provider">{children}</div>,
    ToastTitle: ({ children }: React.PropsWithChildren<any>) => <div data-testid="toast-title">{children}</div>,
    ToastViewport: () => <div data-testid="toast-viewport" />,
  };
});

describe('Toaster component', () => {
  it('renders the ToastProvider', () => {
    render(<Toaster />);

    const provider = screen.getByTestId('toast-provider');
    expect(provider).toBeInTheDocument();
  });

  it('renders the ToastViewport', () => {
    render(<Toaster />);

    const viewport = screen.getByTestId('toast-viewport');
    expect(viewport).toBeInTheDocument();
  });

  it('renders multiple toasts from the useToast hook', () => {
    render(<Toaster />);

    const toasts = screen.getAllByTestId('toast');
    expect(toasts).toHaveLength(2);
  });

  it('renders toast with title and description', () => {
    render(<Toaster />);

    const titles = screen.getAllByTestId('toast-title');
    const descriptions = screen.getAllByTestId('toast-description');

    expect(titles[0]).toHaveTextContent('Test Toast Title');
    expect(descriptions[0]).toHaveTextContent('Test Toast Description');
  });

  it('renders toast with title only', () => {
    render(<Toaster />);

    const titles = screen.getAllByTestId('toast-title');
    const descriptions = screen.getAllByTestId('toast-description');

    expect(titles[1]).toHaveTextContent('Another Toast');
    expect(descriptions).toHaveLength(1); // Only one description for the first toast
  });

  it('passes variant prop to Toast component', () => {
    render(<Toaster />);

    const toasts = screen.getAllByTestId('toast');
    const firstToastProps = JSON.parse(toasts[0].dataset.toastProps || '{}');
    const secondToastProps = JSON.parse(toasts[1].dataset.toastProps || '{}');

    expect(firstToastProps.variant).toBe('default');
    expect(secondToastProps.variant).toBe('destructive');
  });

  it('renders close button for each toast', () => {
    render(<Toaster />);

    const closeButtons = screen.getAllByTestId('toast-close');
    expect(closeButtons).toHaveLength(2);
  });
});
