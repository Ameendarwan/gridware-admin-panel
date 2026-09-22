import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkerLayer from './MarkerLayer';
import React from 'react';

// Mocks for react-map-gl
vi.mock('react-map-gl', () => ({
  Marker: ({ longitude, latitude, color, children, ...props }: any) => (
    <div data-testid="marker" data-longitude={longitude} data-latitude={latitude} data-color={color} {...props}>
      {children}
    </div>
  ),
  Source: ({ id, type, data, children }: any) => (
    <div data-testid="source" data-id={id} data-type={type} data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Layer: (props: any) => <div data-testid="layer" {...props} />,
}));

// Mock utils
vi.mock('../../MapBox.utils', () => ({
  createCircle: vi.fn(() => ({ type: 'FeatureCollection', features: [] })),
  markerShadowLayer: {},
}));

// Mock MeasureDistanceLayer
vi.mock('../MeasureDistanceLayer', () => ({
  __esModule: true,
  default: () => <div data-testid="measure-distance-layer" />,
}));

// Mock react-redux
type MockState = {
  poles: {
    polesList: Array<{ id: number; long: number; lat: number }>;
    isMeasuringDistance: boolean;
    measureDistancePoints: number[][];
    isAddingPole: boolean;
    newPoleCoordinates: number[] | null;
    gpsLocationCoordinates: {
      long: number;
      lat: number;
      aggregatedDeviceLatitude?: number;
      aggregatedDeviceLongitude?: number;
    } | null;
  };
  edges: {
    selectedFromPole: number;
    selectedToPole: number;
    drawingSpanPoles: Array<{ id: number; long: number; lat: number }>;
  };
};

const mockState: MockState = {
  poles: {
    polesList: [
      { id: 1, long: 10, lat: 20 },
      { id: 2, long: 30, lat: 40 },
    ],
    isMeasuringDistance: false,
    measureDistancePoints: [],
    isAddingPole: false,
    newPoleCoordinates: null,
    gpsLocationCoordinates: null,
  },
  edges: {
    selectedFromPole: 1,
    selectedToPole: 2,
    drawingSpanPoles: [],
  },
};

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<any>('react-redux');
  return {
    ...actual,
    useSelector: (fn: any) => fn(mockState),
  };
});

vi.mock('@app/store/slices/edgesSlice', () => ({
  getMode: () => 'DEFAULT',
}));

// Mock types
vi.mock('../../types', () => ({
  MapMode: { CREATEEDGE: 'CREATEEDGE' },
}));

describe('MarkerLayer', () => {
  beforeEach(() => {
    // Reset mock state if needed
    mockState.poles.isMeasuringDistance = false;
    mockState.poles.measureDistancePoints = [];
    mockState.poles.isAddingPole = false;
    mockState.poles.newPoleCoordinates = null;
    mockState.poles.gpsLocationCoordinates = null;
    mockState.edges.drawingSpanPoles = [];
  });

  it('renders selected pole markers', () => {
    render(<MarkerLayer />);
    const markers = screen.getAllByTestId('marker');
    // Should render two markers for selectedFromPole and selectedToPole
    expect(markers.length).toBe(2);
    expect(markers[0]).toHaveAttribute('data-longitude', '10');
    expect(markers[0]).toHaveAttribute('data-latitude', '20');
    expect(markers[1]).toHaveAttribute('data-longitude', '30');
    expect(markers[1]).toHaveAttribute('data-latitude', '40');
  });

  it('renders drawingSpanPoles markers', () => {
    mockState.edges.drawingSpanPoles = [{ id: 3, long: 50, lat: 60 }];
    render(<MarkerLayer />);
    const markers = screen.getAllByTestId('marker');
    // Should include a marker with longitude 50 and latitude 60
    expect(markers.some(m => m.dataset.longitude === '50' && m.dataset.latitude === '60')).toBe(true);
  });

  it('renders new pole marker when isAddingPole is true', () => {
    mockState.poles.isAddingPole = true;
    mockState.poles.newPoleCoordinates = [70, 80];
    render(<MarkerLayer />);
    const markers = screen.getAllByTestId('marker');
    // Should include a marker with longitude 70, latitude 80, color #FF0000
    expect(
      markers.some(m => m.dataset.longitude === '70' && m.dataset.latitude === '80' && m.dataset.color === '#FF0000')
    ).toBe(true);
  });

  it('renders distance markers and MeasureDistanceLayer when measuring distance', () => {
    mockState.poles.isMeasuringDistance = true;
    mockState.poles.measureDistancePoints = [
      [100, 110],
      [120, 130],
    ];
    render(<MarkerLayer />);
    const markers = screen.getAllByTestId('marker');
    // Should include markers for both distance points
    expect(markers.some(m => m.dataset.longitude === '100' && m.dataset.latitude === '110')).toBe(true);
    expect(markers.some(m => m.dataset.longitude === '120' && m.dataset.latitude === '130')).toBe(true);
    // Should render MeasureDistanceLayer
    expect(screen.getByTestId('measure-distance-layer')).toBeInTheDocument();
  });

  it('renders GPS marker and shadow', () => {
    mockState.poles.gpsLocationCoordinates = {
      long: 200,
      lat: 210,
      aggregatedDeviceLongitude: 200,
      aggregatedDeviceLatitude: 210,
    };
    render(<MarkerLayer />);
    const markers = screen.getAllByTestId('marker');
    // Should include a marker for GPS coordinates
    expect(markers.some(m => m.dataset.longitude === '200' && m.dataset.latitude === '210')).toBe(true);
  });
});
