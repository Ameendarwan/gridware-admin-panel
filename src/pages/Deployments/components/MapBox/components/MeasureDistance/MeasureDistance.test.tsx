import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MeasureDistance from './MeasureDistance';
import React from 'react';

// Mock turf
vi.mock('@turf/turf', () => ({
  point: (coords: number[]) => coords,
  distance: vi.fn(() => 1.23456),
}));

// Mock redux hooks and actions
const mockDispatch = vi.fn();
let mockDistancePoints: number[][] | null = null;

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<any>('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: (fn: any) => fn({ poles: { measureDistancePoints: mockDistancePoints } }),
  };
});

vi.mock('@app/store/slices/polesSlice', () => ({
  setIsMeasuringDistance: (val: boolean) => ({ type: 'setIsMeasuringDistance', payload: val }),
  setMeasureDistancePoints: (val: any) => ({ type: 'setMeasureDistancePoints', payload: val }),
}));

// Mock UI components
vi.mock('@app/components/Popover/Popover', () => ({
  Popover: ({ open, children }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
}));
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock('@app/components/Separator/Separator', () => ({
  Separator: ({ children, ...props }: any) => (
    <div data-testid="separator" {...props}>
      {children}
    </div>
  ),
}));
vi.mock('@app/components/SVGIcon', () => ({
  __esModule: true,
  default: ({ icon }: any) => <span data-testid="svg-icon">{icon}</span>,
}));

describe('MeasureDistance', () => {
  const renderMeasureDistance = () => render(<MeasureDistance />);

  const openPopoverAndClickCreate = () => {
    const popovers = screen.getAllByTestId('popover');
    fireEvent.mouseEnter(popovers.at(-1)!);
    fireEvent.click(screen.getByText('Create a new measurement'));
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    mockDistancePoints = null;
  });

  it('renders the measure distance button', () => {
    renderMeasureDistance();
    expect(screen.getByTestId('svg-icon')).toHaveTextContent('measure-distance');
  });

  it('opens popover on mouse enter and shows create measurement', () => {
    renderMeasureDistance();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    expect(screen.getByText('Measure distances and areas')).toBeInTheDocument();
    expect(screen.getByText('Create a new measurement')).toBeInTheDocument();
  });

  it('starts measuring when clicking create measurement', () => {
    renderMeasureDistance();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    fireEvent.click(screen.getByText('Create a new measurement'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setIsMeasuringDistance', payload: true });
  });

  it('shows correct message for 0, 1, and 2 points', () => {
    // 0 points
    renderMeasureDistance();
    openPopoverAndClickCreate();
    expect(screen.getByText('Start creating a measurement by adding points to the map')).toBeInTheDocument();
    // 1 point
    mockDistancePoints = [[1, 2]];
    renderMeasureDistance();
    openPopoverAndClickCreate();
    expect(screen.getByText('Select another point')).toBeInTheDocument();
    // 2 points
    mockDistancePoints = [
      [1, 2],
      [3, 4],
    ];
    renderMeasureDistance();
    openPopoverAndClickCreate();
    expect(screen.getByText(/Path Distance:/)).toBeInTheDocument();
    expect(screen.getByText(/1.23 Kilometers/)).toBeInTheDocument();
  });

  it('cancels and finishes measurement', () => {
    renderMeasureDistance();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    fireEvent.click(screen.getByText('Create a new measurement'));
    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setIsMeasuringDistance', payload: false });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setMeasureDistancePoints', payload: null });
    // Finish
    fireEvent.click(screen.getByText('Create a new measurement'));
    fireEvent.click(screen.getByText('Finish measurement'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setIsMeasuringDistance', payload: false });
  });
});
