import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MapMode } from '../../types';
import { Provider } from 'react-redux';
import ViewPole from './ViewPole';
import { configureStore } from '@reduxjs/toolkit';
import { edgesReducer } from '@app/store/slices/edgesSlice';
import { polesReducer } from '@app/store/slices/polesSlice';
import { mockSVGIconComponent, mockBadgeComponent } from '@app/utils/testHelpers';
import { createBasePole } from '../../hooks/testHelpers';

// Mocks
mockSVGIconComponent();
mockBadgeComponent();

// Mock PoleImageSection to check props
vi.mock('../PoleImageSection', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="pole-image-section" data-props={JSON.stringify(props)} />,
}));
vi.mock('@app/components/Label/Label', () => ({
  __esModule: true,
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
vi.mock('@app/components/Separator/Separator', () => ({
  __esModule: true,
  Separator: () => <div data-testid="separator" />,
}));
vi.mock('@app/utils/formatDate', () => ({
  formatDate: (val: any) => `formatted(${val})`,
}));
vi.mock('@app/pages/Deployments/components/MapBox/MapBox.utils', () => ({
  getPoleMarkerName: () => 'marker-gs',
}));

const handleEditPoleMock = vi.fn();
const basePole = createBasePole();

const getMockEdgesState = (mode: MapMode): any => ({
  selectedEdgeId: -1,
  deploymentId: 1,
  edgesList: [],
  edgesMap: {},
  isSelectingFromPole: false,
  isSelectingToPole: false,
  selectedFromPole: -1,
  selectedToPole: -1,
  selectedPoleEdges: [],
  mode,
  isSelectingEdge: null,
  isDuplicateEdge: false,
  spansList: [],
  spansData: [],
  drawingSpanPoles: [],
});

const getMockPolesState = (polesList: any[]): any => ({
  polesList,
  isAddingPole: false,
  isMovingPole: false,
  isMeasuringDistance: false,
  measureDistancePoints: null,
  mapRef: undefined,
  newPoleCoordinates: undefined,
  selectedPole: null,
  polesValidationErrors: undefined,
  selectedPoleIdForValidation: -1,
  poleSidebarCloseClicked: false,
  isPoleLoading: false,
  gpsLocationCoordinates: null,
  searchTerm: '',
});

const renderComponent = (pole = basePole, mode = MapMode.POLEVIEW, polesList = [basePole]) => {
  const store = configureStore({
    reducer: {
      edges: edgesReducer,
      poles: polesReducer,
    },
    preloadedState: {
      edges: getMockEdgesState(mode),
      poles: getMockPolesState(polesList),
    },
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ViewPole pole={pole} handleEditPole={handleEditPoleMock} />
      </BrowserRouter>
    </Provider>
  );
};

describe('ViewPole Component', () => {
  it('renders all main label sections and values', () => {
    renderComponent();
    expect(screen.getByText('Pole ID')).toBeInTheDocument();
    expect(screen.getByText('P-123')).toBeInTheDocument();
    expect(screen.getByText('Pole Label')).toBeInTheDocument();
    expect(screen.getByText('Pole Status')).toBeInTheDocument();
    expect(screen.getByText('Inaccessible Reason')).toBeInTheDocument();
    expect(screen.getByText('Inaccessible Comment')).toBeInTheDocument();
    expect(screen.getByText('Long')).toBeInTheDocument();
    expect(screen.getByText('Lat')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Circuit Protection Equipment')).toBeInTheDocument();
    expect(screen.getByText('Pole Notes')).toBeInTheDocument();
    expect(screen.getByText('Device Notes')).toBeInTheDocument();
    expect(screen.getByText('Created by')).toBeInTheDocument();
    expect(screen.getByText('Created at')).toBeInTheDocument();
    expect(screen.getByText('Updated by')).toBeInTheDocument();
    expect(screen.getByText('Updated at')).toBeInTheDocument();
    expect(screen.getByText('Status Changed at')).toBeInTheDocument();
    expect(screen.getByText('Status Changed by')).toBeInTheDocument();
    expect(screen.getByText('Last Date Access Attempted')).toBeInTheDocument();
    expect(screen.getByText('Number of Active Spans')).toBeInTheDocument();
    expect(screen.getByText('Has_Spans Connected (Yes / No)')).toBeInTheDocument();
  });

  it('renders all values and formatted dates', () => {
    renderComponent();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Safety concern')).toBeInTheDocument();
    expect(screen.getByText('checking')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Gridscope')).toBeInTheDocument();
    expect(screen.getByText('GS15124123')).toBeInTheDocument();
    expect(screen.getByText('CONNECTED')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('OT123')).toBeInTheDocument();
    expect(screen.getByText('DID NOT CONNECT')).toBeInTheDocument();
    expect(screen.getByText('Transformer')).toBeInTheDocument();
    expect(screen.getByText('Fuse')).toBeInTheDocument();
    expect(screen.getByText('Some notes')).toBeInTheDocument();
    expect(screen.getByText('Device notes')).toBeInTheDocument();
    expect(screen.getByText('formatted(user1)')).toBeInTheDocument();
    // There are two formatted(2023-01-01) values, so use getAllByText
    expect(screen.getAllByText('formatted(2023-01-01)').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('formatted(user2)')).toBeInTheDocument();
    expect(screen.getByText('formatted(2023-01-02)')).toBeInTheDocument();
    expect(screen.getByText('formatted(2023-01-03)')).toBeInTheDocument();
    expect(screen.getByText('formatted(user3)')).toBeInTheDocument();
    expect(screen.getByText('formatted(2023-01-04)')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders correct pole label for disabled, archived, miscellaneous, none', () => {
    renderComponent(createBasePole({ disabled: true }));
    expect(screen.getByText('NON EXISTENT')).toBeInTheDocument();
    renderComponent(createBasePole({ disabled: false, is_archived: true }));
    expect(screen.getByText('DISABLED')).toBeInTheDocument();
    renderComponent(createBasePole({ disabled: false, is_archived: false, is_miscellaneous: true }));
    expect(screen.getByText('MISCELLANEOUS')).toBeInTheDocument();
    renderComponent(createBasePole({ disabled: false, is_archived: false, is_miscellaneous: false }));
    expect(screen.getByText('NONE')).toBeInTheDocument();
  });

  it('renders N/A for empty/null fields', () => {
    const emptyPole = { id: 2 };
    renderComponent(emptyPole as any);
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders nothing if mode is not POLEVIEW', () => {
    const { container } = renderComponent(basePole, MapMode.NOVIEW);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders with multiple devices and equipment', () => {
    const pole = createBasePole({
      devices: [
        {
          id: 1,
          type: 'A',
          serial_no: 'S1',
          is_blinked: true,
          solar_orientation: 'NORTH',
          description: '',
          pole_id: 1,
        },
        {
          id: 2,
          type: 'B',
          serial_no: 'S2',
          is_blinked: false,
          solar_orientation: 'SOUTH',
          description: '',
          pole_id: 1,
        },
      ],
      equipments: ['E1', 'E2', 'E3'],
    });
    renderComponent(pole);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('S1')).toBeInTheDocument();
    expect(screen.getByText('S2')).toBeInTheDocument();
    expect(screen.getByText('E1')).toBeInTheDocument();
    expect(screen.getByText('E2')).toBeInTheDocument();
    expect(screen.getByText('E3')).toBeInTheDocument();
  });

  it('renders PoleImageSection with correct props', () => {
    renderComponent();
    const poleImageSection = screen.getByTestId('pole-image-section');
    const props = JSON.parse(poleImageSection.dataset.props!);
    expect(props.pole).toBeDefined();
    expect(props.disableUpload).toBe(true);
    // handleEditPole is a function and will not be present after JSON.stringify
    expect(props.poleIconName).toBe('marker-gs');
  });
});
