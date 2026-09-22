import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Grid from './Grid';

// Mock all dependencies
vi.mock('@app/components/DataTable/DataTable.utils', () => ({
  fetchTableData: vi.fn(),
  getFilters: vi.fn(),
}));

vi.mock('@app/components/Button/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@app/components/DataTable/DataTable', () => ({
  default: ({ children, totalRows, loading, ...props }: any) => (
    <div data-testid="data-table" data-loading={loading} data-total-rows={totalRows} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@app/components/DataTable/components/DataTableAdvancedToolbar', () => ({
  default: ({ children, url }: any) => (
    <div data-testid="data-table-toolbar" data-url={url}>
      {children}
    </div>
  ),
}));

vi.mock('@app/hooks/useDataTable', () => ({
  useDataTable: vi.fn(),
}));

vi.mock('@app/hooks/useSearchParamsChange', () => ({
  default: vi.fn(),
}));

import { fetchTableData, getFilters } from '@app/components/DataTable/DataTable.utils';
import { useDataTable } from '@app/hooks/useDataTable';
import useSearchParamsChange from '@app/hooks/useSearchParamsChange';

// Mock implementations
const mockFetchTableData = vi.mocked(fetchTableData);
const mockGetFilters = vi.mocked(getFilters);
const mockUseDataTable = vi.mocked(useDataTable);
const mockUseSearchParamsChange = vi.mocked(useSearchParamsChange);

// Mock table object
const mockTable = {
  setPageIndex: vi.fn(),
} as any;

// Mock columns function
const mockGetColumns = vi.fn(() => [
  { id: 'id', accessorKey: 'id', header: 'ID' },
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'created_at', accessorKey: 'created_at', header: 'Created At' },
]);

// Helper function to render Grid with router
const renderGrid = (props = {}) => {
  const defaultProps = {
    url: '/api/test',
    getColumns: mockGetColumns,
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={['/?page=1&per_page=10']}>
      <Grid {...defaultProps} />
    </MemoryRouter>
  );
};

describe('Grid', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUseDataTable.mockReturnValue({
      table: mockTable,
    });

    mockUseSearchParamsChange.mockReturnValue(1);

    mockGetFilters.mockReturnValue([] as any);

    mockFetchTableData.mockResolvedValue({
      data: {
        records: [
          { id: 1, name: 'Test Item 1', created_at: '2024-01-01' },
          { id: 2, name: 'Test Item 2', created_at: '2024-01-02' },
        ],
        count: 25,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render DataTable with correct props', async () => {
      renderGrid();

      const dataTable = screen.getByTestId('data-table');
      expect(dataTable).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(dataTable).toHaveAttribute('data-total-rows', '2');
        expect(dataTable).toHaveAttribute('data-loading', 'false');
      });
    });

    it('should render DataTableAdvancedToolbar with correct URL', () => {
      const testUrl = '/api/custom-endpoint';
      renderGrid({ url: testUrl });

      const toolbar = screen.getByTestId('data-table-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('data-url', testUrl);
    });

    it('should render button when buttonText is provided', () => {
      const buttonText = 'Add New Item';
      const buttonTestId = 'add-button';
      const onButtonClick = vi.fn();

      renderGrid({
        buttonText,
        buttonTestId,
        onButtonClick,
      });

      const button = screen.getByTestId(buttonTestId);
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(buttonText);
    });

    it('should not render button when buttonText is not provided', () => {
      renderGrid();

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Data Fetching', () => {
    it('should fetch data on mount with correct parameters', async () => {
      renderGrid();

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledWith({
          url: '/api/test',
          limit: 10,
          skip: 0,
          where: null,
          order_by: 'created_at desc',
          filters: [],
        });
      });
    });

    it('should handle custom sort parameter', async () => {
      render(
        <MemoryRouter initialEntries={['/?page=1&per_page=10&sort=name.asc']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledWith(
          expect.objectContaining({
            order_by: 'name asc',
          })
        );
      });
    });

    it('should handle where parameter', async () => {
      render(
        <MemoryRouter initialEntries={['/?page=1&per_page=10&where=test-condition']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledWith(
          expect.objectContaining({
            where: 'test-condition',
          })
        );
      });
    });

    it('should handle filters from search params', async () => {
      const mockFilters = [{ name: { eq: 'test' } } as any, { status: { eq: 'active' } } as any];
      mockGetFilters.mockReturnValue(mockFilters as any);

      renderGrid();

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: mockFilters,
          })
        );
      });
    });

    it('should calculate pagination skip correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/?page=3&per_page=20']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 40, // (page 3 - 1) * 20 per page
            limit: 20,
          })
        );
      });
    });

    it('should update data and pageCount after successful fetch', async () => {
      const mockData = {
        data: {
          records: [{ id: 1, name: 'Test' }],
          count: 50,
        },
      };
      mockFetchTableData.mockResolvedValue(mockData);

      renderGrid();

      await waitFor(() => {
        const dataTable = screen.getByTestId('data-table');
        expect(dataTable).toHaveAttribute('data-total-rows', '1');
      });
    });
  });

  describe('Search Params Changes', () => {
    it('should refetch data when search params change', async () => {
      mockUseSearchParamsChange.mockReturnValueOnce(1).mockReturnValueOnce(2);

      const { rerender } = renderGrid();

      // Initial call
      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledTimes(1);
      });

      // Simulate search params change
      rerender(
        <MemoryRouter initialEntries={['/?page=2&per_page=10']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledTimes(2);
      });
    });

    it('should not trigger fetch when searchParamsChange is 0', () => {
      mockUseSearchParamsChange.mockReturnValue(0);

      renderGrid();

      expect(mockFetchTableData).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should hide loading state after fetch completes', async () => {
      renderGrid();

      await waitFor(() => {
        const dataTable = screen.getByTestId('data-table');
        expect(dataTable).toHaveAttribute('data-loading', 'false');
      });
    });
  });

  describe('Button Interaction', () => {
    it('should call onButtonClick when button is clicked', () => {
      const onButtonClick = vi.fn();

      renderGrid({
        buttonText: 'Add Item',
        buttonTestId: 'add-button',
        onButtonClick,
      });

      const button = screen.getByTestId('add-button');
      fireEvent.click(button);

      expect(onButtonClick).toHaveBeenCalledTimes(1);
    });

    it('should render button with correct styling classes', () => {
      renderGrid({
        buttonText: 'Add Item',
        buttonTestId: 'add-button',
        onButtonClick: vi.fn(),
      });

      const button = screen.getByTestId('add-button');
      expect(button).toHaveClass('bg-accent', 'text-white');
    });
  });

  describe('useDataTable Integration', () => {
    it('should pass correct props to useDataTable', () => {
      renderGrid();

      expect(mockUseDataTable).toHaveBeenCalledWith({
        data: [],
        columns: expect.any(Array),
        pageCount: 1,
        enableAdvancedFilter: true,
        state: {
          pagination: { pageIndex: 0, pageSize: 10 },
        },
      });
    });

    it('should handle custom page and pageSize from URL', () => {
      render(
        <MemoryRouter initialEntries={['/?page=3&per_page=25']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      expect(mockUseDataTable).toHaveBeenCalledWith(
        expect.objectContaining({
          state: {
            pagination: { pageIndex: 2, pageSize: 25 }, // pageIndex is 0-based
          },
        })
      );
    });
  });

  describe('Request Handling', () => {
    let resolveFirst: any;

    const createDelayedPromise = () =>
      new Promise<any>(resolve => {
        resolveFirst = resolve;
      });

    it('should prevent duplicate requests when one is in progress', async () => {
      // Make the first request take time
      mockFetchTableData.mockImplementationOnce(createDelayedPromise);

      mockUseSearchParamsChange.mockReturnValueOnce(1).mockReturnValueOnce(2);

      const { rerender } = renderGrid();

      // Trigger another request while first is pending
      rerender(
        <MemoryRouter initialEntries={['/?page=2&per_page=10']}>
          <Grid url="/api/test" getColumns={mockGetColumns} />
        </MemoryRouter>
      );

      // Should only have one call
      expect(mockFetchTableData).toHaveBeenCalledTimes(1);

      // Resolve the first request
      resolveFirst({ data: { records: [], count: 0 } });

      await waitFor(() => {
        expect(mockFetchTableData).toHaveBeenCalledTimes(1);
      });
    });
  });
});
