import { fireEvent, render, screen } from '@testing-library/react';

import { Provider } from 'react-redux';
import RemoveEdgeConfirmation from '@app/pages/Deployments/components/MapBox/components/CreateEdge/components/RemoveEdgeConfirmation/RemoveEdgeConfirmation';
import { configureStore } from '@reduxjs/toolkit';
import { deploymentsApi } from '@app/store/apis/deployments/deployments';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RemoveEdgeConfirmation', () => {
  const mockStore = configureStore({
    reducer: {
      edges: edgesReducer,
      poles: polesReducer,
      [deploymentsApi.reducerPath]: deploymentsApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(deploymentsApi.middleware),
  });

  const defaultProps = {
    triggerComponent: <button>Delete Edge</button>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with trigger component', () => {
    render(
      <Provider store={mockStore}>
        <RemoveEdgeConfirmation {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Delete Edge')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Provider store={mockStore}>
        <RemoveEdgeConfirmation {...defaultProps} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Delete Edge'));

    expect(screen.getByText('Delete Span')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to remove this span?')).toBeInTheDocument();
  });

  it('closes dialog when cancel button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <RemoveEdgeConfirmation {...defaultProps} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Delete Edge'));
    expect(screen.getByText('Delete Span')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('remove-edge-cancel-btn'));
  });
});
