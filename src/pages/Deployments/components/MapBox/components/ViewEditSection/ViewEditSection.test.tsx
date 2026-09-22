import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { JSX } from 'react/jsx-runtime';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import ViewEditSection from './ViewEditSection';
import { configureStore } from '@reduxjs/toolkit';
import { polesReducer } from '@app/store/slices/polesSlice';

describe('ViewEditSection', () => {
  const initialState = {
    isPoleLoading: false,
    polesList: [],
    selectedPole: null,
  };

  const renderWithStore = (
    component: string | number | boolean | Iterable<ReactNode> | JSX.Element | null | undefined,
    preloadedState = initialState
  ) => {
    const store = configureStore({ reducer: { poles: polesReducer }, preloadedState: { poles: preloadedState } });
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('renders nothing without pole, layer, or specific modes', () => {
    const { container } = renderWithStore(<ViewEditSection pole={null} mode={MapMode.NOVIEW} layer={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders content when layer is provided', () => {
    renderWithStore(
      <ViewEditSection pole={null} mode={MapMode.NOVIEW} layer={{ id: '1', name: 'Test Layer' }}>
        <div>Test Content</div>
      </ViewEditSection>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders content in CREATEEDGE and POLEADD modes', () => {
    renderWithStore(
      <ViewEditSection pole={null} mode={MapMode.POLEADD}>
        <div>Test Content</div>
      </ViewEditSection>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loader and applies blur when isLoading is true', () => {
    renderWithStore(
      <ViewEditSection pole={null} mode={MapMode.POLEADD}>
        <div>Test Content</div>
      </ViewEditSection>,
      { ...initialState, isPoleLoading: true }
    );
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByText('Test Content').parentElement).toHaveClass('blur-[1px]');
  });
});
