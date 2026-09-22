import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Users from './Users';
import Grid from '@app/components/Grid';
import { mockDataTableUtils, mockColumnHelpers, mockSVGIconComponent } from '@app/utils/testHelpers';

// Mocks
mockDataTableUtils();
mockColumnHelpers();
mockSVGIconComponent();

vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-grid" />),
}));

vi.mock('@app/routes/urls', () => ({
  urls: { users: { list: '/users/list', create: '/users/create' } },
}));

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Users', () => {
  const renderUsers = () => {
    render(<Users />);
  };

  it('renders Grid with correct props', () => {
    renderUsers();
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('calls navigate with correct url when New User button is clicked', () => {
    vi.mocked(Grid).mockImplementationOnce(({ onButtonClick }: any) => (
      <button data-testid="new-user-btn" onClick={onButtonClick}>
        New User
      </button>
    ));
    renderUsers();
    const btn = screen.getByTestId('new-user-btn');
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/users/create');
  });
});
