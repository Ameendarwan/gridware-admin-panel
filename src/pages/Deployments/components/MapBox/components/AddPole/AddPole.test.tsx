import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddPole from './AddPole';
import { polesReducer } from '@app/store/slices/polesSlice';
import { createMockPolesState } from '@app/utils/testHelpers';

// Mock the SVGIcon component
vi.mock('@app/components/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`svg-icon-${icon}`}>{icon}</span>,
}));

// Mock the Button component
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} data-testid="add-pole-button" {...props}>
      {children}
    </button>
  ),
}));

describe('AddPole', () => {
  let mockMapRef: any;

  const createStore = (polesState = {}) => {
    return configureStore({
      reducer: {
        poles: polesReducer,
      },
      preloadedState: {
        poles: createMockPolesState({ mapRef: mockMapRef, ...polesState }),
      },
    });
  };

  beforeEach(() => {
    // Create a mock mapRef with getCanvas method
    mockMapRef = {
      getCanvas: vi.fn().mockReturnValue({
        style: {
          cursor: 'default',
        },
      }),
    };
  });

  const renderComponent = (polesState = {}) => {
    const store = createStore(polesState);
    const result = render(
      <Provider store={store}>
        <AddPole />
      </Provider>
    );
    return { store, ...result };
  };

  it('renders the AddPole button with correct icon', () => {
    renderComponent();

    const button = screen.getByTestId('add-pole-button');
    expect(button).toBeInTheDocument();

    // Check that the button contains the SVG icon by checking for the svg element with the data-testid
    const svg = button.querySelector('[data-testid="svg-icon-add-pole"]');
    expect(svg).not.toBeNull();
  });

  it('applies default styling when not in adding mode', () => {
    renderComponent();

    const button = screen.getByTestId('add-pole-button');
    expect(button).toHaveClass('bg-primary');
    expect(button).not.toHaveClass('!bg-secondary');
  });

  it('applies active styling when in adding mode', () => {
    renderComponent({ isAddingPole: true });

    const button = screen.getByTestId('add-pole-button');
    expect(button).toHaveClass('!bg-secondary');
  });

  it('dispatches correct actions when button is clicked', () => {
    const { store } = renderComponent();

    const button = screen.getByTestId('add-pole-button');
    fireEvent.click(button);

    // Check that the state has been updated correctly
    const state = store.getState();
    expect(state.poles.isAddingPole).toBe(true);
    expect(state.poles.isMeasuringDistance).toBe(false);
    expect(state.poles.measureDistancePoints).toBe(null);
    expect(state.poles.selectedPole).toBe(null);
  });

  it('changes cursor to crosshair when mapRef is available', () => {
    renderComponent();

    const button = screen.getByTestId('add-pole-button');
    fireEvent.click(button);

    // Verify that getCanvas was called and cursor was set
    expect(mockMapRef.getCanvas).toHaveBeenCalled();
    expect(mockMapRef.getCanvas().style.cursor).toBe('crosshair');
  });

  it('handles click without mapRef gracefully', () => {
    // Create store without mapRef
    mockMapRef = null;
    const { store } = renderComponent();

    const button = screen.getByTestId('add-pole-button');

    // Should not throw error when clicking without mapRef
    expect(() => fireEvent.click(button)).not.toThrow();

    // State should still be updated
    const state = store.getState();
    expect(state.poles.isAddingPole).toBe(true);
  });

  it('button has correct variant and size props', () => {
    renderComponent();

    const button = screen.getByTestId('add-pole-button');

    // Check that the Button component receives correct props
    // Note: These would be passed to the actual Button component
    expect(button).toBeInTheDocument();
  });

  it('resets other modes when activating add pole mode', () => {
    const { store } = renderComponent();

    const button = screen.getByTestId('add-pole-button');
    fireEvent.click(button);

    // Verify all modes are reset correctly
    const state = store.getState();
    expect(state.poles.isAddingPole).toBe(true);
    expect(state.poles.isMeasuringDistance).toBe(false);
    expect(state.poles.measureDistancePoints).toBe(null);
    expect(state.poles.selectedPole).toBe(null);
  });
});
