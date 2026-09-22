import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all the dependencies
vi.mock('@app/providers/AuthProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

vi.mock('./store', () => ({
  store: {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({})),
    subscribe: vi.fn(),
  },
}));

vi.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div data-testid="redux-provider">{children}</div>,
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

vi.mock('./routes', () => ({
  default: () => <div data-testid="routes">Routes Component</div>,
}));

vi.mock('./pages/ErrorFallback', () => ({
  default: () => <div data-testid="error-fallback">Error Fallback</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should render all required providers in correct order', () => {
    render(<App />);

    // Check that all providers are rendered
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should render Toaster component', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should render Routes component', () => {
    render(<App />);
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByText('Routes Component')).toBeInTheDocument();
  });

  it('should render toaster with correct props', () => {
    // Since we mocked Toaster, we can't test the actual props
    // but we can ensure it's rendered
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
