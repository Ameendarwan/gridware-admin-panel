import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MapStyleSwitcher from './MapStyleSwitcher';
import React from 'react';

// Mock dependencies
vi.mock('@app/components/Popover/Popover', () => ({
  Popover: ({ open, children }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
}));

vi.mock('@app/components/Tooltip/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@app/components/SVGIcon', () => ({
  __esModule: true,
  default: ({ icon }: any) => <span data-testid="svg-icon">{icon}</span>,
}));

vi.mock('@app/pages/Deployments/components/MapBox/MapBox.utils', () => ({
  mapStyles: [
    { id: 'light-v10', name: 'Light' },
    { id: 'dark-v10', name: 'Dark' },
  ],
}));

describe('MapStyleSwitcher', () => {
  let setMapStyle: ReturnType<typeof vi.fn>;
  let mapStyle: string;

  const renderMapStyleSwitcher = () => {
    return render(<MapStyleSwitcher mapStyle={mapStyle} setMapStyle={setMapStyle} />);
  };

  beforeEach(() => {
    setMapStyle = vi.fn();
    mapStyle = 'mapbox://styles/mapbox/light-v10';
  });

  it('renders the map style switcher button', () => {
    renderMapStyleSwitcher();
    expect(screen.getByTestId('svg-icon')).toHaveTextContent('map-layers');
    expect(screen.getByText('Change Map Style')).toBeInTheDocument();
  });

  it('shows map style options on mouse enter', () => {
    renderMapStyleSwitcher();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('calls setMapStyle with correct style id when a style is clicked', () => {
    renderMapStyleSwitcher();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    const darkButton = screen.getByText('Dark');
    fireEvent.click(darkButton);
    expect(setMapStyle).toHaveBeenCalledWith('mapbox://styles/mapbox/dark-v10');
  });

  it('highlights the selected style', () => {
    renderMapStyleSwitcher();
    fireEvent.mouseEnter(screen.getByTestId('popover'));
    const lightButton = screen.getByText('Light');
    expect(lightButton.className).toContain('bg-gray-300');
    const darkButton = screen.getByText('Dark');
    expect(darkButton.className).not.toContain('bg-gray-300');
  });
});
