'use client';

import { Button } from '@app/components/Button/Button';
import { Table } from '@tanstack/react-table';
import { exportTableToCSV } from '@app/components/DataTable/DataTable.utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/components/DropdownMenu/DropdownMenu';

interface TasksTableToolbarActionsProps {
  table: Table<any>;
}

const TasksTableToolbarActions = ({ table }: TasksTableToolbarActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#3B3C4F] text-white" variant="outline" size="sm">
          <i className="fa-solid fa-right-from-bracket size-4" />
          Export
          <i className="fa-solid fa-angle-down" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-10">
        <DropdownMenuItem
          onClick={() =>
            exportTableToCSV(table, {
              filename: 'tasks',
              excludeColumns: ['select', 'actions'],
            })
          }>
          <i className="fa-solid fa-file-csv" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            exportTableToCSV(table, {
              filename: 'tasks',
              excludeColumns: ['select', 'actions'],
            })
          }>
          <i className="fa-solid fa-file-excel" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            exportTableToCSV(table, {
              filename: 'tasks',
              excludeColumns: ['select', 'actions'],
            })
          }>
          <i className="fa-solid fa-print" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default TasksTableToolbarActions;
