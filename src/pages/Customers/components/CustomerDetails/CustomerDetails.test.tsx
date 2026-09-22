import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CustomerDetails from './CustomerDetails';
import * as apiConfig from '@app/lib/api-config';
import * as sonner from 'sonner';
import {
  mockCardComponents,
  mockFormComponents,
  mockButtonComponent,
  mockInputComponent,
  mockLoaderComponent,
} from '@app/utils/testHelpers';

// Mocks
mockCardComponents();
mockFormComponents();
mockButtonComponent();
mockInputComponent();
mockLoaderComponent();

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('@app/lib/api-config', () => {
  const mockAPI = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockUseParams.mockClear();
  (apiConfig.API.get as any).mockReset();
  (apiConfig.API.post as any).mockReset();
  (apiConfig.API.patch as any).mockReset();
  (sonner.toast.success as any).mockClear();
  (sonner.toast.error as any).mockClear();
});

describe('CustomerDetails', () => {
  it('renders loader when loading', async () => {
    mockUseParams.mockReturnValue({ id: '1', mode: 'edit' });
    (apiConfig.API.get as any).mockImplementation(() => {
      return new Promise(() => {}); // never resolves
    });
    render(<CustomerDetails />);

    // Wait for the loader to appear
    await waitFor(() => {
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  it('fetches and displays customer data in edit mode', async () => {
    mockUseParams.mockReturnValue({ id: '1', mode: 'edit' });
    (apiConfig.API.get as any).mockResolvedValueOnce({
      data: {
        data: {
          name: 'Test Customer',
          description: 'Desc',
          gridware_id: 'uuid',
          created_by: 'admin',
          updated_by: 'admin2',
        },
      },
    });
    render(<CustomerDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('customer-name')).toHaveValue('Test Customer');
      expect(screen.getByTestId('customer-description')).toHaveValue('Desc');
      expect(screen.getByTestId('customer-gridware-id')).toHaveValue('uuid');
      expect(screen.getByTestId('customer-created-by')).toHaveValue('admin');
      expect(screen.getByTestId('customer-updated-by')).toHaveValue('admin2');
    });
  });

  it('calls navigate on cancel', async () => {
    mockUseParams.mockReturnValue({ id: '1', mode: 'edit' });
    (apiConfig.API.get as any).mockResolvedValueOnce({
      data: { data: { name: '', description: '', gridware_id: '', created_by: '', updated_by: '' } },
    });
    render(<CustomerDetails />);
    await waitFor(() => expect(screen.getByTestId('cancel-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(mockNavigate).toHaveBeenCalled();
  });
});
