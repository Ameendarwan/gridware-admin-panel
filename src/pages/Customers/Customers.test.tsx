import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Customers from './Customers';

// Mocks
vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: ({ url, buttonText, onButtonClick, getColumns }: any) => (
    <div>
      <div data-testid="mock-grid-url">{url}</div>
      <button data-testid="mock-grid-btn" onClick={onButtonClick}>
        {buttonText}
      </button>
      <div data-testid="mock-grid-cols">{JSON.stringify(getColumns())}</div>
    </div>
  ),
}));

vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  createColumn: vi.fn((id, label, render, type, opts) => ({ id, label, render, type, ...opts })),
  getCommonColumns: vi.fn(() => [{ id: 'common', label: 'Common' }]),
  formatDate: vi.fn(v => `formatted-${v}`),
  TextCell: ({ row, accessorKey, transform }: any) => (
    <span data-testid={`textcell-${accessorKey}`}>{transform ? transform(row[accessorKey]) : row[accessorKey]}</span>
  ),
}));

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [null, mockSetSearchParams],
  };
});

vi.mock('@app/routes/urls', () => ({
  urls: {
    customers: {
      list: '/customers',
      create: '/customers/create',
    },
  },
}));

describe('Customers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Grid with correct props', () => {
    render(<Customers />);
    expect(screen.getByTestId('mock-grid-url')).toHaveTextContent('/customer/all');
    expect(screen.getByTestId('mock-grid-btn')).toHaveTextContent('New Customer');
    expect(screen.getByTestId('mock-grid-cols').textContent).toContain('id');
    expect(screen.getByTestId('mock-grid-cols').textContent).toContain('name');
    expect(screen.getByTestId('mock-grid-cols').textContent).toContain('created_at');
    expect(screen.getByTestId('mock-grid-cols').textContent).toContain('updated_at');
  });

  it('navigates to create page on button click', () => {
    render(<Customers />);
    fireEvent.click(screen.getByTestId('mock-grid-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers/create');
  });
});
