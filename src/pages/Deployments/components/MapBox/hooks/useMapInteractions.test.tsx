import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MapRef } from 'react-map-gl';
import { vi } from 'vitest';
import useMapInteractions from './useMapInteractions';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { MapMode } from '../types';
import { BrowserRouter } from 'react-router-dom';
import type { EdgeGroup } from '../types';

const getMockEdgesState = (mode = MapMode.POLEVIEW) => ({
  selectedEdgeId: -1,
  deploymentId: 1,
  edgesList: [],
  edgesMap: {},
  isSelectingFromPole: false,
  isSelectingToPole: false,
  selectedFromPole: -1,
  selectedToPole: -1,
  selectedPoleEdges: [],
  mode,
  isSelectingEdge: null,
  isDuplicateEdge: false,
  spansList: [],
  spansData: [],
  drawingSpanPoles: [],
});

const getMockPolesState = (overrides = {}) => ({
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
  poleSidebarCloseClicked: false,
  isPoleLoading: false,
  gpsLocationCoordinates: null,
  searchTerm: '',
  ...overrides,
});

describe('useMapInteractions', () => {
  const processedEdges: EdgeGroup[] = [];
  const setProcessedEdges = vi.fn();
  const setZoom = vi.fn();
  const setLatitude = vi.fn();
  const setLongitude = vi.fn();
  const mapRef = { current: null } as React.MutableRefObject<MapRef | null>;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = configureStore({
      reducer: {
        edges: edgesReducer,
        poles: polesReducer,
      },
      preloadedState: {
        edges: getMockEdgesState(),
        poles: getMockPolesState(),
      },
    });
    return (
      <BrowserRouter>
        <Provider store={store}>{children}</Provider>
      </BrowserRouter>
    );
  };

  it('should initialize and return expected handlers and state', () => {
    const { result } = renderHook(
      () => useMapInteractions(processedEdges, setProcessedEdges, setZoom, setLatitude, setLongitude, mapRef),
      { wrapper }
    );
    expect(result.current).toHaveProperty('selectedLayer');
    expect(result.current).toHaveProperty('selectedLineId');
    expect(typeof result.current.handleMapClick).toBe('function');
    expect(typeof result.current.handleSelectPole).toBe('function');
    expect(typeof result.current.handleDeleteSpecificLine).toBe('function');
    expect(typeof result.current.handleViewStateChange).toBe('function');
    expect(typeof result.current.updateBounds).toBe('function');
  });

  it('should call setProcessedEdges when handleDeleteSpecificLine is called', () => {
    // Simulate React's setState signature: can be value or updater function
    const setProcessedEdgesMock = vi.fn((valueOrUpdater: any) => {
      if (typeof valueOrUpdater === 'function') {
        valueOrUpdater([{ lines: [1, 2, 3] }, { lines: [4, 5, 6] }]);
      }
    });
    const { result } = renderHook(
      () => useMapInteractions(processedEdges, setProcessedEdgesMock, setZoom, setLatitude, setLongitude, mapRef),
      { wrapper }
    );
    act(() => {
      result.current.handleDeleteSpecificLine(1, 1);
    });
    expect(setProcessedEdgesMock).toHaveBeenCalled();
  });

  it('should update bounds when updateBounds is called', () => {
    const getBoundsMock = vi.fn(() => ({
      getWest: () => 1,
      getSouth: () => 2,
      getEast: () => 3,
      getNorth: () => 4,
    }));
    const mapMock = { getMap: () => ({ getBounds: getBoundsMock }) };
    const mapRefMock = { current: mapMock } as unknown as React.MutableRefObject<MapRef | null>;
    const { result } = renderHook(
      () => useMapInteractions(processedEdges, setProcessedEdges, setZoom, setLatitude, setLongitude, mapRefMock),
      { wrapper }
    );
    act(() => {
      result.current.updateBounds();
    });
    expect(getBoundsMock).toHaveBeenCalled();
  });
});
