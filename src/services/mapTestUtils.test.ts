import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MapTestUtils, mapTestUtils } from './mapTestUtils';
import { MapRef } from 'react-map-gl';

// Mock MapRef and its methods
const createMockMapRef = (): MapRef => {
  const mockMap = {
    isStyleLoaded: vi.fn().mockReturnValue(true),
    getCenter: vi.fn().mockReturnValue({ lat: 40.7128, lng: -74.006 }),
    getZoom: vi.fn().mockReturnValue(10),
    getBounds: vi.fn().mockReturnValue({
      getSouth: vi.fn().mockReturnValue(40),
      getNorth: vi.fn().mockReturnValue(41),
      getWest: vi.fn().mockReturnValue(-75),
      getEast: vi.fn().mockReturnValue(-73),
    }),
    project: vi.fn().mockReturnValue({ x: 100, y: 100 }),
    queryRenderedFeatures: vi.fn().mockReturnValue([]),
    getContainer: vi.fn().mockReturnValue({
      dispatchEvent: vi.fn(),
    }),
  };

  return {
    getMap: vi.fn().mockReturnValue(mockMap),
  } as unknown as MapRef;
};

// Simple mock Redux state that matches the structure needed by mapTestUtils
const createMockReduxState = () => ({
  poles: {
    polesList: [
      {
        id: 1,
        lat: 40.7128,
        long: -74.006,
        status: 'active',
        pole_id: 'POLE_001',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        created_by: 'test-user',
        deployment_id: 1,
        devices: [],
      },
      {
        id: 2,
        lat: 40.72,
        long: -74.01,
        status: 'inactive',
        pole_id: 'POLE_002',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        created_by: 'test-user',
        deployment_id: 1,
        devices: [],
      },
    ],
    polesValidationErrors: {
      pole_ids: [1],
    },
  },
  edges: {
    selectedFromPole: 1,
    selectedToPole: 2,
    edgesList: [
      {
        id: 1,
        coordinates: [
          [-74.006, 40.7128],
          [-74.01, 40.72],
        ],
        color: '#FF0000',
        from_pole_id: 1,
        to_pole_id: 2,
      },
    ],
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock window object
const windowMock = {
  __mapTestUtils: undefined,
};

describe('MapTestUtils', () => {
  let mockMapRef: MapRef;
  let mockReduxState: any;
  let testUtils: MapTestUtils;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mocks
    mockMapRef = createMockMapRef();
    mockReduxState = createMockReduxState();

    // Store original NODE_ENV and set to development for tests
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Mock global objects
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(globalThis, 'console', {
      value: consoleMock,
      writable: true,
    });

    Object.defineProperty(globalThis, 'window', {
      value: windowMock,
      writable: true,
    });

    // Mock document.querySelector
    globalThis.document = {
      querySelector: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as unknown as Document;

    // Get fresh instance
    testUtils = MapTestUtils.getInstance();
  });

  afterEach(() => {
    vi.resetAllMocks();

    // Restore original NODE_ENV
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MapTestUtils.getInstance();
      const instance2 = MapTestUtils.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(mapTestUtils).toBeInstanceOf(MapTestUtils);
      expect(mapTestUtils).toBe(MapTestUtils.getInstance());
    });
  });

  describe('setMapRef', () => {
    it('should set map reference and expose to window', () => {
      testUtils.setMapRef(mockMapRef);

      expect((globalThis as any).__mapTestUtils).toBe(testUtils);
      expect(consoleMock.log).toHaveBeenCalledWith('🗺️ Mapbox testing utilities loaded!');
      expect(consoleMock.log).toHaveBeenCalledWith(
        '📝 Type globalThis.__mapTestUtils.getDebugInfo() for available commands'
      );
      expect(consoleMock.log).toHaveBeenCalledWith(
        '🚀 Quick start: globalThis.__mapTestUtils.enableDebugMode() then refresh'
      );
    });

    it('should not log when mapRef is null', () => {
      testUtils.setMapRef(null);

      expect(consoleMock.log).not.toHaveBeenCalled();
      expect((globalThis as any).__mapTestUtils).toBe(testUtils);
    });
  });

  describe('setReduxState', () => {
    it('should set Redux state', () => {
      testUtils.setReduxState(mockReduxState);

      // Test by calling a method that uses the state
      testUtils.setMapRef(mockMapRef);
      const mapData = testUtils.getMapTestData();

      expect(mapData).not.toBeNull();
      expect(mapData?.poles).toHaveLength(2);
    });
  });

  describe('getMapTestData', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return null when mapRef is null', () => {
      testUtils.setMapRef(null);
      const result = testUtils.getMapTestData();
      expect(result).toBe(null);
    });

    it('should return complete map test data', () => {
      const result = testUtils.getMapTestData();

      expect(result).not.toBeNull();
      expect(result?.poles).toHaveLength(2);
      expect(result?.edges).toHaveLength(1);
      expect(result?.mapCenter).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        zoom: 10,
      });
    });

    it('should correctly map pole data with validation errors', () => {
      const result = testUtils.getMapTestData();

      expect(result?.poles[0]).toEqual({
        id: 1,
        lat: 40.7128,
        long: -74.006,
        status: 'active',
        poleId: 'POLE_001',
        isSelected: true, // Selected as from pole
        hasValidationError: true, // Has validation error
      });

      expect(result?.poles[1]).toEqual({
        id: 2,
        lat: 40.72,
        long: -74.01,
        status: 'inactive',
        poleId: 'POLE_002',
        isSelected: true, // Selected as to pole
        hasValidationError: false,
      });
    });

    it('should correctly map edge data', () => {
      const result = testUtils.getMapTestData();

      expect(result?.edges[0]).toEqual({
        id: 1,
        coordinates: [
          [-74.006, 40.7128],
          [-74.01, 40.72],
        ],
        color: '#FF0000',
        isSelected: false,
      });
    });
  });

  describe('queryFeaturesAtPoint', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
    });

    it('should return empty array when mapRef is null', () => {
      testUtils.setMapRef(null);
      const result = testUtils.queryFeaturesAtPoint(100, 200);
      expect(result).toEqual([]);
    });

    it('should query features at specified point', () => {
      const mockFeatures = [{ id: 'feature1' }, { id: 'feature2' }];
      const mockMap = mockMapRef.getMap();
      (mockMap.queryRenderedFeatures as any).mockReturnValue(mockFeatures);

      const result = testUtils.queryFeaturesAtPoint(100, 200);

      expect(mockMap.queryRenderedFeatures).toHaveBeenCalledWith([100, 200]);
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('getPoleAtCoordinates', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return null when no map data available', () => {
      testUtils.setMapRef(null);
      const result = testUtils.getPoleAtCoordinates(40.7128, -74.006);
      expect(result).toBe(null);
    });

    it('should find pole at exact coordinates', () => {
      const result = testUtils.getPoleAtCoordinates(40.7128, -74.006);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.poleId).toBe('POLE_001');
    });

    it('should find pole within tolerance', () => {
      const result = testUtils.getPoleAtCoordinates(40.7129, -74.0061, 0.01);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });
  });

  describe('simulatePoleClick', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return false when no map data available', () => {
      testUtils.setMapRef(null);
      const result = testUtils.simulatePoleClick(1);
      expect(result).toBe(false);
    });

    it('should return false when pole not found', () => {
      const result = testUtils.simulatePoleClick(999);
      expect(result).toBe(false);
    });

    it('should simulate pole click successfully', () => {
      const mockContainer = { dispatchEvent: vi.fn() };
      const mockMap = mockMapRef.getMap();
      (mockMap.getContainer as any).mockReturnValue(mockContainer);

      const result = testUtils.simulatePoleClick(1);

      expect(result).toBe(true);
      expect(mockMap.project).toHaveBeenCalledWith([-74.006, 40.7128]);
      expect(mockContainer.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          clientX: 100,
          clientY: 100,
        })
      );
    });
  });

  describe('getVisiblePoles', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return empty array when mapRef is null', () => {
      testUtils.setMapRef(null);
      const result = testUtils.getVisiblePoles();
      expect(result).toEqual([]);
    });

    it('should return poles within bounds', () => {
      const result = testUtils.getVisiblePoles();

      // Both poles should be visible based on mock bounds
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should filter out poles outside bounds', () => {
      const mockMap = mockMapRef.getMap();
      (mockMap.getBounds as any).mockReturnValue({
        getSouth: vi.fn().mockReturnValue(40.8),
        getNorth: vi.fn().mockReturnValue(40.9),
        getWest: vi.fn().mockReturnValue(-75),
        getEast: vi.fn().mockReturnValue(-73),
      });

      const result = testUtils.getVisiblePoles();
      expect(result).toHaveLength(0);
    });
  });

  describe('waitForMapReady', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
    });

    it('should resolve immediately when map is ready', async () => {
      const mockMap = mockMapRef.getMap();
      (mockMap.isStyleLoaded as any).mockReturnValue(true);

      const startTime = Date.now();
      await testUtils.waitForMapReady();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Should resolve quickly
    });

    it('should wait for map to be ready', async () => {
      const mockMap = mockMapRef.getMap();
      let callCount = 0;
      (mockMap.isStyleLoaded as any).mockImplementation(() => {
        callCount++;
        return callCount > 2; // Return true after 2 calls
      });

      const startTime = Date.now();
      await testUtils.waitForMapReady();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100); // Should take at least 100ms
      expect(mockMap.isStyleLoaded).toHaveBeenCalledTimes(3);
    });
  });

  describe('Test Mode Management', () => {
    describe('enableTestMode', () => {
      it('should enable test mode and log success message', () => {
        testUtils.enableTestMode();

        expect(localStorageMock.setItem).toHaveBeenCalledWith('mapbox-test-mode', 'true');
        expect(consoleMock.log).toHaveBeenCalledWith(
          '✅ Mapbox test mode enabled. Refresh the page to see test overlay.'
        );
      });
    });

    describe('enableDebugMode', () => {
      it('should enable debug mode and log success message', () => {
        testUtils.enableDebugMode();

        expect(localStorageMock.setItem).toHaveBeenCalledWith('mapbox-test-mode', 'true');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('mapbox-debug-mode', 'true');
        expect(consoleMock.log).toHaveBeenCalledWith(
          '🔍 Mapbox debug mode enabled. Refresh the page to see visual overlay elements.'
        );
      });
    });

    describe('disableTestMode', () => {
      it('should disable test mode and log success message', () => {
        testUtils.disableTestMode();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('mapbox-test-mode');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('mapbox-debug-mode');
        expect(consoleMock.log).toHaveBeenCalledWith('❌ Mapbox test mode disabled. Refresh the page.');
      });
    });
  });

  describe('getDebugInfo', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return comprehensive debug information', () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'mapbox-test-mode') return 'true';
        if (key === 'mapbox-debug-mode') return 'true';
        return null;
      });

      const result = testUtils.getDebugInfo();

      expect(result).toEqual({
        mapReady: true,
        testModeEnabled: true,
        debugModeEnabled: true,
        totalPoles: 2,
        totalEdges: 1,
        visiblePoles: 2,
        mapCenter: {
          latitude: 40.7128,
          longitude: -74.006,
          zoom: 10,
        },
        edgeDetails: [
          {
            id: 1,
            hasCoordinates: true,
            coordinateCount: 2,
            firstPoint: [-74.006, 40.7128],
            lastPoint: [-74.01, 40.72],
          },
        ],
        helpCommands: expect.arrayContaining([
          expect.stringContaining('enableTestMode()'),
          expect.stringContaining('enableDebugMode()'),
          expect.stringContaining('disableTestMode()'),
        ]),
      });
    });

    it('should handle missing map data gracefully', () => {
      testUtils.setMapRef(null);

      const result = testUtils.getDebugInfo();

      expect(result.mapReady).toBe(false);
      expect(result.totalPoles).toBe(0);
      expect(result.totalEdges).toBe(0);
      expect(result.visiblePoles).toBe(0);
    });
  });

  describe('getEdgeInfo', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return detailed edge information', () => {
      // Mock DOM elements
      globalThis.document.querySelector = vi.fn().mockReturnValue(null);
      globalThis.document.querySelectorAll = vi.fn().mockImplementation(selector => {
        if (selector === '[data-testid="map-test-overlay"]') return [];
        if (selector === '[data-testid^="edge-"]') return [];
        if (selector === '[data-testid^="pole-"]') return [];
        return [];
      });

      const result = testUtils.getEdgeInfo();

      expect(result).toEqual({
        totalEdges: 1,
        edgesWithCoordinates: 1,
        edgeDetails: [
          {
            id: 1,
            hasCoordinates: true,
            coordinateCount: 2,
            sampleCoordinates: [
              [-74.006, 40.7128],
              [-74.01, 40.72],
            ],
            color: '#FF0000',
            isSelected: false,
          },
        ],
        domElements: {
          overlayExists: false,
          edgeElementsCount: 0,
          poleElementsCount: 0,
          edgeInspectorActive: false,
        },
        edgeInspection: {
          elementsInDOM: [],
        },
      });
    });

    it('should return null when no map data available', () => {
      testUtils.setMapRef(null);
      const result = testUtils.getEdgeInfo();
      expect(result).toBe(null);
    });
  });

  describe('getPerformanceInfo', () => {
    beforeEach(() => {
      testUtils.setMapRef(mockMapRef);
      testUtils.setReduxState(mockReduxState);
    });

    it('should return performance information from DOM', () => {
      const mockSummaryElement = {
        dataset: {
          totalPoles: '100',
          visiblePoles: '25',
          totalEdges: '50',
          visibleEdges: '10',
        },
      };

      globalThis.document.querySelector = vi.fn().mockReturnValue(mockSummaryElement);

      const result = testUtils.getPerformanceInfo();

      expect(result.totalElements).toBe(150);
      expect(result.renderedElements).toBe(35);
      expect(result.poles.total).toBe(100);
      expect(result.poles.visible).toBe(25);
      expect(result.poles.culled).toBe(75);
      expect(result.poles.cullPercentage).toBe(75);
      expect(result.edges.total).toBe(50);
      expect(result.edges.visible).toBe(10);
      expect(result.edges.culled).toBe(40);
      expect(result.edges.cullPercentage).toBe(80);
    });

    it('should handle missing summary element', () => {
      globalThis.document.querySelector = vi.fn().mockReturnValue(null);

      const result = testUtils.getPerformanceInfo();

      expect(result.totalElements).toBe(0);
      expect(result.renderedElements).toBe(0);
      expect(result.poles.total).toBe(0);
      expect(result.edges.total).toBe(0);
    });
  });

  describe('getPerformanceRecommendations', () => {
    let getRecommendations: (total: number, visible: number) => string[];

    beforeEach(() => {
      // Access private method through bracket notation for testing
      getRecommendations = (testUtils as any).getPerformanceRecommendations.bind(testUtils);
    });

    it('should recommend pagination for high element count', () => {
      const recommendations = getRecommendations(1500, 100);
      expect(recommendations).toContain('⚠️ High element count (1000+). Consider data pagination or clustering.');
    });

    it('should recommend zoom for many visible elements', () => {
      const recommendations = getRecommendations(800, 600);
      expect(recommendations).toContain('⚠️ Many visible elements (500+). Consider increasing zoom level.');
    });

    it('should suggest viewport culling when all elements visible', () => {
      const recommendations = getRecommendations(200, 200);
      expect(recommendations).toContain(
        '💡 All elements visible. Viewport culling not active - zoom in to improve performance.'
      );
    });

    it('should praise excellent culling ratio', () => {
      const recommendations = getRecommendations(1000, 50);
      expect(recommendations).toContain('✅ Excellent culling ratio. Only 5% of elements rendered.');
    });

    it('should return multiple recommendations when applicable', () => {
      const recommendations = getRecommendations(1200, 600);
      expect(recommendations).toHaveLength(2);
      expect(recommendations).toContain('⚠️ High element count (1000+). Consider data pagination or clustering.');
      expect(recommendations).toContain('⚠️ Many visible elements (500+). Consider increasing zoom level.');
    });
  });
});
