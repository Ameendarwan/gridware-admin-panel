import { vi } from 'vitest';
import React from 'react';

/**
 * Common mock for DataTable utils used across multiple test files
 */
export const mockDataTableUtils = () => {
  vi.mock('@app/components/DataTable/DataTable.utils', () => ({
    createColumn: vi.fn((...args) => args),
    getCommonColumns: vi.fn(() => []),
    formatDate: vi.fn(v => v),
    formatDateUtc: vi.fn(v => v),
    TextCell: ({ row, accessorKey, transform }: any) => (
      <div data-testid={`textcell-${accessorKey}`}>{transform ? transform(row[accessorKey]) : row[accessorKey]}</div>
    ),
  }));
};

/**
 * Common mock for column helpers used across multiple test files
 */
export const mockColumnHelpers = () => {
  vi.mock('@app/utils/columnHelpers', () => ({
    createAuditColumns: vi.fn(() => []),
    createDeploymentColumns: vi.fn(() => []),
    createIdColumn: vi.fn(() => []),
    createCreatedAtColumn: vi.fn(() => []),
    createUpdatedAtColumn: vi.fn(() => []),
    createCreatedByColumn: vi.fn(() => []),
    createUpdatedByColumn: vi.fn(() => []),
  }));
};

/**
 * Common mock for Grid component
 */
export const mockGridComponent = () => {
  vi.mock('@app/components/Grid', () => ({
    __esModule: true,
    default: ({ url, buttonText, onButtonClick, getColumns }: any) => (
      <div>
        {buttonText && (
          <button data-testid="action-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
        <div data-testid="grid-url">{url}</div>
        <div data-testid="columns">{JSON.stringify(getColumns())}</div>
      </div>
    ),
  }));
};

/**
 * Common mock for Badge component
 */
export const mockBadgeComponent = () => {
  vi.mock('@app/components/Badge/Badge', () => ({
    Badge: ({ children, ...props }: any) => (
      <span data-testid="badge" {...props}>
        {children}
      </span>
    ),
  }));
};

/**
 * Common mock for SVGIcon component
 */
export const mockSVGIconComponent = () => {
  vi.mock('@app/components/SVGIcon', () => ({
    __esModule: true,
    default: ({ icon, width, height, color }: any) => (
      <svg data-testid={`svg-icon-${icon}`} data-icon={icon} width={width} height={height} className={color} />
    ),
  }));
};

/**
 * Common mock for TruncatedTextCell component
 */
export const mockTruncatedTextCell = () => {
  vi.mock('@app/components/TruncateText/TruncateText', () => ({
    __esModule: true,
    default: ({ value }: any) => <span data-testid="truncated">{value}</span>,
  }));
};

/**
 * Common mock for Loader component
 */
export const mockLoaderComponent = () => {
  vi.mock('@app/components/Loader/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader" />,
  }));
};

/**
 * Common mock for Card component
 */
export const mockCardComponent = () => {
  vi.mock('@app/components/Card/Card', () => ({
    Card: ({ children }: any) => <div data-testid="mock-card">{children}</div>,
    CardContent: ({ children }: any) => <div data-testid="mock-card-content">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="mock-card-header">{children}</div>,
    CardTitle: ({ children }: any) => <div data-testid="mock-card-title">{children}</div>,
  }));
};

/**
 * Common mock for Card components (alias for mockCardComponent)
 */
export const mockCardComponents = mockCardComponent;

/**
 * Common mock for Form components
 */
export const mockFormComponents = () => {
  vi.mock('@app/components/Form/Form', async () => {
    const actual = await vi.importActual<any>('@app/components/Form/Form');
    return {
      ...actual,
      FormControl: ({ children }: any) => <div>{children}</div>,
      FormDescription: ({ children }: any) => <div>{children}</div>,
    };
  });
};

/**
 * Common mock for Button component
 */
export const mockButtonComponent = () => {
  vi.mock('@app/components/Button/Button', () => ({
    Button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} data-testid={props['data-testid'] || 'button'} {...props}>
        {children}
      </button>
    ),
  }));
};

/**
 * Common mock for Input component
 */
export const mockInputComponent = () => {
  vi.mock('@app/components/Input/Input', () => ({
    Input: (props: any) => <input {...props} />,
  }));
};

/**
 * Common mock for react-router-dom with navigate and searchParams
 */
export const mockReactRouter = (mockNavigate = vi.fn(), mockSetSearchParams = vi.fn()) => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
      Link: ({ to, children, ...props }: any) => (
        <a href={to} {...props}>
          {children}
        </a>
      ),
    };
  });
  return { mockNavigate, mockSetSearchParams };
};

/**
 * Common mock for API config
 */
export const mockAPIConfig = () => {
  vi.mock('@app/lib/api-config', () => ({
    API: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }));
};

/**
 * Common mock for toast notifications
 */
export const mockToast = () => {
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }));
};

/**
 * Common mock for Redux store mutations
 */
export const createMockMutations = () => {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
  };
};

/**
 * Factory to create mock pole data
 */
export const createMockPole = (overrides = {}) => {
  return {
    id: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    created_by: 'test-user',
    updated_by: null,
    pole_id: 'POLE-001',
    lat: 40.7128,
    long: -74.006,
    status: 'active',
    searchTerm: '',
    status_type: null,
    status_reason: null,
    suitable_for_install: true,
    network_strength: null,
    solar_strength: null,
    primary_circuit_protective_equipment: false,
    surveyor_notes: null,
    installation_notes: null,
    vegetation_notes: null,
    vegetation_condition: null,
    gate_unlock_mobile_no: null,
    gate_unlock_address: null,
    gate_unlock_instructions: null,
    deployment_id: 1,
    enabled_spans_count: 0,
    transmission_configuration: null,
    distribution_configuration: null,
    equipments: [],
    is_miscellaneous: false,
    is_archived: false,
    images: [],
    is_eppe_complete_v2: false,
    has_span_connected: false,
    is_new_pole: null,
    installed_at: null,
    disabled: false,
    devices: [],
    ...overrides,
  };
};

/**
 * Factory to create mock device data
 */
export const createMockDevice = (id: number, serialNo: string, type = 'sensor') => {
  return {
    id,
    serial_no: serialNo,
    type,
    solar_orientation: '',
    description: '',
    pole_id: 1,
  };
};

/**
 * Helper to render Badge component with default props
 * Note: Pass the Badge component directly to avoid JSX issues
 */
export const renderBadgeHelper = (Badge: any, props: any, renderFn: any, screenFn: any) => {
  renderFn(<Badge {...props}>{props.children}</Badge>);
  return screenFn.getByText(props.children as string);
};

/**
 * Mock cn utility function for testing
 */
export const mockCnUtility = () => {
  vi.mock('@app/lib/utils', () => ({
    cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
  }));
};

/**
 * Create mock table state for DataTable testing
 */
export const createMockTableState = (overrides = {}) => ({
  pagination: {
    pageIndex: 1,
    pageSize: 10,
  },
  columnVisibility: {},
  columnOrder: [],
  columnPinning: { left: [], right: [] },
  rowPinning: { top: [], bottom: [] },
  columnFilters: [],
  globalFilter: '',
  sorting: [],
  columnSizing: {},
  columnSizingInfo: {
    startOffset: null,
    startSize: null,
    deltaOffset: null,
    deltaPercentage: null,
    isResizingColumn: false as const,
    columnSizingStart: [],
  },
  expanded: {},
  grouping: [],
  rowSelection: {},
  ...overrides,
});

/**
 * Create mock TanStack table instance for testing
 */
export const createMockTable = (options = {}) => {
  const mockTable = {
    _features: [],
    _getAllFlatColumnsById: vi.fn(),
    _getColumnDefs: vi.fn(),
    _getDefaultColumnDef: vi.fn(),
    options: { state: {} },
    getCoreRowModel: vi.fn(() => ({ rows: [] })),
    getState: vi.fn(() => createMockTableState()),
    getRowModel: vi.fn(() => ({ rows: [] })),
    getPaginationRowModel: vi.fn(() => ({ rows: [] })),
    getFilteredRowModel: vi.fn(() => ({ rows: [] })),
    getSortedRowModel: vi.fn(() => ({ rows: [] })),
    getGroupedRowModel: vi.fn(() => ({ rows: [] })),
    getExpandedRowModel: vi.fn(() => ({ rows: [] })),
    getPreFilteredRowModel: vi.fn(() => ({ rows: [] })),
    getPrePaginationRowModel: vi.fn(() => ({ rows: [] })),
    getPreSortedRowModel: vi.fn(() => ({ rows: [] })),
    setOptions: vi.fn(),
    reset: vi.fn(),
    getColumn: vi.fn(),
    getAllColumns: vi.fn(() => []),
    getAllFlatColumns: vi.fn(() => []),
    getAllLeafColumns: vi.fn(() => []),
    getVisibleFlatColumns: vi.fn(() => []),
    getVisibleLeafColumns: vi.fn(() => []),
    getLeftVisibleLeafColumns: vi.fn(() => []),
    getRightVisibleLeafColumns: vi.fn(() => []),
    getCenterVisibleLeafColumns: vi.fn(() => []),
    getHeaderGroups: vi.fn(() => []),
    getFooterGroups: vi.fn(() => []),
    getFlatHeaders: vi.fn(() => []),
    getLeafHeaders: vi.fn(() => []),
    getRow: vi.fn(),
    getPageCount: vi.fn(() => 5),
    getFilteredSelectedRowModel: vi.fn(() => ({
      rows: [{ id: '1' }, { id: '2' }],
    })),
    getSelectedRowModel: vi.fn(() => ({ rows: [] })),
    resetRowSelection: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    getCanPreviousPage: vi.fn(() => true),
    getCanNextPage: vi.fn(() => true),
    ...options,
  };

  return mockTable as any;
};

/**
 * Mock Switch component for testing
 */
export const mockSwitchComponent = () => {
  vi.mock('@app/components/Switch/Switch', async () => ({
    Switch: () => <div data-testid="mock-switch" />,
  }));
};

/**
 * Mock SearchablePoles component for testing
 */
export const mockSearchablePolesComponent = () => {
  vi.mock('@app/components/SearchablePoles', () => ({
    default: () => <div data-testid="searchable-poles" />,
  }));
};

/**
 * Helper to render component with MemoryRouter and params
 */
export const renderWithRouterParams = (
  Component: any,
  params: any,
  renderFn: any,
  useParamsMock: any,
  MemoryRouter: any
) => {
  useParamsMock.mockReturnValue(params);
  return renderFn(React.createElement(MemoryRouter, null, React.createElement(Component)));
};

/**
 * Setup common API and toast mocks for component testing
 */
export const setupAPIAndToastMocks = async () => {
  const { API } = await import('@app/lib/api-config');
  const { toast } = await import('sonner');
  (API as any).get.mockReset();
  (API as any).post.mockReset();
  (API as any).patch.mockReset();
  (toast as any).success.mockReset();
  (toast as any).error.mockReset();
  return { API, toast };
};

/**
 * Helper to extract all URL values from a nested URL configuration object
 */
export const extractAllUrls = (urlObj: any, excludeKeys: string[] = []): string[] => {
  const urls: string[] = [];

  const extract = (obj: any) => {
    for (const key in obj) {
      if (excludeKeys.includes(key)) continue;

      const value = obj[key];
      if (typeof value === 'string') {
        urls.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extract(value);
      }
    }
  };

  extract(urlObj);
  return urls;
};

/**
 * Helper to validate route patterns
 */
export const validateRoutePattern = (routes: string[], pattern: RegExp | string, shouldMatch = true) => {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  for (const route of routes) {
    if (shouldMatch) {
      expect(route).toMatch(regex);
    } else {
      expect(route).not.toMatch(regex);
    }
  }
};

/**
 * Common mock for Popover component
 */
export const mockPopoverComponent = () => {
  vi.mock('@app/components/Popover/Popover', () => ({
    Popover: ({ children, open, onOpenChange }: any) => (
      <button data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)}>
        {children}
      </button>
    ),
    PopoverContent: ({ children, className, align }: any) => (
      <div data-testid="popover-content" className={className} data-align={align}>
        {children}
      </div>
    ),
    PopoverTrigger: ({ children, asChild }: any) => (
      <div data-testid="popover-trigger" data-as-child={asChild}>
        {children}
      </div>
    ),
  }));
};

/**
 * Common mock for Select component
 */
export const mockSelectComponent = () => {
  vi.mock('@app/components/Select/Select', () => ({
    Select: ({ children, value, onValueChange }: any) => (
      <button data-testid="select" data-value={value} onClick={() => onValueChange?.('contains')}>
        {children}
      </button>
    ),
    SelectContent: ({ children, side }: any) => (
      <div data-testid="select-content" data-side={side}>
        {children}
      </div>
    ),
    SelectGroup: ({ children }: any) => <div data-testid="select-group">{children}</div>,
    SelectItem: ({ children, value }: any) => (
      <div data-testid="select-item" data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: ({ children, className }: any) => (
      <div data-testid="select-trigger" className={className}>
        {children}
      </div>
    ),
    SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
  }));
};

/**
 * Common mock for Tooltip component
 */
export const mockTooltipComponent = () => {
  vi.mock('@app/components/Tooltip/Tooltip', () => ({
    Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
    TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
    TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
    TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  }));
};

/**
 * Common mock for DropdownMenu component
 */
export const mockDropdownMenuComponent = () => {
  vi.mock('@app/components/DropdownMenu/DropdownMenu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuContent: ({ children, align }: any) => (
      <div data-testid="dropdown-menu-content" data-align={align}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, onClick, 'aria-label': ariaLabel }: any) => {
      const testId = ariaLabel
        ? 'dropdown-menu-item-' + ariaLabel.toLowerCase().replaceAll(/\s+/g, '-')
        : 'dropdown-menu-item';
      return (
        <button data-testid={testId} onClick={onClick}>
          {children}
        </button>
      );
    },
    DropdownMenuSeparator: () => <hr data-testid="dropdown-menu-separator" />,
    DropdownMenuTrigger: ({ children, asChild }: any) => (
      <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
        {children}
      </div>
    ),
  }));
};

/**
 * Common mock for Separator component
 */
export const mockSeparatorComponent = () => {
  vi.mock('@app/components/Separator/Separator', () => ({
    Separator: () => <hr data-testid="separator" />,
  }));
};

/**
 * Common mock for JSONEditor component
 */
export const mockJSONEditorComponent = () => {
  vi.mock('@app/components/JSONEditor', () => ({
    __esModule: true,
    default: ({ name, initialValue }: any) => (
      <div data-testid="mock-json-editor">
        {name}:{JSON.stringify(initialValue)}
      </div>
    ),
  }));
};

/**
 * Common mock for SearchableDeployments component
 */
export const mockSearchableDeploymentsComponent = () => {
  vi.mock('@app/components/SearchableDeployments/SearchableDeployments', () => ({
    __esModule: true,
    default: ({ value }: any) => <div data-testid="mock-searchable-deployments">{value}</div>,
  }));
};

/**
 * Helper to create mock Redux store state for poles
 */
export const createMockPolesState = (overrides = {}) => ({
  polesList: [],
  mapRef: null,
  isAddingPole: false,
  isMeasuringDistance: false,
  measureDistancePoints: null,
  selectedPole: null,
  poles: [],
  edges: [],
  selectedEdge: null,
  isCreatingEdge: false,
  createEdgePoints: null,
  isEditingPole: false,
  editingPole: null,
  isViewingPole: false,
  viewingPole: null,
  ...overrides,
});

/**
 * Mock useDebounce hook to return value immediately for testing
 */
export const mockUseDebounce = () => {
  vi.mock('@app/hooks/useDebounce', () => ({
    useDebounce: (value: string) => value,
  }));
};

/**
 * Create a fully typed mock Column object for TanStack Table tests
 */
export const createMockColumn = (overrides?: Partial<any>): any => {
  const mockColumn: any = {
    id: 'test',
    depth: 0,
    accessorFn: undefined,
    columnDef: {},
    columns: [],
    getFlatColumns: () => [],
    getLeafColumns: () => [],
    getIsVisible: () => true,
    getCanPin: () => false,
    pin: () => {},
    getFilterIndex: () => -1,
    getCanGlobalFilter: () => false,
    clearSorting: () => {},
    getCanSort: () => false,
    getCanFilter: () => false,
    getCanHide: () => false,
    getCanResize: () => false,
    getCanMultiSort: () => false,
    getPinnedIndex: () => -1,
    getIsPinned: () => false,
    getSortIndex: () => -1,
    getIsSorted: () => false,
    toggleSorting: vi.fn(),
    getToggleSortingHandler: () => (() => {}) as any,
    getFilterValue: () => undefined,
    setFilterValue: vi.fn(),
    getAutoFilterFn: () => undefined,
    getFilterFn: () => undefined,
    getFacetedRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
    getFacetedUniqueValues: () => new Map(),
    getFacetedMinMaxValues: () => [0, 0],
    getIsFiltered: () => false,
    getAutoSortingFn: () => undefined as any,
    getSortingFn: () => undefined as any,
    toggleVisibility: vi.fn(),
    getToggleVisibilityHandler: () => (() => {}) as any,
    getIsGrouped: () => false,
    getGroupedIndex: () => -1,
    getFirstSortDir: () => undefined as any,
    getNextSortingOrder: () => undefined as any,
    getCanGroup: () => false,
    getToggleGroupingHandler: () => (() => {}) as any,
    getAutoSortDir: () => 'asc',
    getAggregationFn: () => undefined,
    getAutoAggregationFn: () => undefined,
    toggleGrouping: () => {},
    getSize: () => 0,
    getStart: () => 0,
    resetSize: () => {},
    getIsLastColumn: () => false,
    getIsFirstColumn: () => false,
    getAfter: () => 0,
    getIndex: () => 0,
    getIsResizing: () => false,
    ...overrides,
  };

  return mockColumn;
};
