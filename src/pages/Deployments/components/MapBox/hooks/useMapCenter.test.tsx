import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import useMapCenter from './useMapCenter';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { MapMode } from '../types';
import { vi } from 'vitest';
import { createBasePole } from './testHelpers';

let mockPoleId: string | null = '1';
vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSearchParams: () => [
      {
        get: (key: string) => (key === 'pole_id' ? mockPoleId : null),
      },
    ],
  };
});

describe('useMapCenter', () => {
  const basePole = createBasePole();

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

  const getMockPolesState = (polesList = [basePole], poleSidebarCloseClicked = false, mapRef = undefined) => ({
    polesList,
    isAddingPole: false,
    isMovingPole: false,
    isMeasuringDistance: false,
    measureDistancePoints: null,
    mapRef,
    newPoleCoordinates: undefined,
    selectedPole: null,
    polesValidationErrors: undefined,
    selectedPoleIdForValidation: -1,
    poleSidebarCloseClicked,
    isPoleLoading: false,
    gpsLocationCoordinates: null,
    searchTerm: '',
  });

  const wrapper = (
    poles: any[],
    poleSidebarCloseClicked = false,
    mapRef: any = undefined,
    mode: MapMode = MapMode.POLEVIEW
  ) => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      const store = configureStore({
        reducer: {
          edges: edgesReducer,
          poles: polesReducer,
        },
        preloadedState: {
          edges: getMockEdgesState(mode),
          poles: getMockPolesState(poles, poleSidebarCloseClicked, mapRef),
        },
      });
      return (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      );
    };
  };

  const createTwoPoles = () => [
    createBasePole({ id: 1, lat: 10, long: 20 }),
    createBasePole({ id: 2, lat: 20, long: 30 }),
  ];

  const assertDefaultMapValues = (result: any) => {
    expect(result.current.latitude).toBe(33);
    expect(result.current.longitude).toBe(70);
    expect(result.current.zoom).toBe(4);
  };

  it('should center and zoom to selected pole if pole_id param is present', () => {
    mockPoleId = '1';
    const { result } = renderHook(() => useMapCenter({ data: [basePole] }), { wrapper: wrapper([basePole]) });
    expect(result.current.latitude).toBe(basePole.lat);
    expect(result.current.longitude).toBe(basePole.long);
    expect(result.current.zoom).toBeGreaterThanOrEqual(17);
  });

  it('should center and zoom to fit all poles if no pole_id and not EDGEVIEW', () => {
    mockPoleId = null;
    const poles = createTwoPoles();
    const { result } = renderHook(() => useMapCenter({ data: poles }), { wrapper: wrapper(poles) });
    expect(result.current.latitude).toBeCloseTo(15);
    expect(result.current.longitude).toBeCloseTo(25);
    expect(result.current.zoom).toBeLessThanOrEqual(15);
  });

  it('should not recenter if poleSidebarCloseClicked is true', () => {
    mockPoleId = null;
    const poles = createTwoPoles();
    const { result } = renderHook(() => useMapCenter({ data: poles }), { wrapper: wrapper(poles, true) });
    assertDefaultMapValues(result);
  });

  it('should not fit all poles if mode is EDGEVIEW', () => {
    mockPoleId = null;
    const poles = createTwoPoles();
    const { result } = renderHook(() => useMapCenter({ data: poles }), {
      wrapper: wrapper(poles, false, undefined, MapMode.EDGEVIEW),
    });
    assertDefaultMapValues(result);
  });
});
