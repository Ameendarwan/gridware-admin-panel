import { describe, it, expect, vi } from 'vitest';
import {
  polesReducer,
  setPoles,
  updatePoleInState,
  updatePoleDevices,
  removeDeviceFromPole,
  deletePole,
  setIsAddingPole,
  setIsMovingPole,
  setIsMeasuringDistance,
  setMeasureDistancePoints,
  setMapRef,
  setNewPoleCoordinates,
  setSelectedPole,
  setPolesValidationErrors,
  setSelectedPoleIdForValidation,
  setPoleSidebarCloseClicked,
  setGpsLocationCoordinates,
  setIsPoleLoading,
  ValidationStages,
  PoleValidationErrorsT,
} from './polesSlice';
import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';

// Helper functions for creating mock data
function createMockPole(overrides = {}) {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test-user',
    updated_by: null,
    pole_id: 'POLE-001',
    lat: 40.7128,
    long: -74.006,
    status: 'active',
    searchTerm: '',
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
    installed_at: null,
    disabled: false,
    devices: [],
    ...overrides,
  };
}

function createMockDevice(overrides = {}) {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test-user',
    updated_by: undefined,
    serial_no: 'DEV-001',
    type: 'sensor',
    solar_orientation: 'South',
    description: 'Test device',
    is_blinked: false,
    pole_id: 1,
    isNew: false,
    disabled: false,
    ...overrides,
  };
}

function getInitialState() {
  return {
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
  };
}

// Mock data instances
const mockPole = createMockPole();
const mockPole2 = createMockPole({
  id: 2,
  created_at: '2023-01-02',
  updated_at: '2023-01-02',
  pole_id: 'POLE-002',
  lat: 40.7589,
  long: -73.9851,
});
const mockDevice = createMockDevice();
const mockDevice2 = createMockDevice({
  id: 2,
  created_at: '2023-01-02',
  updated_at: '2023-01-02',
  serial_no: 'DEV-002',
  description: 'Test device 2',
});

const mockMapRef = {
  getMap: vi.fn(),
  getCanvas: vi.fn(),
  queryRenderedFeatures: vi.fn(),
} as any;

const mockValidationError: PoleValidationErrorsT = {
  type: ValidationStages.missingEdges,
  icon: 'warning',
  pole_ids: [1, 2],
};

const initialState = getInitialState();

describe('polesSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(polesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setPoles', () => {
      const poles = [mockPole, mockPole2];
      const actual = polesReducer(initialState, setPoles(poles));
      expect(actual.polesList).toEqual(poles);
    });

    it('should handle updatePoleInState', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole, mockPole2],
      };
      const updatedPole = { ...mockPole, status: 'updated' };
      const actual = polesReducer(stateWithPoles, updatePoleInState({ id: 1, newData: updatedPole }));

      expect(actual.polesList[0].status).toBe('updated');
      expect(actual.polesList[1]).toEqual(mockPole2);
    });

    it('should handle updatePoleInState for non-existent pole', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const updatedPole = { ...mockPole, id: 999, status: 'non-existent' };
      const actual = polesReducer(stateWithPoles, updatePoleInState({ id: 999, newData: updatedPole }));

      expect(actual.polesList).toEqual([mockPole]);
    });

    it('should handle updatePoleDevices with array', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole, mockPole2],
      };
      const devices = [mockDevice, mockDevice2];
      const actual = polesReducer(stateWithPoles, updatePoleDevices({ poleId: 1, devices }));

      expect(actual.polesList[0].devices).toEqual(devices);
      expect(actual.polesList[1].devices).toEqual([]);
    });

    it('should handle updatePoleDevices with single device', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const actual = polesReducer(stateWithPoles, updatePoleDevices({ poleId: 1, devices: mockDevice as any }));

      expect(actual.polesList[0].devices).toEqual([mockDevice]);
    });

    it('should handle updatePoleDevices for non-existent pole', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const actual = polesReducer(stateWithPoles, updatePoleDevices({ poleId: 999, devices: [mockDevice] }));

      expect(actual.polesList).toEqual([mockPole]);
    });

    it('should handle removeDeviceFromPole', () => {
      const poleWithDevices = {
        ...mockPole,
        devices: [mockDevice, mockDevice2],
      };
      const stateWithPoles = {
        ...initialState,
        polesList: [poleWithDevices],
      };
      const remainingDevices = [mockDevice2];
      const actual = polesReducer(stateWithPoles, removeDeviceFromPole({ poleId: 1, devices: remainingDevices }));

      expect(actual.polesList[0].devices).toEqual(remainingDevices);
    });

    it('should handle removeDeviceFromPole for non-existent pole', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const actual = polesReducer(stateWithPoles, removeDeviceFromPole({ poleId: 999, devices: [] }));

      expect(actual.polesList).toEqual([mockPole]);
    });

    it('should handle deletePole', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole, mockPole2],
      };
      const actual = polesReducer(stateWithPoles, deletePole(1));

      expect(actual.polesList).toEqual([mockPole2]);
    });

    it('should handle deletePole for non-existent pole', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const actual = polesReducer(stateWithPoles, deletePole(999));

      expect(actual.polesList).toEqual([mockPole]);
    });

    it('should handle setIsAddingPole', () => {
      const actual = polesReducer(initialState, setIsAddingPole(true));
      expect(actual.isAddingPole).toBe(true);
    });

    it('should handle setIsMovingPole', () => {
      const actual = polesReducer(initialState, setIsMovingPole(true));
      expect(actual.isMovingPole).toBe(true);
    });

    it('should handle setIsMeasuringDistance', () => {
      const actual = polesReducer(initialState, setIsMeasuringDistance(true));
      expect(actual.isMeasuringDistance).toBe(true);
    });

    it('should handle setMeasureDistancePoints', () => {
      const points: [number, number][] = [
        [1, 2],
        [3, 4],
      ];
      const actual = polesReducer(initialState, setMeasureDistancePoints(points));
      expect(actual.measureDistancePoints).toEqual(points);
    });

    it('should handle setMeasureDistancePoints with null', () => {
      const actual = polesReducer(initialState, setMeasureDistancePoints(null));
      expect(actual.measureDistancePoints).toBe(null);
    });

    it('should handle setMapRef', () => {
      const actual = polesReducer(initialState, setMapRef(mockMapRef));
      expect(actual.mapRef).toBe(mockMapRef);
    });

    it('should handle setMapRef with null', () => {
      const actual = polesReducer(initialState, setMapRef(null));
      expect(actual.mapRef).toBe(null);
    });

    it('should handle setNewPoleCoordinates', () => {
      const coordinates: [number, number] = [40.7128, -74.006];
      const actual = polesReducer(initialState, setNewPoleCoordinates(coordinates));
      expect(actual.newPoleCoordinates).toEqual(coordinates);
    });

    it('should handle setNewPoleCoordinates with null', () => {
      const actual = polesReducer(initialState, setNewPoleCoordinates(null));
      expect(actual.newPoleCoordinates).toBe(null);
    });

    it('should handle setSelectedPole', () => {
      const actual = polesReducer(initialState, setSelectedPole(mockPole));
      expect(actual.selectedPole).toEqual(mockPole);
    });

    it('should handle setSelectedPole with null', () => {
      const actual = polesReducer(initialState, setSelectedPole(null));
      expect(actual.selectedPole).toBe(null);
    });

    it('should handle setPolesValidationErrors', () => {
      const actual = polesReducer(initialState, setPolesValidationErrors(mockValidationError));
      expect(actual.polesValidationErrors).toEqual(mockValidationError);
    });

    it('should handle setPolesValidationErrors with undefined', () => {
      const actual = polesReducer(initialState, setPolesValidationErrors(undefined));
      expect(actual.polesValidationErrors).toBeUndefined();
    });

    it('should handle setSelectedPoleIdForValidation', () => {
      const actual = polesReducer(initialState, setSelectedPoleIdForValidation(5));
      expect(actual.selectedPoleIdForValidation).toBe(5);
    });

    it('should handle setPoleSidebarCloseClicked', () => {
      const actual = polesReducer(initialState, setPoleSidebarCloseClicked(true));
      expect(actual.poleSidebarCloseClicked).toBe(true);
    });

    it('should handle setGpsLocationCoordinates', () => {
      const coordinates = { lat: 40.7128, long: -74.006 };
      const actual = polesReducer(initialState, setGpsLocationCoordinates(coordinates));
      expect(actual.gpsLocationCoordinates).toEqual(coordinates);
    });

    it('should handle setGpsLocationCoordinates with null', () => {
      const actual = polesReducer(initialState, setGpsLocationCoordinates(null));
      expect(actual.gpsLocationCoordinates).toBe(null);
    });

    it('should handle setIsPoleLoading', () => {
      const actual = polesReducer(initialState, setIsPoleLoading(true));
      expect(actual.isPoleLoading).toBe(true);
    });
  });

  describe('ValidationStages enum', () => {
    it('should have correct validation stages', () => {
      expect(ValidationStages.missingEdges).toBe('missingEdges');
      expect(ValidationStages.missingUpstream).toBe('missingUpstream');
      expect(ValidationStages.missingEquipment).toBe('missingEquipment');
      expect(ValidationStages.missingSpans).toBe('missingSpans');
    });

    it('should have all expected validation stages', () => {
      const stages = Object.values(ValidationStages);
      expect(stages).toHaveLength(4);
      expect(stages).toContain('missingEdges');
      expect(stages).toContain('missingUpstream');
      expect(stages).toContain('missingEquipment');
      expect(stages).toContain('missingSpans');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const originalState = { ...initialState };
      polesReducer(initialState, setPoles([mockPole]));
      expect(initialState).toEqual(originalState);
    });

    it('should create new state objects', () => {
      const state1 = polesReducer(initialState, setPoles([mockPole]));
      const state2 = polesReducer(state1, setIsAddingPole(true));

      expect(state1).not.toBe(state2);
      expect(state1.isAddingPole).toBe(false);
      expect(state2.isAddingPole).toBe(true);
    });

    it('should not mutate nested objects', () => {
      const stateWithPoles = {
        ...initialState,
        polesList: [mockPole],
      };
      const updatedPole = { ...mockPole, status: 'updated' };
      const newState = polesReducer(stateWithPoles, updatePoleInState({ id: 1, newData: updatedPole }));

      expect(stateWithPoles.polesList[0]).not.toBe(newState.polesList[0]);
      expect(stateWithPoles.polesList[0].status).toBe('active');
      expect(newState.polesList[0].status).toBe('updated');
    });
  });

  describe('action creators', () => {
    it('should create setPoles action', () => {
      const poles = [mockPole];
      const action = setPoles(poles);
      expect(action.type).toBe('poles/setPoles');
      expect(action.payload).toEqual(poles);
    });

    it('should create updatePoleInState action', () => {
      const updateData = { id: 1, newData: mockPole };
      const action = updatePoleInState(updateData);
      expect(action.type).toBe('poles/updatePoleInState');
      expect(action.payload).toEqual(updateData);
    });

    it('should create deletePole action', () => {
      const action = deletePole(1);
      expect(action.type).toBe('poles/deletePole');
      expect(action.payload).toBe(1);
    });

    it('should create setIsAddingPole action', () => {
      const action = setIsAddingPole(true);
      expect(action.type).toBe('poles/setIsAddingPole');
      expect(action.payload).toBe(true);
    });

    it('should create setSelectedPole action', () => {
      const action = setSelectedPole(mockPole);
      expect(action.type).toBe('poles/setSelectedPole');
      expect(action.payload).toEqual(mockPole);
    });
  });

  describe('multiple actions sequence', () => {
    it('should handle multiple actions in sequence', () => {
      let state = polesReducer(initialState, setPoles([mockPole, mockPole2]));
      state = polesReducer(state, setSelectedPole(mockPole));
      state = polesReducer(state, setIsAddingPole(true));
      state = polesReducer(state, setIsMeasuringDistance(true));

      expect(state.polesList).toHaveLength(2);
      expect(state.selectedPole).toEqual(mockPole);
      expect(state.isAddingPole).toBe(true);
      expect(state.isMeasuringDistance).toBe(true);
    });

    it('should handle pole operations in sequence', () => {
      let state = polesReducer(initialState, setPoles([mockPole, mockPole2]));
      state = polesReducer(
        state,
        updatePoleInState({
          id: 1,
          newData: { ...mockPole, status: 'updated' },
        })
      );
      state = polesReducer(
        state,
        updatePoleDevices({
          poleId: 1,
          devices: [mockDevice],
        })
      );
      state = polesReducer(state, deletePole(2));

      expect(state.polesList).toHaveLength(1);
      expect(state.polesList[0].status).toBe('updated');
      expect(state.polesList[0].devices).toEqual([mockDevice]);
    });

    it('should handle coordinate and map operations', () => {
      let state = polesReducer(initialState, setNewPoleCoordinates([40.7128, -74.006]));
      state = polesReducer(state, setMapRef(mockMapRef));
      state = polesReducer(
        state,
        setMeasureDistancePoints([
          [1, 2],
          [3, 4],
        ])
      );
      state = polesReducer(state, setGpsLocationCoordinates({ lat: 40.7128, long: -74.006 }));

      expect(state.newPoleCoordinates).toEqual([40.7128, -74.006]);
      expect(state.mapRef).toBe(mockMapRef);
      expect(state.measureDistancePoints).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(state.gpsLocationCoordinates).toEqual({ lat: 40.7128, long: -74.006 });
    });
  });

  describe('edge cases', () => {
    it('should handle empty poles list operations', () => {
      const state = polesReducer(initialState, deletePole(1));
      expect(state.polesList).toEqual([]);
    });

    it('should handle device operations on pole without devices', () => {
      const poleWithoutDevices = { ...mockPole, devices: undefined };
      const stateWithPoles = {
        ...initialState,
        polesList: [poleWithoutDevices],
      };
      const actual = polesReducer(stateWithPoles, updatePoleDevices({ poleId: 1, devices: [mockDevice] }));

      expect(actual.polesList[0].devices).toEqual([mockDevice]);
    });

    it('should handle validation errors with different stages', () => {
      const validationErrors = [
        {
          type: ValidationStages.missingEdges,
          icon: 'warning' as IconNames,
          pole_ids: [1],
        },
        {
          type: ValidationStages.missingUpstream,
          icon: 'cross-circle' as IconNames,
          pole_ids: [2],
        },
        {
          type: ValidationStages.missingEquipment,
          icon: 'check-circle' as IconNames,
          pole_ids: [3],
        },
        {
          type: ValidationStages.missingSpans,
          icon: 'warning' as IconNames,
          pole_ids: [4],
        },
      ];

      for (const error of validationErrors) {
        const state = polesReducer(initialState, setPolesValidationErrors(error));
        expect(state.polesValidationErrors).toEqual(error);
      }
    });
  });
});
