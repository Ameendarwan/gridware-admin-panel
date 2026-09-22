import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import MapControlsLayer from './MapControlsLayer';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';

// Mock the react-map-gl components
vi.mock('react-map-gl', () => ({
  NavigationControl: () => <div data-testid="navigation-control">Navigation Control</div>,
  Marker: ({ longitude, latitude, color }: { longitude: number; latitude: number; color: string }) => (
    <div data-testid="map-marker" data-longitude={longitude} data-latitude={latitude} data-color={color}>
      Map Marker
    </div>
  ),
}));

// Mock the child components
vi.mock('@app/pages/Deployments/components/MapBox/components/MapStyleSwitcher/MapStyleSwitcher', () => ({
  default: () => <div data-testid="map-style-switcher">Map Style Switcher</div>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/MeasureDistance', () => ({
  default: () => <div data-testid="measure-distance">Measure Distance</div>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/AddPole', () => ({
  default: () => <div data-testid="add-pole">Add Pole</div>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/CreateEdge', () => ({
  default: () => <div data-testid="create-edge">Create Edge</div>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/ViewPole/ViewPole', () => ({
  default: ({ pole }: any) => <div data-testid="view-pole">{pole.pole_id}</div>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/components/EditPole', () => ({
  default: ({ pole }: any) => <div data-testid="edit-pole">{pole?.pole_id || 'New Pole'}</div>,
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      poles: polesReducer,
      edges: edgesReducer,
    },
    preloadedState: initialState,
  });
};

describe('MapControlsLayer', () => {
  const defaultProps = {
    selectedLayer: null,
    mapStyle: 'streets',
    setMapStyle: vi.fn(),
  };

  const renderComponent = (props = defaultProps, initialState = {}) => {
    const store = createMockStore(initialState);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <MapControlsLayer {...props} />
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders navigation control', () => {
    renderComponent();
    expect(screen.getByTestId('navigation-control')).toBeInTheDocument();
  });

  it('renders add pole controls when isAddingPole is true', () => {
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: true,
        selectedPole: null,
        mapRef: null,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.NOVIEW,
      },
    });

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Place')).toBeInTheDocument();
  });

  it('does not render add pole controls when isAddingPole is false', () => {
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: null,
        mapRef: null,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.NOVIEW,
      },
    });

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Place')).not.toBeInTheDocument();
  });

  it('renders ViewPole component when in POLEVIEW mode with selected pole', () => {
    const mockPole = { id: '1', pole_id: 'pole_id', name: 'Test Pole' };
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: mockPole,
        mapRef: null,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.POLEVIEW,
      },
    });
    expect(screen.getByTestId('view-pole')).toBeInTheDocument();
    expect(screen.getByText('pole_id')).toBeInTheDocument();
  });

  it('renders EditPole component when in POLEEDIT mode with selected pole', () => {
    const mockPole = { id: '1', pole_id: 'pole_id', name: 'Test Pole' };
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: mockPole,
        mapRef: null,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.POLEEDIT,
      },
    });
    expect(screen.getByTestId('edit-pole')).toBeInTheDocument();
    expect(screen.getByText('pole_id')).toBeInTheDocument();
  });

  it('renders EditPole component when in POLEADD mode', () => {
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: null,
        mapRef: null,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.POLEADD,
      },
    });
    expect(screen.getByTestId('edit-pole')).toBeInTheDocument();
    expect(screen.getByText('New Pole')).toBeInTheDocument();
  });

  it('handles cancel add pole action', () => {
    const mockMapRef = {
      getCanvas: () => ({ style: { cursor: 'pointer' } }),
    };

    renderComponent(defaultProps, {
      poles: {
        isAddingPole: true,
        selectedPole: null,
        mapRef: mockMapRef,
        newPoleCoordinates: null,
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.NOVIEW,
      },
    });

    fireEvent.click(screen.getByText('Cancel'));

    // You can add assertions here to verify the state changes
    // This would require exposing the store or checking for side effects
  });

  it('renders MapStyleSwitcher component', () => {
    renderComponent();
    expect(screen.getByTestId('map-style-switcher')).toBeInTheDocument();
  });

  it('renders MeasureDistance component', () => {
    renderComponent();
    expect(screen.getByTestId('measure-distance')).toBeInTheDocument();
  });

  it('renders AddPole component', () => {
    renderComponent();
    expect(screen.getByTestId('add-pole')).toBeInTheDocument();
  });

  it('renders CreateEdge component', () => {
    renderComponent();
    expect(screen.getByTestId('create-edge')).toBeInTheDocument();
  });

  it('renders Marker when isMovingPole is true', () => {
    const coordinates = [123.456, 78.91];
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: null,
        mapRef: null,
        newPoleCoordinates: coordinates,
        isMovingPole: true,
      },
      edges: {
        mode: MapMode.NOVIEW,
      },
    });

    const marker = screen.getByTestId('map-marker');
    expect(marker).toBeInTheDocument();
    expect(marker.dataset.longitude).toBe('123.456');
    expect(marker.dataset.latitude).toBe('78.91');
    expect(marker.dataset.color).toBe('#FF0000');
  });

  it('does not render Marker when isMovingPole is false', () => {
    renderComponent(defaultProps, {
      poles: {
        isAddingPole: false,
        selectedPole: null,
        mapRef: null,
        newPoleCoordinates: [123.456, 78.91],
        isMovingPole: false,
      },
      edges: {
        mode: MapMode.NOVIEW,
      },
    });

    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });
});
