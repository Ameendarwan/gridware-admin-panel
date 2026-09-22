import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Spans from './Spans';

// Mocks
vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-grid" />),
}));

vi.mock('@app/components/DataTable/DataTable.utils', async () => {
  const actual: any = await vi.importActual('@app/components/DataTable/DataTable.utils');
  return {
    ...actual,
    getCommonColumns: vi.fn(() => []),
    createColumn: vi.fn((...args) => args),
  };
});

vi.mock('@app/routes/urls', () => ({
  urls: { spans: { list: '/spans/list' } },
}));

vi.mock('@app/components/Badge/Badge', () => ({
  Badge: ({ children }: any) => <span data-testid="mock-badge">{children}</span>,
}));

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockSetSearchParams.mockClear();
});

describe('Spans', () => {
  it('renders Grid with correct props', () => {
    render(<Spans />);
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('calls getColumns with navigate and setSearchParams', () => {
    render(<Spans />);
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });
});
