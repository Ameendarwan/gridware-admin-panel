import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Device } from '../apis/devices/types';
import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';
import { MapRef } from 'react-map-gl';
import { Pole } from '@app/store/apis/pole/types';

export enum ValidationStages {
  'missingEdges' = 'missingEdges',
  'missingUpstream' = 'missingUpstream',
  'missingEquipment' = 'missingEquipment',
  'missingSpans' = 'missingSpans',
}

export type PoleValidationErrorsT =
  | {
      type: ValidationStages;
      icon: IconNames;
      pole_ids: number[];
    }
  | undefined;

interface PolesState {
  polesList: Pole[];
  isAddingPole?: boolean;
  isMovingPole?: boolean;
  isMeasuringDistance?: boolean;
  measureDistancePoints?: [number, number][] | null;
  mapRef?: MapRef | null;
  newPoleCoordinates?: [number, number] | null;
  selectedPole: Pole | null;
  selectedPoleIdForValidation?: number;
  polesValidationErrors?: PoleValidationErrorsT;
  gpsLocationCoordinates?: {
    lat: number;
    long: number;
    aggregatedDeviceLatitude?: number;
    aggregatedDeviceLongitude?: number;
  } | null;
  poleSidebarCloseClicked?: boolean;
  isPoleLoading?: boolean;
  searchTerm?: string;
}

const initialState: PolesState = {
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

const polesSlice = createSlice({
  name: 'poles',
  initialState,
  reducers: {
    setPoles(state, action: PayloadAction<Pole[]>) {
      state.polesList = action.payload;
    },
    updatePoleInState(state, action: PayloadAction<{ id: number; newData: Pole }>) {
      const { id, newData } = action.payload;
      const index = state.polesList.findIndex(pole => pole.id === id);
      if (index !== -1) {
        state.polesList[index] = { ...state.polesList[index], ...newData };
      }
    },
    updatePoleDevices(state, action: PayloadAction<{ poleId: number; devices: Device[] }>) {
      const { poleId, devices } = action.payload;
      const index = state.polesList.findIndex(pole => pole.id === poleId);
      if (index !== -1) {
        state.polesList[index] = {
          ...state.polesList[index],
          devices: Array.isArray(devices) ? devices : [devices],
        };
      }
    },
    removeDeviceFromPole(state, action: PayloadAction<{ poleId: number; devices: Device[] }>) {
      const { poleId, devices } = action.payload;
      const poleIndex = state.polesList.findIndex(pole => pole.id === poleId);
      if (poleIndex !== -1) {
        state.polesList[poleIndex] = {
          ...state.polesList[poleIndex],
          devices,
        };
      }
    },
    deletePole(state, action: PayloadAction<number>) {
      state.polesList = state.polesList.filter(pole => pole.id !== action.payload);
    },
    setIsAddingPole(state, action: PayloadAction<boolean>) {
      state.isAddingPole = action.payload;
    },
    setIsMovingPole(state, action: PayloadAction<boolean>) {
      state.isMovingPole = action.payload;
    },
    setIsMeasuringDistance(state, action: PayloadAction<boolean>) {
      state.isMeasuringDistance = action.payload;
    },
    setMeasureDistancePoints(state, action: PayloadAction<[number, number][] | null>) {
      state.measureDistancePoints = action.payload;
    },
    setMapRef(state, action: PayloadAction<MapRef | null>) {
      (state as PolesState).mapRef = action.payload;
    },
    setNewPoleCoordinates(state, action: PayloadAction<[number, number] | null>) {
      state.newPoleCoordinates = action.payload;
    },
    setSelectedPole(state, action: PayloadAction<Pole | null>) {
      state.selectedPole = action.payload;
    },
    setPolesValidationErrors(state, action: PayloadAction<PoleValidationErrorsT>) {
      state.polesValidationErrors = action.payload;
    },
    setSelectedPoleIdForValidation(state, action: PayloadAction<number>) {
      state.selectedPoleIdForValidation = action.payload;
    },
    setPoleSidebarCloseClicked(state, action: PayloadAction<boolean>) {
      state.poleSidebarCloseClicked = action.payload;
    },
    setGpsLocationCoordinates(
      state,
      action: PayloadAction<{
        lat: number;
        long: number;
        aggregatedDeviceLatitude?: number;
        aggregatedDeviceLongitude?: number;
      } | null>
    ) {
      state.gpsLocationCoordinates = action.payload;
    },
    setIsPoleLoading(state, action: PayloadAction<boolean>) {
      state.isPoleLoading = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
  },
});

export const {
  setPoles,
  updatePoleInState,
  deletePole,
  setIsAddingPole,
  setIsMovingPole,
  setIsMeasuringDistance,
  setMeasureDistancePoints,
  setMapRef,
  setNewPoleCoordinates,
  setSelectedPole,
  updatePoleDevices,
  removeDeviceFromPole,
  setPolesValidationErrors,
  setSelectedPoleIdForValidation,
  setPoleSidebarCloseClicked,
  setIsPoleLoading,
  setGpsLocationCoordinates,
  setSearchTerm,
} = polesSlice.actions;

export const polesReducer = polesSlice.reducer;
