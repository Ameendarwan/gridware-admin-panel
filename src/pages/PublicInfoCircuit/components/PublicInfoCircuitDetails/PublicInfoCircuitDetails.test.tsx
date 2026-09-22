import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PublicInfoCircuitDetails from './PublicInfoCircuitDetails';

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
  default: () => <div data-testid="mock-loader" />,
}));

vi.mock('@app/components/JSONEditor', () => ({
  __esModule: true,
  default: ({ name, initialValue }: any) => (
    <div data-testid="mock-json-editor">
      {name}:{JSON.stringify(initialValue)}
    </div>
  ),
}));

vi.mock('@app/components/SearchableDeployments/SearchableDeployments', () => ({
  __esModule: true,
  default: ({ value }: any) => <div data-testid="mock-searchable-deployments">{value}</div>,
}));

vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@app/routes/urls', () => ({
  urls: {
    publicInfoCircuit: { list: '/circuit/list', create: '/circuit/create' },
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1', mode: 'edit' }),
  };
});

let API: any;
let toast: any;

beforeEach(async () => {
  vi.clearAllMocks();
  API = (await import('@app/lib/api-config')).API;
  toast = (await import('sonner')).toast;
  API.get.mockReset();
  API.post.mockReset();
  API.patch.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
});

describe('PublicInfoCircuitDetails', () => {
  it('renders loader when loading', async () => {
    API.get.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<PublicInfoCircuitDetails />);
    expect(screen.getByTestId('mock-loader')).toBeInTheDocument();
  });

  it('fetches and displays circuit data in edit mode', async () => {
    API.get.mockResolvedValueOnce({
      data: { data: { deployment_id: 123, created_by: 'admin', updated_by: 'admin2', coordinates: [1, 2, 3] } },
    });
    render(<PublicInfoCircuitDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-searchable-deployments')).toHaveTextContent('123');
      expect(screen.getByTestId('mock-json-editor')).toHaveTextContent('coordinates');
    });
  });

  it('submits form and calls API.patch for edit', async () => {
    const spy = vi.spyOn(await import('react-router-dom'), 'useParams').mockReturnValue({ id: '1', mode: 'edit' });
    API.get.mockResolvedValueOnce({
      data: { data: { deployment_id: 123, created_by: '', updated_by: '', coordinates: [] } },
    });
    API.patch.mockResolvedValueOnce({});
    render(<PublicInfoCircuitDetails />);
    await waitFor(() => expect(screen.getByTestId('save-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('save-btn'));
    await waitFor(() => {
      expect(API.patch).toHaveBeenCalledWith('/circuit/1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Circuit updated successfully');
    });
    spy.mockRestore();
  });

  it('shows error toast on API failure during save', async () => {
    const spy = vi.spyOn(await import('react-router-dom'), 'useParams').mockReturnValue({ id: '1', mode: 'edit' });
    API.get.mockResolvedValueOnce({
      data: { data: { deployment_id: 123, created_by: '', updated_by: '', coordinates: [] } },
    });
    API.patch.mockRejectedValueOnce(new Error('Save error'));
    render(<PublicInfoCircuitDetails />);
    await waitFor(() => expect(screen.getByTestId('save-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('save-btn'));
    await waitFor(() => {
      expect(API.patch).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
    spy.mockRestore();
  });

  it('calls navigate on cancel', async () => {
    const spy = vi.spyOn(await import('react-router-dom'), 'useParams').mockReturnValue({ id: '1', mode: 'edit' });
    API.get.mockResolvedValueOnce({
      data: { data: { deployment_id: 123, created_by: '', updated_by: '', coordinates: [] } },
    });
    const mockNavigate = vi.fn();
    vi.spyOn(await import('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    render(<PublicInfoCircuitDetails />);
    await waitFor(() => expect(screen.getByTestId('cancel-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(mockNavigate).toHaveBeenCalled();
    spy.mockRestore();
  });
});
