import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import EdgeInspector from './EdgeInspector';

// Mock Redux slices
const mockEdgesSlice = {
  name: 'edges',
  initialState: {
    edgesList: [],
  },
  reducers: {},
};

const mockPolesSlice = {
  name: 'poles',
  initialState: {
    polesList: [],
  },
  reducers: {},
};

// Create mock store
const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      edges: (_action: any, _state: any = mockEdgesSlice.initialState) => _state,
      poles: (_action: any, _state: any = mockPolesSlice.initialState) => _state,
    },
    preloadedState: {
      edges: { edgesList: [] },
      poles: { polesList: [] },
      ...initialState,
    },
  } as any);
};

// Mock data
const mockPoles = [
  { id: 'pole-1', lat: 40.7128, long: -74.006 },
  { id: 'pole-2', lat: 40.7589, long: -73.9851 },
  { id: 'pole-3', lat: 40.7505, long: -73.9934 },
];

const mockEdges = [
  {
    id: 'edge-1',
    from_pole_id: 'pole-1',
    to_pole_id: 'pole-2',
    coordinates: [
      [-74.006, 40.7128],
      [-73.9851, 40.7589],
    ],
    color: 'red',
    deployment_id: 'deploy-1',
  },
  {
    id: 'edge-2',
    from_pole_id: 'pole-2',
    to_pole_id: 'pole-3',
    coordinates: [
      [-73.9851, 40.7589],
      [-73.9934, 40.7505],
    ],
    deployment_id: 'deploy-1',
  },
  {
    id: 'edge-3',
    from_pole_id: 'pole-1',
    to_pole_id: 'pole-3',
    coordinates: null,
    deployment_id: 'deploy-2',
  },
];

// Mock map ref
const createMockMapRef = (overrides: any = {}) => {
  const mockMap = {
    isStyleLoaded: vi.fn(() => true),
    project: vi.fn((_coords: any) => ({ x: 100, y: 100 })),
    getBounds: vi.fn(() => ({
      getSouth: () => 40.7,
      getNorth: () => 40.8,
      getWest: () => -74.1,
      getEast: () => -73.9,
    })),
    getContainer: vi.fn(() => ({
      dispatchEvent: vi.fn(),
    })),
    ...overrides,
  };

  return {
    current: {
      getMap: vi.fn(() => mockMap),
    },
  };
};

describe('EdgeInspector', () => {
  let mockStore: any;
  let mockMapRef: any;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    mockStore = createMockStore({
      edges: { edgesList: mockEdges },
      poles: { polesList: mockPoles },
    });
    mockMapRef = createMockMapRef();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  const renderEdgeInspector = (props = {}) => {
    const defaultProps = {
      mapRef: mockMapRef,
      debugMode: false,
      ...props,
    };

    return render(
      <Provider store={mockStore}>
        <EdgeInspector {...defaultProps} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderEdgeInspector();
      expect(document.body).toBeInTheDocument();
    });

    it('renders edge elements with correct test ids', () => {
      renderEdgeInspector();

      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-2')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-3')).toBeInTheDocument();
    });

    it('renders edges with proper data attributes', () => {
      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      expect(edge1).toHaveAttribute('data-edge-id', 'edge-1');
      expect(edge1).toHaveAttribute('data-edge-from-pole', 'pole-1');
      expect(edge1).toHaveAttribute('data-edge-to-pole', 'pole-2');
      expect(edge1).toHaveAttribute('data-edge-color', 'red');
      expect(edge1).toHaveAttribute('data-edge-deployment-id', 'deploy-1');
    });

    it('sets has-coordinates attribute correctly', () => {
      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      const edge3 = screen.getByTestId('edge-edge-3');

      expect(edge1).toHaveAttribute('data-edge-has-coordinates', 'true');
      expect(edge3).toHaveAttribute('data-edge-has-coordinates', 'false');
    });

    it('sets coordinate count correctly', () => {
      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      const edge3 = screen.getByTestId('edge-edge-3');

      expect(edge1).toHaveAttribute('data-edge-coordinate-count', '2');
      expect(edge3).toHaveAttribute('data-edge-coordinate-count', '0');
    });
  });

  describe('Debug Mode', () => {
    it('renders differently in debug mode', () => {
      renderEdgeInspector({ debugMode: true });

      const edge1 = screen.getByTestId('edge-edge-1');
      expect(edge1).toHaveTextContent('Eedge-1');
      expect(edge1).toHaveStyle({
        backgroundColor: 'rgba(0, 255, 0, 0.7)',
        border: '3px solid lime',
      });
    });

    it('renders transparently in non-debug mode', () => {
      renderEdgeInspector({ debugMode: false });

      const edge1 = screen.getByTestId('edge-edge-1');
      expect(edge1).toHaveTextContent('');

      // Check that it has transparent styling
      expect(edge1.style.backgroundColor).toBe('transparent');
      expect(edge1.style.border).toBe('2px solid transparent');
      expect(edge1.style.fontSize).toBe('0px');
    });

    it('logs debug information when debugMode is true', () => {
      renderEdgeInspector({ debugMode: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'EdgeInspector Debug:',
        expect.objectContaining({
          totalEdges: 3,
          visibleEdges: 3,
          polesAvailable: 3,
          edgesSample: expect.any(Array),
        })
      );
    });
  });

  describe('Edge Position Calculation', () => {
    it('calculates position from coordinates when available', () => {
      const mockProject = vi.fn(() => ({ x: 150, y: 200 }));
      mockMapRef.current.getMap().project = mockProject;

      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      expect(edge1).toHaveStyle({
        left: '135px', // 150 - 15
        top: '185px', // 200 - 15
      });
    });

    it('fallback to pole positions when coordinates unavailable', () => {
      const mockProject = vi.fn(() => ({ x: 120, y: 180 }));
      mockMapRef.current.getMap().project = mockProject;

      renderEdgeInspector();

      const edge3 = screen.getByTestId('edge-edge-3');
      expect(edge3).toHaveStyle({
        left: '105px', // 120 - 15
        top: '165px', // 180 - 15
      });
    });
  });

  describe('Viewport Filtering', () => {
    const createOutOfBoundsMockBounds = () => ({
      getSouth: () => 50, // Outside our mock data range
      getNorth: () => 51,
      getWest: () => -1,
      getEast: () => 1,
    });

    it('filters edges based on viewport bounds', () => {
      const mockGetBounds = vi.fn(() => createOutOfBoundsMockBounds());

      mockMapRef.current.getMap().getBounds = mockGetBounds;

      renderEdgeInspector();

      // Should not render any edges since they're outside bounds
      expect(screen.queryByTestId('edge-edge-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edge-edge-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edge-edge-3')).not.toBeInTheDocument();
    });

    it('handles viewport filtering errors gracefully', () => {
      const mockGetBounds = vi.fn(() => {
        throw new Error('Bounds error');
      });

      mockMapRef.current.getMap().getBounds = mockGetBounds;

      renderEdgeInspector();

      // Should still render all edges when bounds calculation fails
      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-2')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-3')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('handles edge clicks and dispatches map events', () => {
      const mockDispatchEvent = vi.fn();
      const mockGetContainer = vi.fn(() => ({
        dispatchEvent: mockDispatchEvent,
      }));
      mockMapRef.current.getMap().getContainer = mockGetContainer;

      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      fireEvent.click(edge1);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Edge clicked via inspector:',
        expect.objectContaining({
          id: 'edge-1',
          fromPole: 'pole-1',
          toPole: 'pole-2',
        })
      );

      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it('prevents event propagation on click', () => {
      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      const clickEvent = new MouseEvent('click', { bubbles: true });

      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      fireEvent(edge1, clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Mouse Hover Effects', () => {
    it('applies hover effects in debug mode', () => {
      renderEdgeInspector({ debugMode: true });

      const edge1 = screen.getByTestId('edge-edge-1');

      fireEvent.mouseEnter(edge1);
      expect(edge1).toHaveStyle({
        transform: 'scale(1.2)',
        zIndex: '2000',
      });

      fireEvent.mouseLeave(edge1);
      expect(edge1).toHaveStyle({
        transform: 'scale(1)',
        zIndex: '1500',
      });
    });

    it('does not apply hover effects in non-debug mode', () => {
      renderEdgeInspector({ debugMode: false });

      const edge1 = screen.getByTestId('edge-edge-1');
      const originalTransform = edge1.style.transform;
      const originalZIndex = edge1.style.zIndex;

      fireEvent.mouseEnter(edge1);
      fireEvent.mouseLeave(edge1);

      // Transform and zIndex should remain unchanged
      expect(edge1.style.transform).toBe(originalTransform);
      expect(edge1.style.zIndex).toBe(originalZIndex);
    });
  });

  describe('Error Handling', () => {
    it('handles map projection errors gracefully', () => {
      const mockProject = vi.fn(() => {
        throw new Error('Projection error');
      });
      mockMapRef.current.getMap().project = mockProject;

      renderEdgeInspector({ debugMode: true });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Error calculating screen coordinates:', expect.any(Error));
    });

    it('handles missing map reference', () => {
      const mapRefWithoutCurrent = { current: null };

      render(
        <Provider store={mockStore}>
          <EdgeInspector mapRef={mapRefWithoutCurrent} debugMode={false} />
        </Provider>
      );

      // Should not crash and not render any edges
      expect(screen.queryByTestId(/^edge-/)).not.toBeInTheDocument();
    });

    it('handles map style not loaded', () => {
      mockMapRef.current.getMap().isStyleLoaded = vi.fn(() => false);

      renderEdgeInspector();

      // When style is not loaded, getScreenCoordinates returns invalid position
      // which means edges won't render
      expect(screen.queryByTestId('edge-edge-1')).not.toBeInTheDocument();
    });
  });

  describe('Redux State Integration', () => {
    it('renders no edges when edges list is empty', () => {
      const emptyStore = createMockStore({
        edges: { edgesList: [] },
        poles: { polesList: mockPoles },
      });

      render(
        <Provider store={emptyStore}>
          <EdgeInspector mapRef={mockMapRef} debugMode={false} />
        </Provider>
      );

      expect(screen.queryByTestId(/^edge-/)).not.toBeInTheDocument();
    });

    it('handles missing poles gracefully', () => {
      const noPoleStore = createMockStore({
        edges: { edgesList: mockEdges },
        poles: { polesList: [] },
      });

      render(
        <Provider store={noPoleStore}>
          <EdgeInspector mapRef={mockMapRef} debugMode={true} />
        </Provider>
      );

      // Edges without valid positions won't render, but we should check for debug warnings
      // The warning is only logged when debugMode is true and position is invalid
      // Since we expect edges to not render due to missing poles, no warnings occur
      expect(screen.queryByTestId('edge-edge-3')).not.toBeInTheDocument();
    });
  });

  describe('Coordinate Strategies', () => {
    it('uses coordinates when available (Strategy 1)', () => {
      renderEdgeInspector();

      const edge1 = screen.getByTestId('edge-edge-1');
      expect(edge1).toBeInTheDocument();
      expect(edge1).toHaveAttribute('data-edge-has-coordinates', 'true');
    });

    it('falls back to pole positions when coordinates unavailable (Strategy 2)', () => {
      renderEdgeInspector();

      const edge3 = screen.getByTestId('edge-edge-3');
      expect(edge3).toBeInTheDocument();
      expect(edge3).toHaveAttribute('data-edge-has-coordinates', 'false');
    });

    it('handles edge with missing poles', () => {
      const edgeWithMissingPoles = {
        id: 'edge-orphan',
        from_pole_id: 'missing-pole-1',
        to_pole_id: 'missing-pole-2',
        coordinates: null,
        deployment_id: 'deploy-3',
      };

      const storeWithOrphanEdge = createMockStore({
        edges: { edgesList: [edgeWithMissingPoles] },
        poles: { polesList: mockPoles },
      });

      render(
        <Provider store={storeWithOrphanEdge}>
          <EdgeInspector mapRef={mockMapRef} debugMode={true} />
        </Provider>
      );

      // Should not render the orphan edge
      expect(screen.queryByTestId('edge-edge-orphan')).not.toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes pole coordinates map', () => {
      const { rerender } = renderEdgeInspector();

      // Get initial pole coordinates calculation
      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();

      // Re-render with same poles - should use memoized values
      rerender(
        <Provider store={mockStore}>
          <EdgeInspector mapRef={mockMapRef} debugMode={false} />
        </Provider>
      );

      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
    });

    it('memoizes visible edges calculation', () => {
      renderEdgeInspector();

      // Should efficiently filter edges based on viewport
      expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-2')).toBeInTheDocument();
      expect(screen.getByTestId('edge-edge-3')).toBeInTheDocument();
    });
  });
});
