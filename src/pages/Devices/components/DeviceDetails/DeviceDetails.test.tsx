import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeviceDetails from './DeviceDetails';
import { MemoryRouter, useParams } from 'react-router-dom';
import { vi, beforeEach } from 'vitest';

// Mocks need to be defined before vi.mock calls
const navigate = vi.fn();

vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@app/components/Loader/Loader', () => ({ default: () => <div data-testid="loader" /> }));
vi.mock('@app/components/SearchablePoles', () => ({ default: () => <div data-testid="searchable-poles" /> }));
vi.mock('@app/components/Switch/Switch', async () => ({
  Switch: () => <div data-testid="mock-switch" />,
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
    useParams: vi.fn(),
  };
});

// Helper to render with router and params
function renderWithParams(params: any) {
  (useParams as any).mockReturnValue(params);
  return render(
    <MemoryRouter>
      <DeviceDetails />
    </MemoryRouter>
  );
}

describe('DeviceDetails', () => {
  let API: any;
  let toast: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import mocked modules
    API = (await import('@app/lib/api-config')).API;
    toast = (await import('sonner')).toast;
  });

  it('fetches and displays device data in edit mode', async () => {
    API.get.mockResolvedValueOnce({
      data: { data: { serial_no: 'GS12345678', type: 'GRIDSCOPE', is_blinked: true } },
    });
    renderWithParams({ id: '1', mode: 'edit' });
    await waitFor(
      () => {
        expect(screen.getByDisplayValue('GS12345678')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('submits form and calls API.post for create', async () => {
    API.post.mockResolvedValueOnce({});
    const { container } = renderWithParams({});
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument(), { timeout: 3000 });

    const serialInput = screen.getByTestId('device-serial_no');
    fireEvent.change(serialInput, { target: { value: 'GS12345678' } });

    const typeSelect = container.querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'GRIDSCOPE' } });
    }

    const saveButtons = screen.getAllByTestId('save-btn');
    fireEvent.click(saveButtons[0]);

    await waitFor(
      () => {
        expect(API.post).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Device created successfully');
        expect(navigate).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('shows error toast on API failure during save', async () => {
    API.post.mockRejectedValueOnce(new Error('Save error'));
    const { container } = renderWithParams({});
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument(), { timeout: 3000 });

    const serialInput = screen.getByTestId('device-serial_no');
    fireEvent.change(serialInput, { target: { value: 'GS12345678' } });

    const typeSelect = container.querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'GRIDSCOPE' } });
    }

    const saveButtons = screen.getAllByTestId('save-btn');
    fireEvent.click(saveButtons[0]);

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      },
      { timeout: 3000 }
    );
  });

  it('calls navigate on cancel', async () => {
    renderWithParams({});
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument(), { timeout: 3000 });
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(navigate).toHaveBeenCalled();
  });
});
