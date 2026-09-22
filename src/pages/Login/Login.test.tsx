import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { vi } from 'vitest';

// Mock dependencies
const loginWithRedirect = vi.fn();
const navigate = vi.fn();
let mockUser: any = undefined;
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ loginWithRedirect, user: mockUser }),
}));
vi.mock('js-cookie', () => ({
  default: { get: vi.fn(() => undefined) },
}));
vi.mock('@app/routes/urls', () => ({ urls: { users: { list: '/users' } } }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => navigate, useLocation: () => ({ state: undefined }) };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login button and calls loginWithRedirect on click', () => {
    mockUser = undefined;
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const btn = screen.getByRole('button', { name: /continue/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(loginWithRedirect).toHaveBeenCalled();
  });

  it('redirects if user is present', () => {
    mockUser = { name: 'Ameen' };
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(navigate).toHaveBeenCalledWith('/users', { replace: true });
  });
});
