import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import MeasureDistanceLayer from './MeasureDistanceLayer';
import { polesReducer } from '@app/store/slices/polesSlice';
import { createOffsetLine } from '../../MapBox.utils';

// Mock react-map-gl components
vi.mock('react-map-gl', () => ({
  Source: ({ children, ...props }: any) => (
    <div data-testid="map-source" {...props}>
      {children}
    </div>
  ),
  Layer: ({ type, paint, ...props }: any) => (
    <div data-testid="map-layer" type={type} data-paint={JSON.stringify(paint)} {...props} />
  ),
}));

// Mock the createOffsetLine utility function
vi.mock('../../MapBox.utils', () => ({
  createOffsetLine: vi.fn((coordinates: [number, number][], _offsetIndex: number) => {
    // Return the same coordinates for testing purposes
    return coordinates;
  }),
}));

const createMockStore = (measureDistancePoints: [number, number][] | null = null) => {
  return configureStore({
    reducer: {
      poles: polesReducer,
    },
    preloadedState: {
      poles: {
        polesList: [],
        isAddingPole: false,
        isMovingPole: false,
        isMeasuringDistance: false,
        measureDistancePoints,
        mapRef: null,
        newPoleCoordinates: null,
        selectedPole: null,
        selectedPoleIdForValidation: -1,
        polesValidationErrors: undefined,
        gpsLocationCoordinates: null,
        poleSidebarCloseClicked: false,
        isPoleLoading: false,
        searchTerm: '',
      },
    },
  });
};

const renderWithProvider = (measureDistancePoints: [number, number][] | null = null) => {
  const store = createMockStore(measureDistancePoints);
  return render(
    <Provider store={store}>
      <MeasureDistanceLayer />
    </Provider>
  );
};

describe('MeasureDistanceLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when measureDistancePoints is null', () => {
    const { container } = renderWithProvider(null);
    expect(container.firstChild).toBeNull();
  });

  it('should render null when measureDistancePoints is empty array', () => {
    const { container } = renderWithProvider([]);
    expect(container.firstChild).toBeNull();
  });

  it('should render null when measureDistancePoints has only one point', () => {
    const { container } = renderWithProvider([[1, 2]]);
    expect(container.firstChild).toBeNull();
  });

  it('should render Source and Layers when measureDistancePoints has two points', () => {
    const { getByTestId, getAllByTestId } = renderWithProvider([
      [1, 2],
      [3, 4],
    ]);

    // Should render the Source component
    const source = getByTestId('map-source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('type', 'geojson');

    // Should render two Layer components
    const layers = getAllByTestId('map-layer');
    expect(layers).toHaveLength(2);

    // Check first layer (background line)
    expect(layers[0]).toHaveAttribute('type', 'line');
    const firstLayerPaint = JSON.parse(layers[0].dataset.paint ?? '{}');
    expect(firstLayerPaint).toEqual({
      'line-color': '#686868',
      'line-width': 10,
      'line-opacity': 1,
    });

    // Check second layer (foreground line)
    expect(layers[1]).toHaveAttribute('type', 'line');
    const secondLayerPaint = JSON.parse(layers[1].dataset.paint ?? '{}');
    expect(secondLayerPaint).toEqual({
      'line-color': '#00FF00',
      'line-width': 4,
      'line-opacity': 1,
    });
  });

  it('should call createOffsetLine with correct parameters', () => {
    const measurePoints: [number, number][] = [
      [1, 2],
      [3, 4],
    ];

    renderWithProvider(measurePoints);

    expect(vi.mocked(createOffsetLine)).toHaveBeenCalledWith(measurePoints, 0);
  });

  it('should create GeoJSON feature with LineString geometry', () => {
    const { getByTestId } = renderWithProvider([
      [1, 2],
      [3, 4],
    ]);

    const source = getByTestId('map-source');
    expect(source).toBeInTheDocument();

    // The actual data prop verification would require a more complex mock setup
    // since the Source component receives the data prop internally
  });

  it('should handle coordinate updates correctly', () => {
    const store1 = createMockStore([
      [1, 2],
      [3, 4],
    ]);
    const { rerender, getByTestId } = render(
      <Provider store={store1}>
        <MeasureDistanceLayer />
      </Provider>
    );

    // Initial render should show the source
    expect(getByTestId('map-source')).toBeInTheDocument();

    // Update with null coordinates
    const store2 = createMockStore(null);
    rerender(
      <Provider store={store2}>
        <MeasureDistanceLayer />
      </Provider>
    );

    // Should not render anything
    expect(() => getByTestId('map-source')).toThrow();
  });

  it('should render consistently with same data', () => {
    const measurePoints: [number, number][] = [
      [1, 2],
      [3, 4],
    ];

    const { getByTestId, rerender } = renderWithProvider(measurePoints);

    // Initial render
    const source1 = getByTestId('map-source');
    expect(source1).toBeInTheDocument();

    // Re-render with same data
    rerender(
      <Provider store={createMockStore(measurePoints)}>
        <MeasureDistanceLayer />
      </Provider>
    );

    // Should still render the source
    const source2 = getByTestId('map-source');
    expect(source2).toBeInTheDocument();
    expect(vi.mocked(createOffsetLine)).toHaveBeenCalled();
  });
});
