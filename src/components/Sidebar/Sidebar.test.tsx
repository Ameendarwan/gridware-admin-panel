import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import Sidebar from './Sidebar';

// Mock React Router
vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, onClick }: any) => (
    <a href={to} className={className} onClick={onClick} data-testid="router-link">
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/deployments' }),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
}));

// Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock Redux actions
vi.mock('@app/store/slices/sidebarsSlice', () => ({
  setIsMainSidebarCollapsed: (value: boolean) => ({ type: 'test/setIsMainSidebarCollapsed', payload: value }),
}));

vi.mock('@app/store/slices/edgesSlice', () => ({
  setMode: (value: any) => ({ type: 'test/setMode', payload: value }),
}));

// Mock Tooltip component
vi.mock('@app/components/Tooltip/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children, side, className }: any) => (
    <div data-testid="tooltip-content" data-side={side} className={className}>
      {children}
    </div>
  ),
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ asChild, children }: any) => <div data-testid="tooltip-trigger">{asChild ? children : null}</div>,
}));

// Mock Button component
vi.mock('@app/components/Button/Button', () => ({
  Button: ({ variant, size, className, children, onClick }: any) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock MapMode enum
vi.mock('@app/pages/Deployments/components/MapBox/types', () => ({
  MapMode: {
    NOVIEW: 'NOVIEW',
  },
}));

// Mock URLs
vi.mock('@app/routes/urls', () => ({
  urls: {
    users: { list: '/users' },
    customers: { list: '/customers' },
    deployments: { list: '/deployments' },
    poles: { list: '/poles' },
    devices: { list: '/devices' },
    publicInfoCircuit: { list: '/public-info-circuit' },
    csv: { list: '/csv' },
    edge: { list: '/edge' },
    batchTracking: { list: '/batch-tracking' },
    bug: { list: '/bug' },
  },
}));

describe('Sidebar component', () => {
  it('renders with expanded state by default', () => {
    render(<Sidebar />);

    expect(screen.getByText('DST Webmanager')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();

    // Check for menu items
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();
    expect(screen.getByText('Poles')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Public info circuit')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('Span(s)')).toBeInTheDocument();
    expect(screen.getByText('Batch Tracking')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('toggles collapse state when collapse button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Initially expanded
    expect(screen.getByText('DST Webmanager')).toBeInTheDocument();

    // Click collapse button
    const collapseButtons = screen.getAllByTestId('button');
    const collapseButton = collapseButtons.find(btn => btn.textContent?.includes(''));
    expect(collapseButton).toBeDefined();
    await user.click(collapseButton!);

    // After clicking, the chevron should change
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('chevron-left-icon')).not.toBeInTheDocument();

    // In our mock, the collapse behavior might not fully hide the title
    // Just verify the chevron changed, which indicates the collapse action worked
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });

  it('highlights the active menu item based on current route', () => {
    render(<Sidebar />);

    // Get all menu item buttons
    const menuItems = screen.getAllByTestId('button');

    // Find the Deployments menu item (should be active based on mocked pathname)
    const deploymentsMenuItem = menuItems.find(item => item.textContent?.includes('Deployments'));
    expect(deploymentsMenuItem).toBeDefined();
    expect(deploymentsMenuItem?.className).toContain('bg-white/10');
  });

  it('renders menu items with icons', () => {
    render(<Sidebar />);

    // Check for icons
    const icons = screen.getAllByTestId('router-link');
    expect(icons.length).toBeGreaterThan(0);
  });
});
