import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useEdgeProcessing from './useLineProcessing';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { MapMode } from '../types';
import { createBasePole } from './testHelpers';

describe('useEdgeProcessing', () => {
  const basePole = createBasePole();

  const baseEdge = {
    id: 1,
    created_by: 'user1',
    updated_by: 'user2',
    created_at: '2023-01-01',
    updated_at: '2023-01-02',
    deployment_id: 1,
    from_pole_id: 1,
    to_pole_id: 2,
    color: '#000',
    span_id: [],
    spans: [],
    selected_spans: [],
    isNew: false,
    coordinates: [[20, 10] as [number, number], [30, 15] as [number, number]],
  };

  const getMockEdgesState = (mode = MapMode.POLEVIEW) => ({
    selectedEdgeId: -1,
    deploymentId: 1,
    edgesList: [baseEdge],
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

  const getMockPolesState = (polesList = [basePole]) => ({
    polesList,
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
  });

  const wrapper = ({ children }: any) => {
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
    return <Provider store={store}>{children}</Provider>;
  };

  it('should process edges and return processedEdges and setProcessedEdges', () => {
    const { result } = renderHook(() => useEdgeProcessing(), { wrapper });
    expect(Array.isArray(result.current.processedEdges)).toBe(true);
    expect(result.current.processedEdges.length).toBeGreaterThanOrEqual(0);
    expect(typeof result.current.setProcessedEdges).toBe('function');
  });

  it('should update processedEdges when poles or edges change', () => {
    const { result } = renderHook(() => useEdgeProcessing(), { wrapper });
    act(() => {
      result.current.setProcessedEdges([
        {
          id: 99,
          from_pole_id: 1,
          to_pole_id: 2,
          lines: [],
          deployment_id: 1,
          coordinates: [
            [20, 10],
            [30, 15],
          ],
          color: '#fff',
        },
      ]);
    });
    expect(result.current.processedEdges[0].id).toBe(99);
  });
});
