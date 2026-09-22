import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import MapBox from './MapBox';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { sidebarsReducer } from '@app/store/slices/sidebarsSlice';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  Map: vi.fn().mockImplementation(({ children, onLoad, ...props }) => {
    // Simulate map load
    if (onLoad) {
      setTimeout(() => onLoad(), 0);
    }
    return (
      <div data-testid="mock-mapbox" {...props}>
        {children}
      </div>
    );
  }),
  MapRef: vi.fn(),
}));

// Mock the map layers
vi.mock('@app/pages/Deployments/components/MapBox/components/LinesLayer', () => ({
  default: vi.fn(() => <div data-testid="lines-layer" />),
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/PolesLayer', () => ({
  default: vi.fn(() => <div data-testid="poles-layer" />),
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/MapControlsLayer', () => ({
  default: vi.fn(() => <div data-testid="map-controls-layer" />),
}));

vi.mock('./components/MarkerLayer', () => ({
  default: vi.fn(() => <div data-testid="marker-layer" />),
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/TestOverlay', () => ({
  default: vi.fn(() => <div data-testid="test-overlay" />),
}));

// Mock hooks
vi.mock('@app/hooks/useDebounce', () => ({
  useDebounce: vi.fn(value => value),
}));

vi.mock('@app/pages/Deployments/components/MapBox/hooks/useLineProcessing', () => ({
  default: vi.fn(() => ({
    processedEdges: [],
    setProcessedEdges: vi.fn(),
  })),
}));

vi.mock('@app/pages/Deployments/components/MapBox/hooks/useMapCenter', () => ({
  default: vi.fn(() => ({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 10,
    setLatitude: vi.fn(),
    setLongitude: vi.fn(),
    setZoom: vi.fn(),
  })),
}));

vi.mock('@app/pages/Deployments/components/MapBox/hooks/useMapInteractions', () => ({
  default: vi.fn(() => ({
    selectedLayer: null,
    selectedLineId: null,
    handleSelectPole: vi.fn(),
    handleMapClick: vi.fn(),
    handleViewStateChange: vi.fn(),
    updateBounds: vi.fn(),
  })),
}));

// Mock services
vi.mock('@app/services/mapTestUtils', () => ({
  mapTestUtils: {
    setMapRef: vi.fn(),
    setReduxState: vi.fn(),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock entire API modules
vi.mock('@app/store/apis/deployments/deployments', () => {
  const mockApi = {
    reducerPath: 'deploymentsApi',
    reducer: vi.fn(),
    middleware: vi.fn(),
    util: {
      invalidateTags: vi.fn(),
    },
  };

  return {
    deploymentsApi: mockApi,
    useGetPolesByDeploymentIdQuery: vi.fn(() => ({
      data: null,
      isLoading: true,
      isError: false,
    })),
    useGetDeploymentByIdQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: false,
    })),
  };
});

vi.mock('@app/store/apis/edge/edge', () => {
  const mockApi = {
    reducerPath: 'edgeApi',
    reducer: vi.fn(),
    middleware: vi.fn(),
    util: {
      invalidateTags: vi.fn(),
    },
  };

  return {
    edgeApi: mockApi,
    useGetEdgesByIdQuery: vi.fn(() => ({
      data: null,
      isLoading: true,
      isError: false,
    })),
    useGetSpansByDeploymentIdQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: false,
    })),
  };
});

vi.mock('@app/store/apis/pole/pole', () => {
  const mockApi = {
    reducerPath: 'poleApi',
    reducer: vi.fn(),
    middleware: vi.fn(),
  };

  return {
    poleApi: mockApi,
    useGetPoleByIdQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isFetching: false,
      isError: false,
    })),
  };
});

// Mock API config
vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
  },
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_REACT_APP_MAPBOX_KEY: 'test-mapbox-key',
  },
});

// Mock data
const mockPoles = {
  data: [
    {
      id: 1,
      pole_id: 'P1',
      lat: 40.7128,
      long: -74.006,
      status: 'installed',
      is_eppe_complete_v2: true,
      equipments: [],
      is_miscellaneous: false,
      is_archived: false,
      disabled: false,
    },
    {
      id: 2,
      pole_id: 'P2',
      lat: 40.7129,
      long: -74.007,
      status: 'pending',
      is_eppe_complete_v2: true,
      equipments: [],
      is_miscellaneous: false,
      is_archived: false,
      disabled: false,
    },
  ],
};

const mockEdges = {
  data: {
    records: [
      {
        id: 1,
        deployment_id: 1,
        from_pole_id: 1,
        to_pole_id: 2,
        coordinates: [
          [40.7128, -74.006],
          [40.7129, -74.007],
        ],
      },
    ],
    count: 1,
  },
};

const mockSpans = {
  data: {
    records: [
      {
        id: 1,
        type: 'Primary',
        phase: 1,
        line: 1,
      },
    ],
  },
};

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  const mockApi = {
    reducerPath: 'api',
    reducer: vi.fn(() => ({})),
    middleware: vi.fn(() => () => () => {}),
  };

  return configureStore({
    reducer: {
      edges: edgesReducer,
      poles: polesReducer,
      sidebars: sidebarsReducer,
      api: mockApi.reducer,
    },
    preloadedState: {
      edges: {
        selectedEdgeId: -1,
        deploymentId: undefined,
        edgesList: [],
        edgesMap: {},
        selectedPoleEdges: [],
        isSelectingFromPole: false,
        isSelectingToPole: false,
        selectedFromPole: -1,
        selectedToPole: -1,
        mode: MapMode.NOVIEW,
        isSelectingEdge: null,
        isDuplicateEdge: false,
        spansList: [],
        spansData: [],
        drawingSpanPoles: [],
      },
      poles: {
        polesList: [],
        isAddingPole: false,
        isMovingPole: false,
        isMeasuringDistance: false,
        measureDistancePoints: null,
        mapRef: undefined,
        newPoleCoordinates: undefined,
        selectedPole: null,
        polesValidationErrors: undefined,
        selectedPoleIdForValidation: -1,
        gpsLocationCoordinates: null,
        poleSidebarCloseClicked: false,
        isPoleLoading: false,
        searchTerm: undefined,
      },
      sidebars: {
        isMainSidebarCollapsed: false,
        isSidebarFiltersCollapsed: false,
      },
      api: {},
      ...initialState,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['poles/setMapRef'],
          ignoredPaths: ['poles.mapRef'],
        },
      }).concat(mockApi.middleware),
  });
};

// Helper function to render component with providers
const renderWithProviders = (ui: React.ReactElement, { store = createMockStore(), route = '/deployments/1' } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
};

// Helper to render MapBox with default setup
const renderMapBox = (options = {}) => {
  return renderWithProviders(<MapBox />, options);
};

describe('MapBox Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loader when poles are loading', async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery } = await import('@app/store/apis/edge/edge');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      renderMapBox();

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show loader when edges are loading', async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery } = await import('@app/store/apis/edge/edge');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: mockPoles,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      renderWithProviders(<MapBox />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Successful Rendering', () => {
    beforeEach(async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery, useGetSpansByDeploymentIdQuery } = await import('@app/store/apis/edge/edge');
      const { useGetPoleByIdQuery } = await import('@app/store/apis/pole/pole');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: mockPoles,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: mockEdges,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetSpansByDeploymentIdQuery).mockReturnValue({
        data: mockSpans,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetPoleByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isFetching: false,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);
    });

    it('should render mapbox container when data is loaded', async () => {
      renderWithProviders(<MapBox />);

      await waitFor(() => {
        expect(screen.getByTestId('mapbox-container')).toBeInTheDocument();
      });
    });

    it('should render mock mapbox component', async () => {
      renderWithProviders(<MapBox />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
      });
    });

    it('should render all map layers', async () => {
      renderWithProviders(<MapBox />);

      await waitFor(() => {
        expect(screen.getByTestId('marker-layer')).toBeInTheDocument();
        expect(screen.getByTestId('lines-layer')).toBeInTheDocument();
        expect(screen.getByTestId('poles-layer')).toBeInTheDocument();
        expect(screen.getByTestId('map-controls-layer')).toBeInTheDocument();
        expect(screen.getByTestId('test-overlay')).toBeInTheDocument();
      });
    });

    it('should pass correct props to mapbox component', async () => {
      renderWithProviders(<MapBox />);

      await waitFor(() => {
        const mapbox = screen.getByTestId('mock-mapbox');
        expect(mapbox).toHaveAttribute('longitude', '-74.006');
        expect(mapbox).toHaveAttribute('latitude', '40.7128');
        expect(mapbox).toHaveAttribute('zoom', '10');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle poles fetch error', async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery, useGetSpansByDeploymentIdQuery } = await import('@app/store/apis/edge/edge');
      const { useGetPoleByIdQuery } = await import('@app/store/apis/pole/pole');
      const { toast } = await import('sonner');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: mockEdges,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetSpansByDeploymentIdQuery).mockReturnValue({
        data: mockSpans,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetPoleByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isFetching: false,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      renderWithProviders(<MapBox />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error Fetching poles', { duration: 8000 });
      });
    });
  });

  describe('Component Structure', () => {
    it('should render with correct test ID', async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery } = await import('@app/store/apis/edge/edge');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: mockPoles,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: mockEdges,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      renderWithProviders(<MapBox />);

      await waitFor(() => {
        expect(screen.getByTestId('mapbox-container')).toBeInTheDocument();
      });
    });

    it('should have correct container classes', async () => {
      const { useGetPolesByDeploymentIdQuery, useGetDeploymentByIdQuery } = await import('@app/store/apis/deployments/deployments');
      const { useGetEdgesByIdQuery } = await import('@app/store/apis/edge/edge');

      vi.mocked(useGetPolesByDeploymentIdQuery).mockReturnValue({
        data: mockPoles,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetEdgesByIdQuery).mockReturnValue({
        data: mockEdges,
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(useGetDeploymentByIdQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as any);

      renderWithProviders(<MapBox />);

      await waitFor(() => {
        const container = screen.getByTestId('mapbox-container');
        expect(container).toHaveClass('flex', 'h-full', 'w-full');
      });
    });
  });
});
