import { useMemo } from 'react';
import { DataTableFilterField } from '@app/components/DataTable/data-table.types';
import DataTable from '@app/components/DataTable/data-table';
import DataTableAdvancedToolbar from '@app/components/DataTable/advanced/data-table-advanced-toolbar';
import { useDataTable } from '@app/hooks/useDataTable';
import { getColumns } from '@app/pages/Tasks/TasksTableColumns';
import { Button } from '@app/components/Button/Button';

const TasksTable = () => {
  // Hardcoded data for the table
  const data = [
    {
      id: 1,
      title: 'Complete project report',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2024-10-20',
    },
    {
      id: 2,
      title: 'Fix login bug',
      status: 'Todo',
      priority: 'Medium',
      createdAt: '2024-11-01',
    },
    {
      id: 3,
      title: 'Plan team meeting',
      status: 'Done',
      priority: 'Low',
      createdAt: '2024-09-15',
    },
    {
      id: 4,
      title: 'Update documentation',
      status: 'In Progress',
      priority: 'Low',
      createdAt: '2024-10-25',
    },
    {
      id: 5,
      title: 'Refactor codebase',
      status: 'Todo',
      priority: 'High',
      createdAt: '2024-11-10',
    },
  ];

  const pageCount = 1;
  const totalRows = data.length;

  const columns = useMemo(() => getColumns(), []);
  const filterFields: DataTableFilterField<any>[] = [
    {
      label: 'Title',
      value: 'title',
      placeholder: 'Search',
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    state: {
      sorting: [{ id: 'createdAt', desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
      columnPinning: { right: ['actions'] },
    },
  });

  return (
    <DataTable totalRows={totalRows} table={table}>
      <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
        <Button size="sm" variant="outline" className="bg-[#5283ED] text-white">
          New Deployment
        </Button>
      </DataTableAdvancedToolbar>
    </DataTable>
  );
};

export default TasksTable;
