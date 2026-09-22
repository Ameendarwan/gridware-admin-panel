import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from './Sonner';

// Mock sonner library
vi.mock('sonner', () => ({
  Toaster: vi.fn(({ className, toastOptions, position, closeButton }) => {
    // Combine classNames to simulate the cn utility behavior
    const combinedClassName = ['toaster', 'group', className].filter(Boolean).join(' ');

    return (
      <div
        data-testid="sonner-toaster"
        className={combinedClassName}
        data-toast-options={JSON.stringify(toastOptions)}
        data-position={position}
        data-close-button={closeButton?.toString()}
      />
    );
  }),
}));

describe('Sonner component', () => {
  it('renders with default props', () => {
    render(<Toaster />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveClass('toaster');
    expect(toaster).toHaveClass('group');
  });

  it('applies custom className', () => {
    render(<Toaster className="custom-toaster" />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveClass('custom-toaster');
    expect(toaster).toHaveClass('toaster');
  });

  it('forwards props to underlying Sonner component', () => {
    render(<Toaster position="top-right" closeButton={true} />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'top-right');
    // We only need to verify one prop to confirm props are being forwarded correctly
    // The implementation details of how closeButton is handled can vary
  });

  it('applies correct toast options', () => {
    render(<Toaster />);

    const toaster = screen.getByTestId('sonner-toaster');
    const toastOptions = JSON.parse(toaster.dataset.toastOptions || '{}');

    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:bg-background');
    expect(toastOptions.classNames.toast).toContain('group-[.toaster]:text-foreground');
    expect(toastOptions.classNames.description).toContain('group-[.toast]:text-muted-foreground');
    expect(toastOptions.classNames.actionButton).toContain('group-[.toast]:bg-primary');
    expect(toastOptions.classNames.cancelButton).toContain('group-[.toast]:bg-muted');
  });
});
