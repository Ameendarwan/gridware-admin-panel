import { Edge, EdgesMap, MapMode, SpanT } from '@app/pages/Deployments/components/MapBox/types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '..';
import { Pole } from '../apis/pole/types';

export interface EdgesState {
  selectedEdgeId: number;
  deploymentId?: number;
  edgesList: Edge[];
  edgesMap: EdgesMap;
  isSelectingFromPole: boolean;
  isSelectingToPole: boolean;
  selectedFromPole: number;
  selectedToPole: number;
  selectedPoleEdges: number[];
  mode: MapMode;
  isSelectingEdge: number | null;
  isDuplicateEdge: boolean;
  spansList?: string[];
  spansData: SpanT[];
  drawingSpanPoles?: Pole[];
}

const initialState: EdgesState = {
  selectedEdgeId: -1,
  deploymentId: undefined,
  edgesList: [] as Edge[],
  edgesMap: {} as EdgesMap,
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

const edgesSlice = createSlice({
  name: 'edges',
  initialState,
  reducers: {
    setEdges(state, action: PayloadAction<Edge[]>) {
      state.edgesList = action.payload;
    },
    clearEdges(state) {
      state.edgesList = [];
    },
    updateEdge(state, action: PayloadAction<{ id: number; newData: Partial<Edge> }>) {
      const { id, newData } = action.payload;
      const edge = state.edgesList.find(edge => edge.id === id);
      if (edge) {
        Object.assign(edge, {
          ...edge,
          ...newData,
          spans: [...(edge.spans ?? []), ...(newData.spans ?? [])],
          from_pole_id: newData.from_pole_id === -1 ? edge.from_pole_id : newData.from_pole_id,
          to_pole_id: newData.to_pole_id === -1 ? edge.to_pole_id : newData.to_pole_id,
        });
      }
    },
    deleteEdge(state, action: PayloadAction<number>) {
      const edgeId = action.payload;
      state.edgesList = state.edgesList.filter(edge => edge.id !== edgeId);
      delete state.edgesMap[edgeId];
    },
    setEdgesMap(state, action: PayloadAction<EdgesMap>) {
      state.edgesMap = action.payload;
    },
    setSelectedEdgeId(state, action: PayloadAction<number>) {
      state.selectedEdgeId = action.payload;
    },
    setIsSelectingEdge(state, action: PayloadAction<null | undefined>) {
      state.isSelectingEdge = action.payload === null ? null : Date.now();
    },
    setIsSelectingFromPole(state, action: PayloadAction<boolean>) {
      state.isSelectingFromPole = action.payload;
    },
    setIsSelectingToPole(state, action: PayloadAction<boolean>) {
      state.isSelectingToPole = action.payload;
    },
    setSelectedFromPole(state, action: PayloadAction<number>) {
      state.selectedFromPole = action.payload;
    },
    setSelectedToPole(state, action: PayloadAction<number>) {
      state.selectedToPole = action.payload;
    },
    setSelectedPoleEdges(state, action: PayloadAction<number[]>) {
      state.selectedPoleEdges = action.payload;
    },
    setMode(state, action: PayloadAction<MapMode>) {
      state.mode = action.payload;
    },
    setDeploymentId(state, action: PayloadAction<number | undefined>) {
      state.deploymentId = action.payload;
    },
    setIsDuplicateEdge(state, action: PayloadAction<boolean>) {
      state.isDuplicateEdge = action.payload;
    },
    setSpansList(state, action: PayloadAction<string[]>) {
      state.spansList = action.payload;
    },
    setSpansData(state, action: PayloadAction<SpanT[]>) {
      state.spansData = action.payload;
    },
    setDrawingSpanPole(state, action: PayloadAction<Pole>) {
      state?.drawingSpanPoles?.push(action.payload);
    },
    removeDrawingSpanPole(state, action: PayloadAction<Pole | null>) {
      if (action.payload === null) {
        state?.drawingSpanPoles?.pop();
      } else {
        const index = state?.drawingSpanPoles?.findIndex(pole => pole.id === action.payload?.id);
        if (index === undefined || index === -1) {
          return;
        }
        state.drawingSpanPoles?.splice(index, 1);
      }
    },
    clearDrawingSpanPoles(state) {
      state.drawingSpanPoles = [];
    },
  },
});

export const {
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
} = edgesSlice.actions;

export const getMode = (state: RootState) => state.edges.mode;
export const getEdgesMap = (state: RootState) => state.edges.edgesMap;
export const getIsSelectingEdge = (state: RootState) => state.edges.isSelectingEdge;
export const getSelectedEdge = (state: RootState) => state.edges.selectedEdgeId;
export const getSelectedPoleEdges = (state: RootState) => state.edges.selectedPoleEdges;
export const getIsDuplicateEdge = (state: RootState) => state.edges.isDuplicateEdge;
export const getAllDrawingSpanPoles = (state: RootState) => state.edges.drawingSpanPoles;

export const edgesReducer = edgesSlice.reducer;
