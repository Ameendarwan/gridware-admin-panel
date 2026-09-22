import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PolesSelector from './PolesSelector';
import { edgesReducer, type EdgesState } from '@app/store/slices/edgesSlice';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';

const createMockStore = (initialState: { edges?: Partial<EdgesState> } = {}) => {
  return configureStore({
    reducer: {
      edges: edgesReducer,
    },
    preloadedState: {
      edges: {
        isSelectingFromPole: false,
        isSelectingToPole: false,
        selectedFromPole: -1,
        selectedToPole: -1,
        mode: MapMode.NOVIEW,
        ...initialState.edges,
      } as EdgesState,
    },
  });
};

const renderWithProvider = (component: React.ReactNode, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('PolesSelector', () => {
  it('renders both "From" and "To" sections', () => {
    renderWithProvider(<PolesSelector />);

    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getAllByText('Select Pole')).toHaveLength(2);
  });

  it('enables both buttons when not selecting poles', () => {
    renderWithProvider(<PolesSelector />);

    const fromButton = screen.getByTestId('select-from-pole');
    const toButton = screen.getByTestId('select-to-pole');

    expect(fromButton).not.toBeDisabled();
    expect(toButton).not.toBeDisabled();
  });

  it('disables "From" button when selecting from pole', () => {
    const store = createMockStore({
      edges: { isSelectingFromPole: true },
    });

    renderWithProvider(<PolesSelector />, store);

    const fromButton = screen.getByTestId('select-from-pole');
    expect(fromButton).toBeDisabled();
  });

  it('disables "To" button when selecting to pole', () => {
    const store = createMockStore({
      edges: { isSelectingToPole: true },
    });

    renderWithProvider(<PolesSelector />, store);

    const toButton = screen.getByTestId('select-to-pole');
    expect(toButton).toBeDisabled();
  });

  it('hides selected pole numbers when in EDGEEDIT mode', () => {
    const store = createMockStore({
      edges: {
        selectedFromPole: 1,
        selectedToPole: 2,
        mode: MapMode.EDGEEDIT,
      },
    });

    renderWithProvider(<PolesSelector />, store);

    expect(screen.queryByText('From: 1')).not.toBeInTheDocument();
    expect(screen.queryByText('To: 2')).not.toBeInTheDocument();
  });

  it('dispatches setIsSelectingFromPole action when clicking From button', () => {
    const store = createMockStore();
    renderWithProvider(<PolesSelector />, store);

    const fromButton = screen.getByTestId('select-from-pole');
    fireEvent.click(fromButton);

    const state = store.getState();
    expect(state.edges.isSelectingFromPole).toBe(true);
  });

  it('dispatches setIsSelectingToPole action when clicking To button', () => {
    const store = createMockStore();
    renderWithProvider(<PolesSelector />, store);

    const toButton = screen.getByTestId('select-to-pole');
    fireEvent.click(toButton);

    const state = store.getState();
    expect(state.edges.isSelectingToPole).toBe(true);
  });
});
