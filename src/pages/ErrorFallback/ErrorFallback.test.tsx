import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorFallback from './ErrorFallback';
import { vi } from 'vitest';

// Module-level navigate mock
const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('ErrorFallback', () => {
  const error = new Error('Test error message');
  error.name = 'TestError';
  error.stack = 'stacktrace...';
  const resetErrorBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error info and messages', () => {
    render(
      <MemoryRouter>
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Oops...')).toBeInTheDocument();
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    expect(screen.getByText(/TestError: Test error message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to the homepage/i })).toBeInTheDocument();
    expect(screen.getByText(/stack trace/i)).toBeInTheDocument();
    expect(screen.getByText(/stacktrace/)).toBeInTheDocument();
  });

  it('calls resetErrorBoundary and navigate on button click', () => {
    render(
      <MemoryRouter>
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /return to the homepage/i }));
    expect(resetErrorBoundary).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
