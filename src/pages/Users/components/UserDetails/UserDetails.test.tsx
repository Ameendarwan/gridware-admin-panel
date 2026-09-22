import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserDetails from './UserDetails';

// Mocks
vi.mock('@app/components/Card/Card', () => ({
  Card: ({ children }: any) => <div data-testid="mock-card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="mock-card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="mock-card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="mock-card-title">{children}</div>,
}));

vi.mock('@app/components/Form/Form', async () => {
  const actual = await vi.importActual<any>('@app/components/Form/Form');
  return {
    ...actual,
    FormControl: ({ children }: any) => <div>{children}</div>,
    FormDescription: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@app/components/Input/Input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@app/components/Loader/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));

vi.mock('@app/components/Switch/Switch', () => ({
  Switch: (props: any) => (
    <input
      type="checkbox"
      data-testid="is-invited-to-auth0"
      checked={props.checked}
      onChange={e => props.onCheckedChange(e.target.checked)}
      disabled={props.disabled}
    />
  ),
}));

const mockNavigate = vi.fn();
const mockParams = { id: '1', mode: 'edit' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

vi.mock('@app/lib/api-config', () => {
  const mockAPI = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return { API: mockAPI };
});

vi.mock('sonner', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };
  return { toast: mockToast };
});

let API: any;

beforeEach(async () => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  API = (await import('@app/lib/api-config')).API;
});

describe('UserDetails', () => {
  it('renders loader when loading', async () => {
    API.get.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<UserDetails />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('fetches and displays user data in edit mode', async () => {
    API.get.mockResolvedValueOnce({
      data: {
        data: { email: 'test@example.com', is_invited_to_auth0: true, created_by: 'admin', updated_by: 'admin2' },
      },
    });
    render(<UserDetails />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin2')).toBeInTheDocument();
    });
  });

  it('calls navigate on cancel', async () => {
    API.get.mockResolvedValueOnce({
      data: { data: { email: '', is_invited_to_auth0: false, created_by: '', updated_by: '' } },
    });
    render(<UserDetails />);
    await waitFor(() => expect(screen.getByTestId('cancel-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(mockNavigate).toHaveBeenCalled();
  });
});
