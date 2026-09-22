import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface SidebarsState {
  isMainSidebarCollapsed: boolean;
  isSidebarFiltersCollapsed: boolean;
}

const initialState: SidebarsState = {
  isMainSidebarCollapsed: false,
  isSidebarFiltersCollapsed: false,
};

const sidebarsSlice = createSlice({
  name: 'sidebars',
  initialState,
  reducers: {
    setIsMainSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isMainSidebarCollapsed = action.payload;
    },
    setIsSidebarFiltersCollapsed(state, action: PayloadAction<boolean>) {
      state.isSidebarFiltersCollapsed = action.payload;
    },
  },
});

export const { setIsMainSidebarCollapsed, setIsSidebarFiltersCollapsed } = sidebarsSlice.actions;
export const sidebarsReducer = sidebarsSlice.reducer;
