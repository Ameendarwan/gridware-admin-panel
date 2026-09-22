import { fetchTableData, getFilters } from '@app/components/DataTable/DataTable.utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@app/components/Button/Button';
import DataTable from '@app/components/DataTable/DataTable';
import DataTableAdvancedToolbar from '@app/components/DataTable/components/DataTableAdvancedToolbar';
import { useDataTable } from '@app/hooks/useDataTable';
import { useLocation, useNavigate } from 'react-router-dom';
import useSearchParamsChange from '@app/hooks/useSearchParamsChange';
import { DeferredFilterProvider } from '@app/components/DataTable/contexts/DeferredFilterContext';

interface DataTablePageProps {
  url: string;
  buttonText?: string;
  buttonTestId?: string;
  onButtonClick?: () => void;
  getColumns: () => any[];
  deferFilters?: boolean; // New prop to enable deferred filter application
}

const Grid = ({
  url,
  buttonText,
  buttonTestId,
  onButtonClick,
  getColumns,
  deferFilters = true,
}: DataTablePageProps) => {
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalRows = data.length;
  const columns = useMemo(() => getColumns(), []);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pageNo = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('per_page') || '10', 10);
  const searchParamsChange = useSearchParamsChange();

  // Store previous values and request tracking
  const prevWhereRef = useRef(searchParams.get('where'));
  const prevFiltersRef = useRef(getFilters(columns, searchParams));
  const requestInProgress = useRef(false);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
    state: {
      pagination: { pageIndex: pageNo - 1, pageSize },
    },
  });

  const fetchData = async (params: {
    url: string;
    skip: number;
    limit: number;
    where: string | null;
    order_by: string;
    filters: any;
  }) => {
    if (requestInProgress.current) return;

    try {
      requestInProgress.current = true;
      setLoading(true);
      const resp = await fetchTableData(params);
      setData(resp.data.records);
      setPageCount(Math.ceil(resp.data.count / params.limit));
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  useEffect(() => {
    if (searchParamsChange > 0) {
      const where = searchParams.get('where');
      const filters = getFilters(columns, searchParams);
      const sort = searchParams.get('sort');
      const [column, order] = sort?.split('.').filter(Boolean) ?? ['created_at', 'desc'];
      const order_by = `${column} ${order}`;

      // Check if where or filters have changed@
      const whereChanged = where !== prevWhereRef.current;
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);

      // Update refs with current values
      prevWhereRef.current = where;
      prevFiltersRef.current = filters;

      // Calculate skip based on whether we need to reset to first page
      const skip = whereChanged || filtersChanged ? 0 : (pageNo - 1) * pageSize;
      const limit = pageSize;

      // If where or filters changed, reset the page index
      if (whereChanged || filtersChanged) {
        table.setPageIndex(0);
      }

      fetchData({ url, limit, skip, where, order_by, filters });
    }
  }, [searchParamsChange]);

  const handleApplyFilters = (params: URLSearchParams) => {
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleCancelFilters = () => {
    // Reload current search params to reset any local state
    globalThis.location.reload();
  };

  return (
    <DeferredFilterProvider enabled={deferFilters} onApply={handleApplyFilters} onCancel={handleCancelFilters}>
      <DataTable totalRows={totalRows} table={table} className="px-4" loading={loading}>
        <DataTableAdvancedToolbar table={table} url={url}>
          {buttonText && (
            <Button
              data-testid={buttonTestId}
              size="sm"
              variant="outline"
              className="bg-accent text-white"
              onClick={onButtonClick}>
              <i className="fa-solid fa-plus" />
              {buttonText}
            </Button>
          )}
        </DataTableAdvancedToolbar>
      </DataTable>
    </DeferredFilterProvider>
  );
};

export default Grid;
