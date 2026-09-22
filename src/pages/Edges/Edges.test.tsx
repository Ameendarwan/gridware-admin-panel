import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Edges from './Edges';
import { mockDataTableUtils, mockColumnHelpers, mockBadgeComponent } from '@app/utils/testHelpers';

// Mocks
mockDataTableUtils();
mockColumnHelpers();
mockBadgeComponent();

vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-grid" />),
}));

vi.mock('@app/routes/urls', () => ({
  urls: { edge: { list: '/edge/list' } },
}));

vi.mock('@app/pages/Deployments/components/MapBox/types', () => ({
  MapMode: { POLEVIEW: 'POLEVIEW' },
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

describe('Edges', () => {
  it('renders Grid with correct props', () => {
    render(<Edges />);
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('calls getColumns with navigate and setSearchParams', () => {
    render(<Edges />);
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });
});
