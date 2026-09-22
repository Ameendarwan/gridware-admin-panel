import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PublicInfoCircuit from './PublicInfoCircuit';
import {
  mockDataTableUtils,
  mockColumnHelpers,
  mockBadgeComponent,
  mockTruncatedTextCell,
} from '@app/utils/testHelpers';

// Mocks
mockDataTableUtils();
mockColumnHelpers();
mockBadgeComponent();
mockTruncatedTextCell();

const mockNavigate = vi.fn();

vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: ({ url, buttonText, onButtonClick, getColumns }: any) => (
    <div>
      <button data-testid="new-circuit-btn" onClick={onButtonClick}>
        {buttonText}
      </button>
      <div data-testid="grid-url">{url}</div>
      <div data-testid="columns">{JSON.stringify(getColumns())}</div>
    </div>
  ),
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
    useNavigate: () => mockNavigate,
    useSearchParams: () => [undefined, vi.fn()],
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

describe('PublicInfoCircuit', () => {
  it('renders Grid with correct props', () => {
    render(<PublicInfoCircuit />);
    expect(screen.getByTestId('grid-url')).toHaveTextContent('/circuit/all');
    expect(screen.getByTestId('new-circuit-btn')).toHaveTextContent('New Circuit');
    expect(screen.getByTestId('columns')).toBeInTheDocument();
  });

  it('calls navigate to create on button click', async () => {
    render(<PublicInfoCircuit />);
    fireEvent.click(screen.getByTestId('new-circuit-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/circuit/create');
  });

  it('getColumns returns expected columns', async () => {
    const { getColumns } = await import('./PublicInfoCircuit');
    const mockNavigate = vi.fn();
    const mockSetSearchParams = vi.fn();
    const columns = getColumns(mockNavigate, mockSetSearchParams);
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });
});
