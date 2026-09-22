import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import SideFilters from './SideFilters';
import { configureStore } from '@reduxjs/toolkit';
import { deploymentsApi } from '@app/store/apis/deployments/deployments';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { sidebarsReducer } from '@app/store/slices/sidebarsSlice';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock useExportDeployment hook
vi.mock('@app/hooks/useExportDeployment', () => ({
  default: () => ({
    isLoading: false,
    isFetching: false,
    data: null,
    resetWarningsCheck: vi.fn(),
    isCheckingWarnings: false,
    showWarningsModal: false,
    handleProceedWithWarnings: vi.fn(),
    handleCancelExport: vi.fn(),
  }),
}));

// Mock useErrorMessage hook
vi.mock('@app/hooks/useErrorMessage', () => ({
  default: () => 'Test error message',
}));

// Mock validation API
vi.mock('@app/store/apis/validation/validation', () => ({
  useValidateDeploymentMutation: () => [vi.fn(), { isLoading: false }],
  useLazyGetValidationResultsQuery: () => [vi.fn()],
}));

// Mock deployments API
vi.mock('@app/store/apis/deployments/deployments', async () => {
  const actual = await vi.importActual('@app/store/apis/deployments/deployments');
  return {
    ...actual,
    useGetDeploymentByIdQuery: () => ({
      data: {
        data: {
          id: '123',
          name: 'Test Deployment',
          location: 'Test Location',
          poles_count: 10,
        },
      },
      isLoading: false,
      isError: false,
    }),
    useExportDeploymentQuery: () => ({
      data: {
        data: {
          id: '123',
          name: 'Test Deployment',
          location: 'Test Location',
          poles_count: 10,
        },
      },
      isLoading: false,
    }),
    useExportDeploymentGqlQuery: () => ({
      data: {
        status: 200,
        message: 'Logs processed successfully',
        data: {
          warnings: [],
          errors: [],
          poles_created: [],
          poles_updated: [],
          poles_skipped: [],
          device_installs_created: [],
          device_installs_skipped: [],
          pole_neighbors_created: 0,
          pole_neighbors_skipped: 0,
          pole_equipment_updated: [],
          pole_equipment_skipped: [],
          photos_uploaded: [],
          photos_skipped: [],
        },
      },
      isLoading: false,
    }),
  };
});

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      sidebars: sidebarsReducer,
      edges: edgesReducer,
      poles: polesReducer,
      [deploymentsApi.reducerPath]: deploymentsApi.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(deploymentsApi.middleware),
  });
};

// Setup wrapper component
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('SideFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    renderWithProviders(<SideFilters />);
    expect(screen.getByText('Test Deployment')).toBeInTheDocument();
  });

  it('toggles collapse state when collapse button is clicked', async () => {
    renderWithProviders(<SideFilters />);
    const collapseButton = screen.getByTestId('side-filter-collapse-btn');

    expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();

    fireEvent.click(collapseButton);
    await waitFor(() => {
      expect(screen.queryByTestId('side-filter-deployment-name')).not.toBeInTheDocument();
    });

    fireEvent.click(collapseButton);
    await waitFor(() => {
      expect(screen.getByTestId('side-filter-deployment-name')).toBeInTheDocument();
    });
  });

  it('displays deployment details when expanded', () => {
    renderWithProviders(<SideFilters />);
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
