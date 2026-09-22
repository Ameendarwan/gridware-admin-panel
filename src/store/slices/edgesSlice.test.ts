import { describe, it, expect } from 'vitest';
import {
  edgesReducer,
  setEdges,
  clearEdges,
  updateEdge,
  deleteEdge,
  setEdgesMap,
  setSelectedEdgeId,
  setIsSelectingEdge,
  setSelectedFromPole,
  setSelectedToPole,
  setIsSelectingFromPole,
  setIsSelectingToPole,
  setSelectedPoleEdges,
  setIsDuplicateEdge,
  setMode,
  setDeploymentId,
  setSpansList,
  setSpansData,
  setDrawingSpanPole,
  removeDrawingSpanPole,
  clearDrawingSpanPoles,
  getMode,
  getEdgesMap,
  getIsSelectingEdge,
  getSelectedEdge,
  getSelectedPoleEdges,
  getIsDuplicateEdge,
  getAllDrawingSpanPoles,
  EdgesState,
} from './edgesSlice';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';

// Helper functions
function createMockSpan(overrides = {}) {
  return {
    id: 1,
    type: 'primary' as any,
    value: true,
    color: '#DE3D82',
    phase: 1,
    line: 1,
    selected: false,
    isDisabled: false,
    isNew: false,
    ...overrides,
  };
}

function createMockEdge(overrides = {}) {
  return {
    id: 1,
    from_pole_id: 1,
    to_pole_id: 2,
    spans: [createMockSpan(), createMockSpan({ id: 2, type: 'secondary' as any, color: '#34AE1C', phase: 2, line: 2 })],
    deployment_id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    ...overrides,
  };
}

function getInitialEdgesState(): EdgesState {
  return {
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
  };
}

// Mock types
const mockSpan1 = createMockSpan();

const mockSpan2 = createMockSpan({ id: 2, type: 'secondary' as any, color: '#34AE1C', phase: 2, line: 2 });

const mockEdge = createMockEdge();

const mockEdge2 = createMockEdge({
  id: 2,
  from_pole_id: 2,
  to_pole_id: 3,
  spans: [mockSpan1],
  created_at: '2023-01-02',
  updated_at: '2023-01-02',
});

const mockPole = {
  id: 1,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  created_by: 'test-user',
  updated_by: null,
  pole_id: 'POLE-001',
  lat: 40.7128,
  long: -74.006,
  status: 'active',
  status_type: null,
  status_reason: null,
  suitable_for_install: true,
  network_strength: null,
  solar_strength: null,
  primary_circuit_protective_equipment: false,
  surveyor_notes: null,
  installation_notes: null,
  vegetation_notes: null,
  vegetation_condition: null,
  gate_unlock_mobile_no: null,
  gate_unlock_address: null,
  gate_unlock_instructions: null,
  deployment_id: 1,
  enabled_spans_count: 0,
  transmission_configuration: null,
  distribution_configuration: null,
  equipments: [],
  is_miscellaneous: false,
  is_archived: false,
  images: [],
  is_eppe_complete_v2: false,
  has_span_connected: false,
  is_new_pole: null,
  is_new_pole_type: null,
  is_new_pole_reason: null,
  is_new_pole_notes: null,
  is_new_pole_images: [],
  is_new_pole_equipments: [],
  is_new_pole_transmission_configuration: null,
  is_new_pole_distribution_configuration: null,
  is_new_pole_enabled_spans_count: 0,
  is_new_pole_suitable_for_install: null,
  is_new_pole_network_strength: null,
  is_new_pole_solar_strength: null,
  is_new_pole_primary_circuit_protective_equipment: null,
  is_new_pole_surveyor_notes: null,
  is_new_pole_installation_notes: null,
  is_new_pole_vegetation_notes: null,
  is_new_pole_vegetation_condition: null,
  is_new_pole_gate_unlock_mobile_no: null,
  is_new_pole_gate_unlock_address: null,
  is_new_pole_gate_unlock_instructions: null,
  installed_at: null,
  disabled: false,
};

const mockSpanData = {
  id: 1,
  name: 'Span 1',
  edge_id: 1,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

const initialState: EdgesState = getInitialEdgesState();

describe('edgesSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(edgesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setEdges', () => {
      const edges = [mockEdge, mockEdge2];
      const actual = edgesReducer(initialState, setEdges(edges));
      expect(actual.edgesList).toEqual(edges);
    });

    it('should handle clearEdges', () => {
      const stateWithEdges = {
        ...initialState,
        edgesList: [mockEdge, mockEdge2],
      };
      const actual = edgesReducer(stateWithEdges, clearEdges());
      expect(actual.edgesList).toEqual([]);
    });

    it('should handle updateEdge', () => {
      const stateWithEdges = {
        ...initialState,
        edgesList: [mockEdge, mockEdge2],
      };
      const updateData = {
        id: 1,
        newData: {
          from_pole_id: 5,
          to_pole_id: 6,
          spans: [
            {
              id: 3,
              type: 'conductor' as any,
              value: true,
              color: 'blue',
              phase: 3,
              line: 3,
              selected: false,
              isDisabled: false,
              isNew: true,
            },
          ],
        },
      };
      const actual = edgesReducer(stateWithEdges, updateEdge(updateData));

      const updatedEdge = actual.edgesList.find(edge => edge.id === 1);
      expect(updatedEdge?.from_pole_id).toBe(5);
      expect(updatedEdge?.to_pole_id).toBe(6);
      expect(updatedEdge?.spans).toEqual([
        mockSpan1,
        mockSpan2,
        {
          id: 3,
          type: 'conductor' as any,
          value: true,
          color: 'blue',
          phase: 3,
          line: 3,
          selected: false,
          isDisabled: false,
          isNew: true,
        },
      ]);
    });

    it('should handle updateEdge with -1 pole ids', () => {
      const stateWithEdges = {
        ...initialState,
        edgesList: [mockEdge],
      };
      const updateData = {
        id: 1,
        newData: {
          from_pole_id: -1,
          to_pole_id: -1,
        },
      };
      const actual = edgesReducer(stateWithEdges, updateEdge(updateData));

      const updatedEdge = actual.edgesList.find(edge => edge.id === 1);
      expect(updatedEdge?.from_pole_id).toBe(1); // Should keep original
      expect(updatedEdge?.to_pole_id).toBe(2); // Should keep original
    });

    it('should handle updateEdge for non-existent edge', () => {
      const stateWithEdges = {
        ...initialState,
        edgesList: [mockEdge],
      };
      const updateData = {
        id: 999,
        newData: { from_pole_id: 5 },
      };
      const actual = edgesReducer(stateWithEdges, updateEdge(updateData));
      expect(actual.edgesList).toEqual([mockEdge]);
    });

    it('should handle deleteEdge', () => {
      const stateWithEdges = {
        ...initialState,
        edgesList: [mockEdge, mockEdge2],
        edgesMap: { 1: mockEdge, 2: mockEdge2 },
      };
      const actual = edgesReducer(stateWithEdges, deleteEdge(1));

      expect(actual.edgesList).toEqual([mockEdge2]);
      expect(actual.edgesMap).toEqual({ 2: mockEdge2 });
    });

    it('should handle setEdgesMap', () => {
      const edgesMap = { 1: mockEdge, 2: mockEdge2 };
      const actual = edgesReducer(initialState, setEdgesMap(edgesMap));
      expect(actual.edgesMap).toEqual(edgesMap);
    });

    it('should handle setSelectedEdgeId', () => {
      const actual = edgesReducer(initialState, setSelectedEdgeId(5));
      expect(actual.selectedEdgeId).toBe(5);
    });

    it('should handle setIsSelectingEdge with null', () => {
      const actual = edgesReducer(initialState, setIsSelectingEdge(null));
      expect(actual.isSelectingEdge).toBe(null);
    });

    it('should handle setIsSelectingEdge with undefined', () => {
      const actual = edgesReducer(initialState, setIsSelectingEdge(undefined));
      expect(actual.isSelectingEdge).toBeGreaterThan(0);
      expect(typeof actual.isSelectingEdge).toBe('number');
    });

    it('should handle setIsSelectingFromPole', () => {
      const actual = edgesReducer(initialState, setIsSelectingFromPole(true));
      expect(actual.isSelectingFromPole).toBe(true);
    });

    it('should handle setIsSelectingToPole', () => {
      const actual = edgesReducer(initialState, setIsSelectingToPole(true));
      expect(actual.isSelectingToPole).toBe(true);
    });

    it('should handle setSelectedFromPole', () => {
      const actual = edgesReducer(initialState, setSelectedFromPole(10));
      expect(actual.selectedFromPole).toBe(10);
    });

    it('should handle setSelectedToPole', () => {
      const actual = edgesReducer(initialState, setSelectedToPole(20));
      expect(actual.selectedToPole).toBe(20);
    });

    it('should handle setSelectedPoleEdges', () => {
      const poleEdges = [1, 2, 3];
      const actual = edgesReducer(initialState, setSelectedPoleEdges(poleEdges));
      expect(actual.selectedPoleEdges).toEqual(poleEdges);
    });

    it('should handle setMode', () => {
      const actual = edgesReducer(initialState, setMode(MapMode.EDGEEDIT));
      expect(actual.mode).toBe(MapMode.EDGEEDIT);
    });

    it('should handle setDeploymentId', () => {
      const actual = edgesReducer(initialState, setDeploymentId(100));
      expect(actual.deploymentId).toBe(100);
    });

    it('should handle setDeploymentId with undefined', () => {
      const actual = edgesReducer(initialState, setDeploymentId(undefined));
      expect(actual.deploymentId).toBeUndefined();
    });

    it('should handle setIsDuplicateEdge', () => {
      const actual = edgesReducer(initialState, setIsDuplicateEdge(true));
      expect(actual.isDuplicateEdge).toBe(true);
    });

    it('should handle setSpansList', () => {
      const spansList = ['span1', 'span2', 'span3'];
      const actual = edgesReducer(initialState, setSpansList(spansList));
      expect(actual.spansList).toEqual(spansList);
    });

    it('should handle setSpansData', () => {
      const spansData = [mockSpanData];
      const actual = edgesReducer(initialState, setSpansData(spansData));
      expect(actual.spansData).toEqual(spansData);
    });

    it('should handle setDrawingSpanPole', () => {
      const actual = edgesReducer(initialState, setDrawingSpanPole(mockPole));
      expect(actual.drawingSpanPoles).toEqual([mockPole]);
    });

    it('should handle multiple setDrawingSpanPole calls', () => {
      const state1 = edgesReducer(initialState, setDrawingSpanPole(mockPole));
      const mockPole2 = { ...mockPole, id: 2, name: 'Pole 2' };
      const state2 = edgesReducer(state1, setDrawingSpanPole(mockPole2));
      expect(state2.drawingSpanPoles).toEqual([mockPole, mockPole2]);
    });

    it('should handle removeDrawingSpanPole with null (pop)', () => {
      const stateWithPoles = {
        ...initialState,
        drawingSpanPoles: [mockPole, { ...mockPole, id: 2 }],
      };
      const actual = edgesReducer(stateWithPoles, removeDrawingSpanPole(null));
      expect(actual.drawingSpanPoles).toEqual([mockPole]);
    });

    it('should handle removeDrawingSpanPole with specific pole', () => {
      const mockPole2 = { ...mockPole, id: 2, name: 'Pole 2' };
      const stateWithPoles = {
        ...initialState,
        drawingSpanPoles: [mockPole, mockPole2],
      };
      const actual = edgesReducer(stateWithPoles, removeDrawingSpanPole(mockPole));
      expect(actual.drawingSpanPoles).toEqual([mockPole2]);
    });

    it('should handle removeDrawingSpanPole with non-existent pole', () => {
      const stateWithPoles = {
        ...initialState,
        drawingSpanPoles: [mockPole],
      };
      const nonExistentPole = { ...mockPole, id: 999 };
      const actual = edgesReducer(stateWithPoles, removeDrawingSpanPole(nonExistentPole));
      expect(actual.drawingSpanPoles).toEqual([mockPole]);
    });

    it('should handle clearDrawingSpanPoles', () => {
      const stateWithPoles = {
        ...initialState,
        drawingSpanPoles: [mockPole, { ...mockPole, id: 2 }],
      };
      const actual = edgesReducer(stateWithPoles, clearDrawingSpanPoles());
      expect(actual.drawingSpanPoles).toEqual([]);
    });
  });

  describe('selectors', () => {
    const mockState = {
      edges: {
        ...initialState,
        mode: MapMode.EDGEEDIT,
        edgesMap: { 1: mockEdge },
        isSelectingEdge: 123456789,
        selectedEdgeId: 5,
        selectedPoleEdges: [1, 2, 3],
        isDuplicateEdge: true,
        drawingSpanPoles: [mockPole],
      },
      // Mock API slice states
      deploymentsApi: { queries: {}, mutations: {}, provided: {}, subscriptions: {}, config: {} },
      poleApi: { queries: {}, mutations: {}, provided: {}, subscriptions: {}, config: {} },
      edgeApi: { queries: {}, mutations: {}, provided: {}, subscriptions: {}, config: {} },
      devicesApi: { queries: {}, mutations: {}, provided: {}, subscriptions: {}, config: {} },
      validationApi: { queries: {}, mutations: {}, provided: {}, subscriptions: {}, config: {} },
      poles: { poles: [], selectedPoleId: null, isLoading: false },
      sidebars: { isOpen: false },
    } as any;

    it('should select mode', () => {
      expect(getMode(mockState)).toBe(MapMode.EDGEEDIT);
    });

    it('should select edgesMap', () => {
      expect(getEdgesMap(mockState)).toEqual({ 1: mockEdge });
    });

    it('should select isSelectingEdge', () => {
      expect(getIsSelectingEdge(mockState)).toBe(123456789);
    });

    it('should select selectedEdge', () => {
      expect(getSelectedEdge(mockState)).toBe(5);
    });

    it('should select selectedPoleEdges', () => {
      expect(getSelectedPoleEdges(mockState)).toEqual([1, 2, 3]);
    });

    it('should select isDuplicateEdge', () => {
      expect(getIsDuplicateEdge(mockState)).toBe(true);
    });

    it('should select allDrawingSpanPoles', () => {
      expect(getAllDrawingSpanPoles(mockState)).toEqual([mockPole]);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const originalState = { ...initialState };
      edgesReducer(initialState, setEdges([mockEdge]));
      expect(initialState).toEqual(originalState);
    });

    it('should create new state objects', () => {
      const state1 = edgesReducer(initialState, setEdges([mockEdge]));
      const state2 = edgesReducer(state1, setSelectedEdgeId(5));

      expect(state1).not.toBe(state2);
      expect(state1.selectedEdgeId).toBe(-1);
      expect(state2.selectedEdgeId).toBe(5);
    });
  });

  describe('action creators', () => {
    it('should create setEdges action', () => {
      const edges = [mockEdge];
      const action = setEdges(edges);
      expect(action.type).toBe('edges/setEdges');
      expect(action.payload).toEqual(edges);
    });

    it('should create clearEdges action', () => {
      const action = clearEdges();
      expect(action.type).toBe('edges/clearEdges');
      expect(action.payload).toBeUndefined();
    });

    it('should create updateEdge action', () => {
      const updateData = { id: 1, newData: { from_pole_id: 5 } };
      const action = updateEdge(updateData);
      expect(action.type).toBe('edges/updateEdge');
      expect(action.payload).toEqual(updateData);
    });

    it('should create deleteEdge action', () => {
      const action = deleteEdge(1);
      expect(action.type).toBe('edges/deleteEdge');
      expect(action.payload).toBe(1);
    });
  });

  describe('multiple actions sequence', () => {
    it('should handle multiple actions in sequence', () => {
      let state = edgesReducer(initialState, setEdges([mockEdge, mockEdge2]));
      state = edgesReducer(state, setSelectedEdgeId(1));
      state = edgesReducer(state, setMode(MapMode.EDGEEDIT));
      state = edgesReducer(state, setIsDuplicateEdge(true));

      expect(state.edgesList).toHaveLength(2);
      expect(state.selectedEdgeId).toBe(1);
      expect(state.mode).toBe(MapMode.EDGEEDIT);
      expect(state.isDuplicateEdge).toBe(true);
    });

    it('should handle edge operations in sequence', () => {
      let state = edgesReducer(initialState, setEdges([mockEdge, mockEdge2]));
      state = edgesReducer(state, updateEdge({ id: 1, newData: { from_pole_id: 10 } }));
      state = edgesReducer(state, deleteEdge(2));

      expect(state.edgesList).toHaveLength(1);
      expect(state.edgesList[0].from_pole_id).toBe(10);
      expect(state.edgesList[0].id).toBe(1);
    });
  });
});
