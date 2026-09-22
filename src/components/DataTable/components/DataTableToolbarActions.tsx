'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/components/DropdownMenu/DropdownMenu';
import {
  deleteHandler,
  exportTableToCSV,
  exportTableToExcel,
  printTable,
} from '@app/components/DataTable/DataTable.utils';

import { Button } from '@app/components/Button/Button';
import { Table } from '@tanstack/react-table';
import { titles } from '@app/components/Header/Header';
import { SetURLSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useState } from 'react';
import { API } from '@app/lib/api-config';
import { toast } from 'sonner';

interface TasksTableToolbarActionsProps {
  table: Table<any>;
  url?: string; // Used in deleteHandler when not on pole page
}

const excludeColumns = ['select', 'actions', 'shortcuts'];
const columnMappings = {
  devices: 'serial_no',
  users: 'email',
  customer: 'name',
  pole: 'pole_id',
};

interface PolesWithSelectedOptions extends TasksTableToolbarActionsProps {
  setSearchParams: SetURLSearchParams;
}

// Utility function to handle bulk pole updates
const bulkUpdatePoles = async ({
  poleIds,
  updateData,
  setSearchParams,
  table,
}: {
  poleIds: number[];
  updateData: Record<string, any>;
  setSearchParams: SetURLSearchParams;
  table: Table<any>;
}) => {
  try {
    const response = await API.patch('/pole/bulk', {
      pole_ids: poleIds,
      update_data: updateData,
    });

    // Reset table selection
    table.resetRowSelection();

    // Refresh data by updating search params
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('refresh', Date.now().toString());
      return newParams;
    });

    return response.data;
  } catch (error) {
    console.error('Error updating poles:', error);
    throw error;
  }
};

const PolesWithSelectedOptions = ({ table, setSearchParams }: PolesWithSelectedOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkUpdate = async (updateData: Record<string, any>) => {
    setIsLoading(true);
    try {
      const selectedPoleIds = table.getSelectedRowModel().rows.map(row => row.original.id);
      await bulkUpdatePoles({
        poleIds: selectedPoleIds,
        updateData,
        setSearchParams,
        table,
      });
      if (updateData.disabled === true) {
        toast.success(`${selectedPoleIds.length} pole(s) were marked as non-existent.`);
      } else if (updateData.disabled === false) {
        toast.success(`${selectedPoleIds.length} pole(s) were restored.`);
      } else if (updateData.is_archived === true) {
        toast.success(`${selectedPoleIds.length} pole(s) were disabled/archived.`);
      } else if (updateData.is_archived === false) {
        toast.success(`${selectedPoleIds.length} pole(s) were restored.`);
      } else if (updateData.is_miscellaneous === true) {
        toast.success(`${selectedPoleIds.length} pole(s) set as miscellaneous.`);
      } else if (updateData.is_miscellaneous === false) {
        toast.success(`${selectedPoleIds.length} pole(s) unset as miscellaneous.`);
      }
    } catch (error) {
      toast.error('Error performing bulk update');
      console.error('Error performing bulk update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfirmationDialog
        description="Are you sure you want to mark selected poles as non-existent?"
        triggerComponent={
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Mark pole(s) non-existent</DropdownMenuItem>
        }
        confirmationComponent={
          <Button
            type="button"
            variant="destructive"
            className="rounded bg-redShades-shade1"
            onClick={() => handleBulkUpdate({ disabled: true })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
      <ConfirmationDialog
        description="Are you sure you want to restore selected poles?"
        triggerComponent={
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Unmark pole(s) non-existent</DropdownMenuItem>
        }
        confirmationComponent={
          <Button
            type="button"
            className="rounded bg-greenShades-shade1"
            onClick={() => handleBulkUpdate({ disabled: false })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
      <ConfirmationDialog
        description="Are you sure you want to mark selected poles as disabled/archived?"
        triggerComponent={<DropdownMenuItem onSelect={e => e.preventDefault()}>Mark pole(s) disabled</DropdownMenuItem>}
        confirmationComponent={
          <Button
            type="button"
            className="rounded bg-greenShades-shade1"
            onClick={() => handleBulkUpdate({ is_archived: true })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
      <ConfirmationDialog
        description="Are you sure you want to unarchive/restore selected poles?"
        triggerComponent={
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Unmark pole(s) disabled</DropdownMenuItem>
        }
        confirmationComponent={
          <Button
            type="button"
            className="rounded bg-greenShades-shade1"
            onClick={() => handleBulkUpdate({ is_archived: false })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
      <ConfirmationDialog
        description="Are you sure you want to mark selected poles as miscellaneous?"
        triggerComponent={
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Mark pole(s) miscellaneous</DropdownMenuItem>
        }
        confirmationComponent={
          <Button
            type="button"
            className="rounded bg-greenShades-shade1"
            onClick={() => handleBulkUpdate({ is_miscellaneous: true })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
      <ConfirmationDialog
        description="Are you sure you want to restore miscellaneous poles?"
        triggerComponent={
          <DropdownMenuItem onSelect={e => e.preventDefault()}>Unmark pole(s) miscellaneous</DropdownMenuItem>
        }
        confirmationComponent={
          <Button
            type="button"
            className="rounded bg-greenShades-shade1"
            onClick={() => handleBulkUpdate({ is_miscellaneous: false })}
            disabled={isLoading}>
            Yes, proceed
          </Button>
        }
      />
    </>
  );
};

const TasksTableToolbarActions = ({ table, url }: TasksTableToolbarActionsProps) => {
  const location = useLocation();
  const filename = location.pathname in titles ? titles[location.pathname] : 'export';
  const [_, setSearchParams] = useSearchParams();

  return (
    <>
      {table.getSelectedRowModel().rows.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary text-white" variant="outline" size="sm">
              With Selected ({table.getSelectedRowModel().rows.length}) <i className="fa-solid fa-angle-down" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-15">
            {location.pathname.includes('pole') ? (
              <PolesWithSelectedOptions table={table} setSearchParams={setSearchParams} />
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  table.resetRowSelection();
                  await deleteHandler({
                    selectedRowIds: table.getSelectedRowModel().rows.map(row => row.original.id),
                    url,
                    setSearchParams,
                  });
                }}>
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary text-white" variant="outline" size="sm">
            <i className="fa-solid fa-right-from-bracket flex size-4 items-center" /> Export{' '}
            <i className="fa-solid fa-angle-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-10">
          <DropdownMenuItem
            onClick={() =>
              exportTableToCSV(table, {
                filename,
                excludeColumns,
                columnMappings,
              })
            }>
            <i className="fa-solid fa-file-csv" /> CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              exportTableToExcel(table, {
                filename,
                excludeColumns,
                columnMappings,
              })
            }>
            <i className="fa-solid fa-file-excel" /> Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              printTable(table, {
                excludeColumns,
                title: filename,
                columnMappings,
              })
            }>
            <i className="fa-solid fa-print" /> Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
export default TasksTableToolbarActions;
