'use client';

import { Button } from '@app/components/Button/Button';
import { Table } from '@tanstack/react-table';
import { exportTableToCSV } from '@app/components/DataTable/data-table.utils';

interface TasksTableToolbarActionsProps {
  table: Table<any>;
}

const TasksTableToolbarActions = ({ table }: TasksTableToolbarActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="bg-[#3B3C4F] text-white"
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: 'tasks',
            excludeColumns: ['select', 'actions'],
          })
        }>
        <i className="fa-solid fa-right-from-bracket size-4" />
        Export
      </Button>
    </div>
  );
};
export default TasksTableToolbarActions;
