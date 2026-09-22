import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';
import * as reactRouterDom from 'react-router-dom';
import { vi } from 'vitest';

// Mock navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof reactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('NotFound', () => {
  it('renders 404 and messages', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Oops, something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't find your page/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('calls navigate when Go Back is clicked', () => {
    const navigate = vi.fn();
    vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(navigate);
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(navigate).toHaveBeenCalled();
  });
});
