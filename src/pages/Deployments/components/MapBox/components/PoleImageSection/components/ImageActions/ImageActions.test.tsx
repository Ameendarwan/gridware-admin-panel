import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import ImageActions from './ImageActions';
import { ImageType } from '@app/store/apis/pole/types';
import { MapMode } from '../../../../types';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { edgesReducer } from '@app/store/slices/edgesSlice';

const renderComponent = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      edges: edgesReducer,
    },
    preloadedState: {
      edges: {
        selectedFromPole: -1,
        selectedToPole: -1,
        deploymentId: 2342423,
        edgesList: [],
        spansData: [],
        edgesMap: {},
        mode: MapMode.POLEEDIT,
        selectedEdgeId: -1,
        isSelectingFromPole: false,
        isSelectingToPole: false,
        selectedPoleEdges: [],
        isSelectingEdge: -1,
        isDuplicateEdge: false,
        ...initialState,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          <ImageActions imageType={ImageType.Pole} handleImageType={vi.fn()} />
        </BrowserRouter>
      </Provider>
    ),
  };
};

describe('ImageActions component', () => {
  it('does not render delete button when mode is not POLEEDIT', () => {
    const initialState = {
      edges: {
        mode: MapMode.NOVIEW,
      },
    };
    renderComponent(initialState);
    expect(screen.queryByText('Yes, delete')).not.toBeInTheDocument();
  });
});
