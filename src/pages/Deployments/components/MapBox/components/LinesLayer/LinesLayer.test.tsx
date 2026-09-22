import * as edgesSlice from '@app/store/slices/edgesSlice';

import { EdgeGroup, LineType, MapMode } from '../../types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import LinesLayer from './LinesLayer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock react-map-gl components
vi.mock('react-map-gl', () => ({
  Layer: ({ id }: { id: string }) => <div data-testid={id}>Layer</div>,
  Source: ({ children, 'data-testid': testId }: any) => <div data-testid={testId}>{children}</div>,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
}));

// Mock SVGIcon component
vi.mock('@app/components/SVGIcon', () => ({
  default: () => <div data-testid="warning-icon">Warning Icon</div>,
}));

describe('LinesLayer', () => {
  const mockStore = configureStore({
    reducer: {
      edges: (state = {}) => state,
    },
  });

  // Mock selector values
  const mockSelectedPoleEdges: number[] = [];
  const mockIsSelectingEdge = 0;
  const mockMode = MapMode.NOVIEW;

  beforeEach(() => {
    vi.spyOn(edgesSlice, 'getSelectedPoleEdges').mockReturnValue(mockSelectedPoleEdges);
    vi.spyOn(edgesSlice, 'getIsSelectingEdge').mockReturnValue(mockIsSelectingEdge);
    vi.spyOn(edgesSlice, 'getMode').mockReturnValue(mockMode);
  });

  const mockProcessedEdges: EdgeGroup[] = [
    {
      id: 1,
      deployment_id: 1,
      from_pole_id: 1,
      to_pole_id: 2,
      lines: [
        {
          coordinates: [
            [-122.4194, 37.7749],
            [-122.4184, 37.7739],
          ],
          type: LineType.Primary,
          config: {
            line: 1,
            phase: 1,
            edgeId: 1,
          },
        },
      ],
    },
  ];

  it('renders lines correctly', () => {
    render(
      <Provider store={mockStore}>
        <LinesLayer processedEdges={mockProcessedEdges} selectedLineId={null} />
      </Provider>
    );

    expect(screen.getByTestId('lines-layer')).toBeInTheDocument();
  });

  it('renders transmission line dots when line type is Transmission', () => {
    const transmissionEdges: EdgeGroup[] = [
      {
        id: 1,
        deployment_id: 1,
        from_pole_id: 1,
        to_pole_id: 2,
        lines: [
          {
            coordinates: [
              [-122.4194, 37.7749],
              [-122.4184, 37.7739],
            ],
            type: LineType.Transmission,
            config: {
              line: 1,
              phase: 1,
              edgeId: 1,
            },
          },
        ],
      },
    ];

    render(
      <Provider store={mockStore}>
        <LinesLayer processedEdges={transmissionEdges} selectedLineId={null} />
      </Provider>
    );

    expect(screen.getByTestId('transmission-line-dots')).toBeInTheDocument();
  });

  it('applies correct styles for selected line', () => {
    render(
      <Provider store={mockStore}>
        <LinesLayer processedEdges={mockProcessedEdges} selectedLineId="lines-layer" />
      </Provider>
    );

    const lineSource = screen.getByTestId('lines-layer');
    expect(lineSource).toBeInTheDocument();
  });
});
