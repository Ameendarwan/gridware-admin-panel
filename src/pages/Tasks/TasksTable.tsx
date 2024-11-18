import { useEffect, useMemo, useState } from 'react';
import DataTable from '@app/components/DataTable/DataTable';
import DataTableAdvancedToolbar from '@app/components/DataTable/components/DataTableAdvancedToolbar';
import { useDataTable } from '@app/hooks/useDataTable';
import { getColumns } from '@app/pages/Tasks/TasksTableColumns';
import { Button } from '@app/components/Button/Button';
import { useLocation } from 'react-router-dom';
import { getFilters } from '@app/components/DataTable/DataTable.utils';

const fetchData = async ({
  limit,
  page,
  search,
}: {
  limit: number;
  offset: number;
  page: number;
  search: string | null;
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: limit.toString(),
  });
  if (search) {
    params.append('name', search);
  }
  const url = `https://api.disneyapi.dev/character?${params.toString()}`;
  const options = {
    method: 'GET',
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const TasksTable = () => {
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const totalRows = data.length;
  const columns = useMemo(() => getColumns(), []);
  const location = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('per_page') || '10', 10);
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;
    const sort = searchParams.get('sort');
    const [column, order] = sort?.split('.').filter(Boolean) ?? ['createdAt', 'desc'];
    console.log(`column: ${column}, order: ${order}`);
    const filters = getFilters(columns, searchParams);
    console.log('filters: ', filters);

    fetchData({ limit, offset, page, search }).then(resp => {
      setData(Array.isArray(resp.data) ? resp.data : [resp.data]);
      setPageCount(resp.info.totalPages);
    });
  }, [searchParams]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
    state: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable totalRows={totalRows} table={table}>
      <DataTableAdvancedToolbar table={table}>
        <Button size="sm" variant="outline" className="bg-[#5283ED] text-white">
          New Deployment
        </Button>
      </DataTableAdvancedToolbar>
    </DataTable>
  );
};

export default TasksTable;
