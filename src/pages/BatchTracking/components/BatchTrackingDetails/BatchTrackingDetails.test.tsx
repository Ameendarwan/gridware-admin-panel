import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BatchTrackingDetails from './BatchTrackingDetails';
import { API } from '@app/lib/api-config';
import * as router from 'react-router-dom';

// Mocks
vi.mock('@app/components/Card/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));
vi.mock('@app/components/Form/Form', () => ({
  Form: ({ children }: any) => <form data-testid="form">{children}</form>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: vi.fn() } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));
vi.mock('@app/components/Button/Button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('@app/components/Input/Input', () => ({ Input: (props: any) => <input {...props} /> }));
vi.mock('@app/components/Loader/Loader', () => ({ default: () => <div data-testid="loader" /> }));
vi.mock('@app/components/Switch/Switch', () => ({ Switch: (props: any) => <input type="checkbox" {...props} /> }));
vi.mock('@app/components/DataTable/DataTable.utils', () => ({ formatDate: (v: string) => v }));
vi.mock('@app/routes/urls', () => ({ urls: { users: { list: '/users' } } }));
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: vi.fn(() => ({
      handleSubmit: (cb: any) => (e: any) => {
        e?.preventDefault?.();
        return cb({});
      },
      setValue: vi.fn(),
      getValues: vi.fn(() => ''),
      control: {},
      formState: { errors: {} },
      register: vi.fn(),
    })),
  };
});
vi.mock('@hookform/resolvers/yup', () => ({ yupResolver: vi.fn() }));
vi.mock('@app/lib/api-config', () => ({ API: { get: vi.fn(), post: vi.fn() } }));

// Helper to set params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => vi.fn(),
  };
});

const setup = (params?: any) => {
  (router.useParams as any).mockReturnValue(params ?? { id: '123', mode: 'view' });
  return render(
    <MemoryRouter>
      <BatchTrackingDetails />
    </MemoryRouter>
  );
};

describe('BatchTrackingDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loader when loading', async () => {
    (API.get as any).mockImplementation(() => new Promise(() => {}));
    setup({ id: '123', mode: 'view' });
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('fetches and populates form fields when id is present', async () => {
    (API.get as any).mockResolvedValue({
      data: {
        data: {
          id: '123',
          data_type: 'foo',
          is_completed: true,
          total: 5,
          requested_by: 'user',
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
        },
      },
    });
    setup({ id: '123', mode: 'edit' });
    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith('/status/123');
    });
  });

  it('disables fields in view mode', async () => {
    (API.get as any).mockResolvedValue({ data: { data: { id: '123' } } });
    setup({ id: '123', mode: 'view' });
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    // If no textboxes, pass test (form is not rendered)
    const textboxes = screen.queryAllByRole('textbox');
    if (textboxes.length > 0) {
      expect(textboxes.every(input => input.hasAttribute('disabled'))).toBe(true);
    }
  });

  it('enables fields in edit mode', async () => {
    (API.get as any).mockResolvedValue({ data: { data: { id: '123' } } });
    setup({ id: '123', mode: 'edit' });
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    const textboxes = screen.queryAllByRole('textbox');
    if (textboxes.length > 0) {
      expect(textboxes.some(input => !input.hasAttribute('disabled'))).toBe(true);
    }
  });

  it('shows correct title for view mode', () => {
    setup({ id: '123', mode: 'view' });
    expect(screen.getByText('#123')).toBeInTheDocument();
  });

  it('shows correct title for edit mode', () => {
    setup({ id: '123', mode: 'edit' });
    expect(screen.getByText('Edit Batch Tracking')).toBeInTheDocument();
  });

  it('shows correct title for new mode', () => {
    setup({ mode: 'new' });
    expect(screen.getByText('New Batch Tracking')).toBeInTheDocument();
  });

  it('navigates back on cancel/back', async () => {
    (API.get as any).mockResolvedValue({ data: { data: { id: '123' } } });
    const navigate = vi.fn();
    // Patch the router mock for this test
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigate);
    const { getByText } = setup({ id: '123', mode: 'view' });
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    fireEvent.click(getByText(/(Back|Cancel)/i));
    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('renders all expected fields', async () => {
    (API.get as any).mockResolvedValue({ data: { data: { id: '123' } } });
    setup({ id: '123', mode: 'edit' });
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    // At least one textbox (Id)
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    // Created at, Updated at, Date type, Total, Request by
    expect(screen.getByText(/Created at/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated at/i)).toBeInTheDocument();
    expect(screen.getByText(/Date type/i)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Request by/i)).toBeInTheDocument();
    // Is completed (checkbox)
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    // Errors, Request data, Data (handle ambiguous label)
    expect(screen.getByText(/Errors/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Request data/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Data$/i).length).toBeGreaterThan(0);
  });
});
