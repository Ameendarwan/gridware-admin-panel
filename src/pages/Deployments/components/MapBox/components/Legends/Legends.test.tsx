import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import Legends from '../Legends';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Create a proper reducer
const initialEdgesState = { spansList: [], edgesList: [] };
const edgesReducer = (state: any, _action: any) => {
  return state ?? initialEdgesState;
};

// Mock store creator with proper reducer
const createMockStore = (initialState: any) => {
  return configureStore({
    reducer: {
      edges: edgesReducer,
    },
    preloadedState: {
      edges: initialState,
    },
  });
};

// Mock the getLineColor utility function
vi.mock('@app/pages/Deployments/components/MapBox/MapBox.utils', () => ({
  getLineColor: () => '#000000',
  getLineTypeByKey: vi.fn(() => 'Primary'),
}));

describe('Legends Component', () => {
  it('should render null when spansList is empty', () => {
    const mockStore = createMockStore({
      spansList: [],
      edgesList: [],
    });

    const { container } = render(
      <Provider store={mockStore}>
        <Legends />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render loader when spansList length is 0', () => {
    const mockStore = createMockStore({
      spansList: [],
      edgesList: ['edge1'],
    });

    render(
      <Provider store={mockStore}>
        <Legends />
      </Provider>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render visible spans (up to 5)', () => {
    const mockSpans = ['L-1.1', 'T-2.1', 'L-3.1'];
    const mockStore = createMockStore({
      spansList: mockSpans,
      edgesList: ['edge1'],
    });

    render(
      <Provider store={mockStore}>
        <Legends />
      </Provider>
    );

    for (const span of mockSpans) {
      expect(screen.getByText(span)).toBeInTheDocument();
    }
  });

  it('should show "+X more" when there are more than 5 spans', () => {
    const mockSpans = ['L-1.1', 'T-2.1', 'L-3.1', 'L-4.1', 'L-5.1', 'L-6.1', 'L-7.1'];
    const mockStore = createMockStore({
      spansList: mockSpans,
      edgesList: ['edge1'],
    });

    render(
      <Provider store={mockStore}>
        <Legends />
      </Provider>
    );

    // Check if first 5 spans are visible
    for (const span of mockSpans.slice(0, 5)) {
      expect(screen.getByText(span)).toBeInTheDocument();
    }

    // Check if "+2 more" text is present
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should apply dashed border for T-type spans', () => {
    const mockSpans = ['T-1.1'];
    const mockStore = createMockStore({
      spansList: mockSpans,
      edgesList: ['edge1'],
    });

    render(
      <Provider store={mockStore}>
        <Legends />
      </Provider>
    );

    const bulletElement = screen.getByTestId('bullet');
    expect(bulletElement).toHaveClass('border-dashed');
  });
});
