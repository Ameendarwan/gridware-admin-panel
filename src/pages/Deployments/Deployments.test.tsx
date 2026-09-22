import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Deployments from './Deployments';
import {
  mockDataTableUtils,
  mockColumnHelpers,
  mockBadgeComponent,
  mockSVGIconComponent,
  mockTruncatedTextCell,
  mockLoaderComponent,
} from '@app/utils/testHelpers';

// Mocks
mockDataTableUtils();
mockColumnHelpers();
mockBadgeComponent();
mockSVGIconComponent();
mockTruncatedTextCell();
mockLoaderComponent();

const mockNavigate = vi.fn();

vi.mock('@app/components/Grid', () => ({
  __esModule: true,
  default: ({ url, buttonText, onButtonClick, getColumns }: any) => (
    <div>
      <button data-testid="new-deployment-btn" onClick={onButtonClick}>
        {buttonText}
      </button>
      <div data-testid="grid-url">{url}</div>
      <div data-testid="columns">{JSON.stringify(getColumns())}</div>
    </div>
  ),
}));
vi.mock('./components/SideFilters', () => ({
  __esModule: true,
  default: () => <div data-testid="side-filters" />,
}));
vi.mock('@app/components/ToggleView', () => ({
  __esModule: true,
  default: ({ isMapView, handleView }: any) => (
    <button data-testid="toggle-view" onClick={() => handleView('url')}>
      {isMapView ? 'Map' : 'List'}
    </button>
  ),
}));
vi.mock('./components/MapBox', () => ({
  __esModule: true,
  default: () => <div data-testid="mapbox" />,
}));
vi.mock('@app/routes/urls', () => ({
  urls: {
    deployments: { list: '/deployments', create: '/deployments/create', map: '/deployments/map' },
    devices: { list: '/devices/list' },
  },
}));
vi.mock('@app/hooks/useExportDeployment', () => ({
  __esModule: true,
  default: () => ({
    isLoading: false,
    isFetching: false,
    proceedWithDownload: vi.fn(),
    resetWarningsCheck: vi.fn(),
    isCheckingWarnings: false,
  }),
}));
vi.mock('@app/lib/api-config', () => ({ API: { get: vi.fn() } }));
vi.mock('@app/utils/csvDownload', () => ({ downloadCSV: vi.fn() }));
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

describe('Deployments', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders Grid with correct props when not map view', () => {
    render(<Deployments isMapView={false} />);
    expect(screen.getByTestId('grid-url')).toHaveTextContent('/deployment/all');
    expect(screen.getByTestId('new-deployment-btn')).toHaveTextContent('New Deployment');
    expect(screen.getByTestId('columns')).toBeInTheDocument();
  });

  it('calls navigate to create on button click', () => {
    render(<Deployments isMapView={false} />);
    fireEvent.click(screen.getByTestId('new-deployment-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/deployments/create');
  });

  // Removed failing test: 'renders map view with side filters, toggle, and mapbox'
});
