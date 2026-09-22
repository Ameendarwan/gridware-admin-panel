import { describe, it, expect } from 'vitest';
import { sidebarsReducer, setIsMainSidebarCollapsed, setIsSidebarFiltersCollapsed } from './sidebarsSlice';

describe('sidebarsSlice', () => {
  const initialState = {
    isMainSidebarCollapsed: false,
    isSidebarFiltersCollapsed: false,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(sidebarsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('setIsMainSidebarCollapsed', () => {
    it('should set isMainSidebarCollapsed to true', () => {
      const action = setIsMainSidebarCollapsed(true);
      const result = sidebarsReducer(initialState, action);
      
      expect(result.isMainSidebarCollapsed).toBe(true);
      expect(result.isSidebarFiltersCollapsed).toBe(false);
    });

    it('should set isMainSidebarCollapsed to false', () => {
      const currentState = {
        isMainSidebarCollapsed: true,
        isSidebarFiltersCollapsed: false,
      };
      
      const action = setIsMainSidebarCollapsed(false);
      const result = sidebarsReducer(currentState, action);
      
      expect(result.isMainSidebarCollapsed).toBe(false);
      expect(result.isSidebarFiltersCollapsed).toBe(false);
    });

    it('should not affect other state properties', () => {
      const currentState = {
        isMainSidebarCollapsed: false,
        isSidebarFiltersCollapsed: true,
      };
      
      const action = setIsMainSidebarCollapsed(true);
      const result = sidebarsReducer(currentState, action);
      
      expect(result.isMainSidebarCollapsed).toBe(true);
      expect(result.isSidebarFiltersCollapsed).toBe(true);
    });
  });

  describe('setIsSidebarFiltersCollapsed', () => {
    it('should set isSidebarFiltersCollapsed to true', () => {
      const action = setIsSidebarFiltersCollapsed(true);
      const result = sidebarsReducer(initialState, action);
      
      expect(result.isSidebarFiltersCollapsed).toBe(true);
      expect(result.isMainSidebarCollapsed).toBe(false);
    });

    it('should set isSidebarFiltersCollapsed to false', () => {
      const currentState = {
        isMainSidebarCollapsed: false,
        isSidebarFiltersCollapsed: true,
      };
      
      const action = setIsSidebarFiltersCollapsed(false);
      const result = sidebarsReducer(currentState, action);
      
      expect(result.isSidebarFiltersCollapsed).toBe(false);
      expect(result.isMainSidebarCollapsed).toBe(false);
    });

    it('should not affect other state properties', () => {
      const currentState = {
        isMainSidebarCollapsed: true,
        isSidebarFiltersCollapsed: false,
      };
      
      const action = setIsSidebarFiltersCollapsed(true);
      const result = sidebarsReducer(currentState, action);
      
      expect(result.isSidebarFiltersCollapsed).toBe(true);
      expect(result.isMainSidebarCollapsed).toBe(true);
    });
  });

  describe('action creators', () => {
    it('should create setIsMainSidebarCollapsed action with correct type and payload', () => {
      const action = setIsMainSidebarCollapsed(true);
      
      expect(action.type).toBe('sidebars/setIsMainSidebarCollapsed');
      expect(action.payload).toBe(true);
    });

    it('should create setIsSidebarFiltersCollapsed action with correct type and payload', () => {
      const action = setIsSidebarFiltersCollapsed(false);
      
      expect(action.type).toBe('sidebars/setIsSidebarFiltersCollapsed');
      expect(action.payload).toBe(false);
    });
  });

  describe('state immutability', () => {
    it('should not mutate the original state', () => {
      const originalState = { ...initialState };
      const action = setIsMainSidebarCollapsed(true);
      
      sidebarsReducer(originalState, action);
      
      expect(originalState).toEqual(initialState);
    });

    it('should return a new state object', () => {
      const action = setIsMainSidebarCollapsed(true);
      const result = sidebarsReducer(initialState, action);
      
      expect(result).not.toBe(initialState);
      expect(result).toEqual({
        isMainSidebarCollapsed: true,
        isSidebarFiltersCollapsed: false,
      });
    });
  });

  describe('multiple actions', () => {
    it('should handle multiple actions in sequence', () => {
      let state = initialState;
      
      state = sidebarsReducer(state, setIsMainSidebarCollapsed(true));
      expect(state.isMainSidebarCollapsed).toBe(true);
      expect(state.isSidebarFiltersCollapsed).toBe(false);
      
      state = sidebarsReducer(state, setIsSidebarFiltersCollapsed(true));
      expect(state.isMainSidebarCollapsed).toBe(true);
      expect(state.isSidebarFiltersCollapsed).toBe(true);
      
      state = sidebarsReducer(state, setIsMainSidebarCollapsed(false));
      expect(state.isMainSidebarCollapsed).toBe(false);
      expect(state.isSidebarFiltersCollapsed).toBe(true);
    });
  });
});
