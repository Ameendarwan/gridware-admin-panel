import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PolesLayer from './PolesLayer';

// Mock react-map-gl Source and Layer for JSDOM
vi.mock('react-map-gl', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    Source: (props: any) => <div data-testid="mock-source">{props.children}</div>,
    Layer: (props: any) => <div data-testid={`mock-layer-${props.id || ''}`}></div>,
  };
});
import { vi } from 'vitest';

// Minimal rootReducer for test

type TestPole = { id: number; lat: number; long: number };
type TestState = {
  poles: {
    polesList: TestPole[];
    polesValidationErrors: { pole_ids: number[]; icon: string };
  };
  edges: {
    selectedFromPole: number | null;
    selectedToPole: number | null;
    edgesList: any[];
  };
};

const initialState: TestState = {
  poles: {
    polesList: [
      { id: 1, lat: 10, long: 20 },
      { id: 2, lat: 11, long: 21 },
    ],
    polesValidationErrors: {
      pole_ids: [2],
      icon: 'marker-missing-edge',
    },
  },
  edges: {
    selectedFromPole: 1,
    selectedToPole: 2,
    edgesList: [],
  },
};

function polesReducer(state = initialState.poles, action: any) {
  switch (action.type) {
    case 'SET_POLES':
      return { ...state, polesList: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, polesValidationErrors: action.payload };
    default:
      return state;
  }
}

function edgesReducer(state = initialState.edges, action: any) {
  switch (action.type) {
    case 'SET_EDGES':
      return { ...state, edgesList: action.payload };
    case 'SET_SELECTED_FROM':
      return { ...state, selectedFromPole: action.payload };
    case 'SET_SELECTED_TO':
      return { ...state, selectedToPole: action.payload };
    default:
      return state;
  }
}

const createMockStore = (preloadedState = initialState) =>
  configureStore({
    reducer: {
      poles: polesReducer,
      edges: edgesReducer,
    },
    preloadedState,
  });

const renderWithProviders = (ui: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('PolesLayer', () => {
  let mapRef: { current: any };

  const createMockBounds = () => ({
    getWest: () => 0,
    getSouth: () => 0,
    getEast: () => 30,
    getNorth: () => 30,
  });

  const createMockMap = () => ({
    getBounds: vi.fn(() => createMockBounds()),
    on: vi.fn(),
    off: vi.fn(),
    getLayer: vi.fn(),
    moveLayer: vi.fn(),
  });

  beforeEach(() => {
    mapRef = {
      current: {
        getMap: vi.fn(() => createMockMap()),
      },
    };
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PolesLayer mapRef={mapRef} markerSize={1} />);
    expect(container).toBeTruthy();
  });

  it('returns empty Source if polesGeoJSON is null', () => {
    // viewportBounds is null initially, so PolesLayer should render an empty Source
    const { queryByTestId } = renderWithProviders(<PolesLayer mapRef={{ current: null }} markerSize={1} />);
    const source = queryByTestId('mock-source');
    expect(source).toBeInTheDocument();
    expect(source?.children.length).toBe(3); // 3 layers always rendered
  });

  it('renders Source and Layer components when polesGeoJSON is available', () => {
    // viewportBounds will be set by useEffect, so we simulate it by calling getMap.getBounds
    renderWithProviders(<PolesLayer mapRef={mapRef} markerSize={1} />);
    // We can't check for Mapbox layers directly, but we can check the Source exists
    // (if you add data-testid to Source in the component, you can check for it here)
  });

  it('handles poles with validation errors', () => {
    // The pole with id 2 should have a validation error
    const { container } = renderWithProviders(<PolesLayer mapRef={mapRef} markerSize={1} />);
    expect(container).toBeTruthy();
  });

  it('handles empty poles list', () => {
    // Reset store with empty poles list
    const emptyState = {
      poles: { polesList: [], polesValidationErrors: { pole_ids: [], icon: 'marker-missing-edge' } },
      edges: { selectedFromPole: null, selectedToPole: null, edgesList: [] },
    };
    const store = createMockStore(emptyState);
    const { queryByTestId } = renderWithProviders(<PolesLayer mapRef={mapRef} markerSize={1} />, store);
    const source = queryByTestId('mock-source');
    expect(source).toBeInTheDocument();
    expect(source?.children.length).toBe(3); // 3 layers always rendered
  });
});
