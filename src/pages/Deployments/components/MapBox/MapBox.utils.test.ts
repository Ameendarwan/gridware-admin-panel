import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turf from '@turf/turf';
import ReactDOMServer from 'react-dom/server';

import {
  poleStatusesMap,
  poleStatuses,
  poleStatusTypes,
  fuseData,
  poleLabelOptionsForCreate,
  poleLabelOptionsForEdit,
  poleDeviceTypes,
  solarIsolationOptions,
  poleImageTypes,
  createOffsetLine,
  getLineStyles,
  calculateLineMidpoint,
  getMarkerSize,
  getSelectedEdgeDetails,
  getSelectedPoleEdgeIds,
  getPoleMarkerName,
  handleOpenGoogleMap,
  getLineColor,
  addAllImagesToMap,
  errorToastDuration,
  mapStyles,
  getLineTypeByKey,
  createCircle,
  markerShadowLayer,
} from './MapBox.utils';

import { Pole } from '@app/store/apis/pole/types';
import { Device } from '@app/store/apis/devices/types';
import { EdgesMap } from '@app/pages/Deployments/components/MapBox/types';

// Mock dependencies
vi.mock('@turf/turf', () => ({
  circle: vi.fn(),
}));

vi.mock('react-dom/server', () => ({
  default: {
    renderToStaticMarkup: vi.fn(),
  },
}));

vi.mock('@app/components/SVGIcon/SVGIcon.utils', () => ({
  ICON_NAMES: {
    'marker-no-metadata': 'marker-no-metadata',
    'marker-unmonitored': 'marker-unmonitored',
    'marker-unmonitored-upstream-device': 'marker-unmonitored-upstream-device',
    'marker-gs': 'marker-gs',
    'marker-weather-station': 'marker-weather-station',
    'marker-not-visible': 'marker-not-visible',
    'marker-blocked': 'marker-blocked',
    'marker-miscellaneous': 'marker-miscellaneous',
    'marker-nonexistent': 'marker-nonexistent',
  },
  icons: {
    'marker-no-metadata': vi.fn(),
    'marker-unmonitored': vi.fn(),
    'marker-unmonitored-upstream-device': vi.fn(),
    'marker-gs': vi.fn(),
    'marker-weather-station': vi.fn(),
    'marker-not-visible': vi.fn(),
    'marker-blocked': vi.fn(),
    'marker-miscellaneous': vi.fn(),
    'marker-nonexistent': vi.fn(),
    'marker-selected-pole': vi.fn(),
    'marker-missing-edge': vi.fn(),
    'marker-missing-upstream': vi.fn(),
    'marker-missing-equipment': vi.fn(),
    'marker-missing-spans': vi.fn(),
  },
}));

vi.mock('@app/pages/Deployments/components/MapBox/types', () => ({
  lineColors: {
    '1.1': '#DE3D82',
    '2.3': '#3DB0DE',
    '3.3': '#A83DDE',
  },
  LineType: {
    Transmission: 'Transmission',
    Primary: 'Primary',
    Secondary: 'Secondary',
  },
  LineTypeKey: {
    Transmission: 'T',
    Primary: 'P',
    Secondary: 'S',
  },
}));

// Helper functions
function createBasePole(overrides = {}): Pole {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test',
    updated_by: null,
    pole_id: 'P1',
    lat: 40.7128,
    long: -74.006,
    status: 'pending',
    status_type: null,
    status_reason: null,
    suitable_for_install: false,
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
    transmission_configuration: null,
    distribution_configuration: null,
    equipments: [],
    is_miscellaneous: false,
    is_archived: false,
    images: [],
    is_eppe_complete_v2: true,
    installed_at: null,
    disabled: false,
    ...overrides,
  };
}

function createMockDevice(overrides = {}): Device {
  return {
    id: 1,
    serial_no: 'GS001',
    type: 'GridScope',
    solar_orientation: 'South',
    description: 'Test device',
    pole_id: 1,
    ...overrides,
  };
}

function createMockEdge(id: number, fromPoleId: number, toPoleId: number, overrides = {}) {
  return {
    id,
    deployment_id: 1,
    from_pole_id: fromPoleId,
    to_pole_id: toPoleId,
    ...overrides,
  };
}

describe('MapBox.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open for handleOpenGoogleMap tests
    Object.defineProperty(globalThis, 'open', {
      writable: true,
      value: vi.fn(),
    });
  });

  describe('Constants', () => {
    it('should export correct poleStatusesMap', () => {
      expect(poleStatusesMap).toEqual({
        pending: 'pending',
        blocked: 'install blocked',
        'not visible': 'not visible',
        Unblocked: 'unblocked',
      });
    });

    it('should export correct poleStatuses array', () => {
      expect(poleStatuses).toHaveLength(4);
      expect(poleStatuses[0]).toEqual({ value: 'pending', label: 'No Status' });
    });

    it('should export correct poleStatusTypes array', () => {
      expect(poleStatusTypes).toHaveLength(6);
      expect(poleStatusTypes[0]).toEqual({ value: 'gated access', label: 'Gated Access' });
    });

    it('should export correct fuseData array', () => {
      expect(fuseData).toHaveLength(2);
      expect(fuseData[0].label).toBe('Fuse 1');
      expect(fuseData[0].indicators).toHaveLength(2);
    });

    it('should export correct pole label options', () => {
      expect(poleLabelOptionsForCreate).toEqual(['NONE', 'MISCELLANEOUS']);
      expect(poleLabelOptionsForEdit).toEqual(['NONE', 'NON EXISTENT', 'DISABLED', 'MISCELLANEOUS']);
    });

    it('should export correct device types', () => {
      expect(poleDeviceTypes).toEqual(['GRIDSCOPE', 'WEATHER STATION', 'LORA GATEWAY']);
    });

    it('should export correct solar isolation options', () => {
      expect(solarIsolationOptions).toEqual(['GOOD', 'IFFY', 'BAD']);
    });

    it('should export correct image types', () => {
      expect(poleImageTypes).toHaveLength(8);
      expect(poleImageTypes[0]).toEqual({ value: 'pole', label: 'Pole' });
    });

    it('should export correct error toast duration', () => {
      expect(errorToastDuration).toBe(8000);
    });

    it('should export correct map styles', () => {
      expect(mapStyles).toHaveLength(3);
      expect(mapStyles[0]).toEqual({ id: 'outdoors-v12', name: 'Outdoor' });
    });

    it('should export correct marker shadow layer', () => {
      expect(markerShadowLayer).toEqual({
        id: 'marker-shadow',
        type: 'fill',
        paint: {
          'fill-color': '#628FEE',
          'fill-opacity': 0.39,
        },
      });
    });
  });

  describe('createOffsetLine', () => {
    it('should create offset line with correct coordinates', () => {
      const coordinates: [number, number][] = [
        [0, 0],
        [1, 1],
      ];
      const offsetIndex = 1;

      const result = createOffsetLine(coordinates, offsetIndex);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
      // The result should be numbers (offset coordinates)
      expect(typeof result[0][0]).toBe('number');
      expect(typeof result[0][1]).toBe('number');
    });

    it('should handle different offset indices', () => {
      const coordinates: [number, number][] = [
        [0, 0],
        [2, 0],
      ];

      const result1 = createOffsetLine(coordinates, 1);
      const result2 = createOffsetLine(coordinates, 2);

      // Different offset indices should produce different results
      expect(result1).not.toEqual(result2);
    });
  });

  describe('getLineStyles', () => {
    it('should return correct styles for selected edge', () => {
      const result = getLineStyles(true);
      expect(result).toEqual({
        lineWidth: 10,
        lineOpacity: 1,
      });
    });

    it('should return correct styles for unselected edge', () => {
      const result = getLineStyles(false);
      expect(result).toEqual({
        lineWidth: 7,
        lineOpacity: 0.5,
      });
    });

    it('should return correct styles when no parameter provided', () => {
      const result = getLineStyles();
      expect(result).toEqual({
        lineWidth: 7,
        lineOpacity: 0.5,
      });
    });
  });

  describe('calculateLineMidpoint', () => {
    it('should calculate midpoint for even number of coordinates', () => {
      const coordinates = [
        [0, 0],
        [2, 2],
        [4, 4],
        [6, 6],
      ];

      const result = calculateLineMidpoint(coordinates);
      expect(result).toEqual([3, 3]);
    });

    it('should calculate midpoint for odd number of coordinates', () => {
      const coordinates = [
        [0, 0],
        [2, 2],
        [4, 4],
      ];

      const result = calculateLineMidpoint(coordinates);
      expect(result).toEqual([1, 1]);
    });

    it('should return null for empty coordinates', () => {
      const result = calculateLineMidpoint([]);
      expect(result).toBeNull();
    });

    it('should return null for single coordinate', () => {
      const coordinates = [[1, 2]];
      const result = calculateLineMidpoint(coordinates);
      expect(result).toBeNull();
    });

    it('should return null for invalid coordinates', () => {
      const result = calculateLineMidpoint(null as any);
      expect(result).toBeNull();
    });

    it('should handle invalid coordinate points', () => {
      const coordinates = [
        [1], // Invalid coordinate
        [2, 3],
      ];
      const result = calculateLineMidpoint(coordinates);
      expect(result).toBeNull();
    });
  });

  describe('getMarkerSize', () => {
    it('should return base size for zoom level 14', () => {
      const result = getMarkerSize(14);
      expect(result).toBe(20);
    });

    it('should return larger size for higher zoom levels', () => {
      const result15 = getMarkerSize(15);
      const result16 = getMarkerSize(16);

      expect(result15).toBeGreaterThan(20);
      expect(result16).toBeGreaterThan(result15);
    });

    it('should use different growth factor for zoom > 20', () => {
      const result20 = getMarkerSize(20);
      const result21 = getMarkerSize(21);

      expect(result21).toBeGreaterThan(result20);
      // Should use growth factor 1.28 instead of 1.24
      const expectedSize21 = 20 * Math.pow(1.28, 21 - 14);
      expect(result21).toBeCloseTo(expectedSize21, 2);
    });

    it('should never return size smaller than base size', () => {
      const result = getMarkerSize(10); // Lower than base zoom
      expect(result).toBe(20);
    });
  });

  describe('getSelectedEdgeDetails', () => {
    it('should return edge details with combined lines', () => {
      const edgesMap: EdgesMap = {
        1: {
          ...createMockEdge(1, 1, 2),
          primaryLines: [
            { phase: 1, line: 1 },
            { phase: 2, line: 3 },
          ],
          transmissionLines: [{ phase: 3, line: 2 }],
        },
      };

      const result = getSelectedEdgeDetails(edgesMap, 1);

      expect(result.selectedEdge).toBe(edgesMap[1]);
      expect(result.combinedLines).toBe('P-1.1 P-2.3 T-3.2');
    });

    it('should handle edge with no lines', () => {
      const edgesMap: EdgesMap = {
        1: createMockEdge(1, 1, 2),
      };

      const result = getSelectedEdgeDetails(edgesMap, 1);

      expect(result.selectedEdge).toBe(edgesMap[1]);
      expect(result.combinedLines).toBe('');
    });

    it('should handle non-existent edge', () => {
      const edgesMap: EdgesMap = {};

      const result = getSelectedEdgeDetails(edgesMap, 999);

      expect(result.selectedEdge).toBeUndefined();
      expect(result.combinedLines).toBe('');
    });
  });

  describe('getSelectedPoleEdgeIds', () => {
    it('should return edge IDs connected to the pole', () => {
      const edgesMap: EdgesMap = {
        1: createMockEdge(1, 5, 10),
        2: createMockEdge(2, 10, 15),
        3: createMockEdge(3, 20, 25),
      };

      const result = getSelectedPoleEdgeIds(edgesMap, 10);

      expect(result).toEqual([1, 2]);
    });

    it('should return empty array for pole with no edges', () => {
      const edgesMap: EdgesMap = {
        1: createMockEdge(1, 5, 10),
      };

      const result = getSelectedPoleEdgeIds(edgesMap, 999);

      expect(result).toEqual([]);
    });

    it('should handle empty edges map', () => {
      const edgesMap: EdgesMap = {};

      const result = getSelectedPoleEdgeIds(edgesMap, 10);

      expect(result).toEqual([]);
    });
  });

  describe('getPoleMarkerName', () => {
    it('should return no-metadata marker for incomplete EPPE', () => {
      const pole = createBasePole({ is_eppe_complete_v2: false });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-no-metadata');
    });

    it('should return unmonitored marker for unmonitored status', () => {
      const pole = createBasePole({ status: 'unmonitored' });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-unmonitored');
    });

    it('should return gridscope marker for installed with gridscope device', () => {
      const pole = createBasePole({
        status: 'installed',
        devices: [createMockDevice()],
      });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-gs');
    });

    it('should return weather station marker for installed with weather station device', () => {
      const pole = createBasePole({
        status: 'installed',
        devices: [
          createMockDevice({ serial_no: 'WS001', type: 'Weather Station', description: 'Test weather station' }),
        ],
      });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-weather-station');
    });

    it('should return not-visible marker for not visible status', () => {
      const pole = createBasePole({ status: 'not visible' });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-not-visible');
    });

    it('should return blocked marker for blocked status', () => {
      const pole = createBasePole({ status: 'install blocked' });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-blocked');
    });

    it('should return miscellaneous marker for miscellaneous pole', () => {
      const pole = createBasePole({ is_miscellaneous: true });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-miscellaneous');
    });

    it('should return miscellaneous marker for archived pole', () => {
      const pole = createBasePole({ is_archived: true });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-miscellaneous');
    });

    it('should return nonexistent marker for disabled pole', () => {
      const pole = createBasePole({ disabled: true });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-nonexistent');
    });

    it('should apply equipment modifiers', () => {
      const pole = createBasePole({
        status: 'unmonitored',
        equipments: ['UPSTREAM DEVICE', 'Riser'],
      });
      const result = getPoleMarkerName(pole);
      // Should try to apply upstream device and riser modifiers but the combined icon doesn't exist,
      // so it falls back to marker-no-metadata
      expect(result).toBe('marker-no-metadata');
    });

    it('should apply equipment modifiers when icon exists', () => {
      const pole = createBasePole({
        status: 'unmonitored',
        equipments: ['UPSTREAM DEVICE'],
      });
      const result = getPoleMarkerName(pole);
      // Should apply upstream device modifier and the icon exists
      expect(result).toBe('marker-unmonitored-upstream-device');
    });

    it('should handle case insensitive status matching', () => {
      const pole = createBasePole({ status: 'UNMONITORED' });
      const result = getPoleMarkerName(pole);
      expect(result).toBe('marker-unmonitored');
    });
  });

  describe('handleOpenGoogleMap', () => {
    it('should open Google Maps with correct coordinates', () => {
      const lat = 40.7128;
      const long = -74.006;

      handleOpenGoogleMap(lat, long);

      expect(window.open).toHaveBeenCalledWith('https://www.google.com/maps?q=40.7128,-74.006', '_blank');
    });
  });

  describe('getLineColor', () => {
    it('should return correct color for known phase.line combination', () => {
      const result = getLineColor(1, 1);
      expect(result).toBe('#DE3D82');
    });

    it('should return default color for unknown phase.line combination', () => {
      const result = getLineColor(9, 9);
      expect(result).toBe('#686868');
    });

    it('should handle undefined parameters', () => {
      const result = getLineColor();
      expect(result).toBe('#686868');
    });
  });

  describe('addAllImagesToMap', () => {
    const mockMapRef = {
      getMap: vi.fn(),
      hasImage: vi.fn(),
      removeImage: vi.fn(),
      addImage: vi.fn(),
    };

    const mockMap = {
      on: vi.fn(),
    };

    // Mock Image class extracted to reduce nesting
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';
      width: number = 0;
      height: number = 0;

      constructor() {
        // Simulate immediate load
        const onloadHandler = this.onload;
        queueMicrotask(() => {
          onloadHandler?.();
        });
      }
    }

    beforeEach(() => {
      mockMapRef.getMap.mockReturnValue(mockMap);
      mockMapRef.hasImage.mockReturnValue(false);
      vi.mocked(ReactDOMServer.renderToStaticMarkup).mockReturnValue('<svg></svg>');

      // Assign the pre-defined mock class
      globalThis.Image = MockImage as any;
    });

    it('should add images to map', () => {
      const uniqueIcons = ['marker-gs', 'marker-unmonitored'] as any[];
      const markerSize = 24;

      addAllImagesToMap(mockMapRef as any, uniqueIcons, markerSize);

      expect(mockMapRef.getMap).toHaveBeenCalled();
      expect(mockMap.on).toHaveBeenCalledWith('style.load', expect.any(Function));
    });

    it('should include additional icons', () => {
      const uniqueIcons = ['marker-gs'] as any[];
      const markerSize = 24;

      addAllImagesToMap(mockMapRef as any, uniqueIcons, markerSize);

      // Should process both unique icons and additional icons
      expect(mockMap.on).toHaveBeenCalled();
    });
  });

  describe('getLineTypeByKey', () => {
    it('should return correct LineType for valid key', () => {
      const result = getLineTypeByKey('T');
      expect(result).toBe('Transmission');
    });

    it('should return undefined for invalid key', () => {
      const result = getLineTypeByKey('X');
      expect(result).toBeUndefined();
    });
  });

  describe('createCircle', () => {
    it('should call turf.circle with correct parameters', () => {
      const lon = -74.006;
      const lat = 40.7128;

      createCircle(lon, lat);

      expect(turf.circle).toHaveBeenCalledWith([lon, lat], 0.1, {
        steps: 64,
        units: 'kilometers',
      });
    });
  });
});
