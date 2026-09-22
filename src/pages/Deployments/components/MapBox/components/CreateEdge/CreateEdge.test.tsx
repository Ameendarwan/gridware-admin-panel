import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import CreateEdge from './CreateEdge';

// Define the test state type
interface TestState {
  edges: {
    mode: MapMode;
    selectedFromPole: number;
    selectedToPole: number;
    deploymentId: string;
    edgesList: any[];
    selectedEdgeId: number;
  };
  poles: {
    polesList: Array<{ id: number; name: string }>;
  };
}

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the API
vi.mock('@app/lib/api-config', () => ({
  API: {
    get: vi.fn(),
  },
}));

// Mock the SVGIcon component
vi.mock('@app/components/SVGIcon', () => ({
  __esModule: true,
  default: ({ icon }: { icon: string }) => <span data-testid={`svg-icon-${icon}`} />,
}));

// Mock the react-redux hooks
const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: (selector: any) => mockUseSelector(selector),
  };
});

// Mock the react-router-dom
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  UNSAFE_NavigationContext: {
    // mock a navigator with a push method
    Provider: ({ children }: { children: React.ReactNode }) => children,
    // Mock a navigator object structure
    navigator: {
      push: vi.fn(),
      replace: vi.fn(),
    },
  },
}));

// Mock the Redux store
const createMockStore = (initialState: Partial<TestState> = {}) => {
  return configureStore({
    reducer: {
      edges: (state = initialState.edges) => state,
      poles: (state = initialState.poles) => state,
    },
  });
};

// Mock getEdgesMap
const mockGetEdgesMap = vi.fn().mockReturnValue({});

// Mock the Redux actions
const mockActions = {
  setMode: vi.fn(),
  setSelectedFromPole: vi.fn(),
  setSelectedToPole: vi.fn(),
  setIsSelectingFromPole: vi.fn(),
  setIsSelectingToPole: vi.fn(),
  setEdges: vi.fn(),
  setPoles: vi.fn(),
  setSelectedEdgeId: vi.fn(),
  setIsDuplicateEdge: vi.fn(),
};

vi.mock('@app/store/slices/edgesSlice', () => ({
  setMode: (mode: MapMode) => mockActions.setMode(mode),
  setSelectedFromPole: (id: number) => mockActions.setSelectedFromPole(id),
  setSelectedToPole: (id: number) => mockActions.setSelectedToPole(id),
  setIsSelectingFromPole: (value: boolean) => mockActions.setIsSelectingFromPole(value),
  setIsSelectingToPole: (value: boolean) => mockActions.setIsSelectingToPole(value),
  setEdges: (edges: any[]) => mockActions.setEdges(edges),
  setSelectedEdgeId: (id: number) => mockActions.setSelectedEdgeId(id),
  setIsDuplicateEdge: (value: boolean) => mockActions.setIsDuplicateEdge(value),
  getEdgesMap: (state: any) => mockGetEdgesMap(state),
}));

vi.mock('@app/store/slices/polesSlice', () => ({
  setPoles: (poles: any[]) => mockActions.setPoles(poles),
}));

describe('CreateEdge', () => {
  const defaultState: TestState = {
    edges: {
      mode: MapMode.NOVIEW,
      selectedFromPole: 0,
      selectedToPole: 0,
      deploymentId: 'test-deployment',
      edgesList: [],
      selectedEdgeId: 0,
    },
    poles: {
      polesList: [
        { id: 1, name: 'Pole 1' },
        { id: 2, name: 'Pole 2' },
      ],
    },
  };

  // Reset the mock implementation before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation((selector: any) => selector(defaultState));
    mockGetEdgesMap.mockReturnValue({});
  });

  const renderComponent = () => {
    const store = createMockStore(defaultState);
    return render(
      <Provider store={store}>
        <CreateEdge />
      </Provider>
    );
  };

  const getCreateEdgeButton = () => {
    const buttons = screen.getAllByRole('button');
    return buttons.find(button => button.querySelector('[data-testid="svg-icon-add-edge"]'));
  };

  it('renders the create edge button', () => {
    renderComponent();
    const createEdgeButton = getCreateEdgeButton();
    expect(createEdgeButton).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon-add-edge')).toBeInTheDocument();
  });
});
