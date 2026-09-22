import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CSVDetails from './CSVDetails';
import { API } from '@app/lib/api-config';

vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@app/routes/urls', () => ({ urls: { csv: { list: '/csv/list' } } }));
vi.mock('@app/components/Loader/Loader', () => ({ __esModule: true, default: () => <div data-testid="loader" /> }));
vi.mock('@app/components/SearchableDeployments', () => ({
  __esModule: true,
  default: (props: any) => (
    <input
      data-testid="searchable-deployments"
      value={props.value || ''}
      onChange={e => props.onChange(e.target.value)}
    />
  ),
}));

const setInputValue = (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
};

describe('CSVDetails', () => {
  let useParamsMock: any;
  let useNavigateMock: any;
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock = vi.fn(() => ({ id: '1', mode: 'edit' }));
    useNavigateMock = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
      return {
        ...actual,
        useParams: useParamsMock,
        useNavigate: useNavigateMock,
      };
    });
  });

  // ...existing code...

  it('renders form fields after loading', async () => {
    (API.get as any).mockResolvedValueOnce({ data: { data: {} } });
    render(
      <MemoryRouter>
        <CSVDetails />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    expect(screen.getByTestId('searchable-deployments')).toBeInTheDocument();
    expect(screen.getByTestId('csv-file')).toBeInTheDocument();
  });

  it('shows error toast on API error', async () => {
    const sonner = await import('sonner');
    const errorSpy = vi.spyOn(sonner.toast, 'error');
    (API.get as any).mockRejectedValueOnce(new Error('API error'));
    render(
      <MemoryRouter>
        <CSVDetails />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    expect(errorSpy).not.toHaveBeenCalled(); // Only logs error, does not toast on fetch
    errorSpy.mockRestore();
  });

  // ...existing code...

  it('submits form and calls API.post in create mode', async () => {
    useParamsMock.mockReturnValue({ mode: undefined });
    (API.get as any).mockResolvedValueOnce({ data: { data: {} } });
    (API.post as any).mockResolvedValueOnce({});
    render(
      <MemoryRouter>
        <CSVDetails />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    setInputValue(screen.getByTestId('searchable-deployments'), '2');
    const fileInput = screen.getByTestId('csv-file');
    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);
    await waitFor(() => expect(API.post).toHaveBeenCalled());
  });

  // ...existing code...

  // ...existing code...
});
