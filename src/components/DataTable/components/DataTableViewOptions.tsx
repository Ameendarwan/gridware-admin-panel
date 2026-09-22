'use client';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/components/DropdownMenu/DropdownMenu';

import { Button } from '@app/components/Button/Button';
import { ExtendedColumnDef } from '@app/components/DataTable/DataTable.utils';
import { Table } from '@tanstack/react-table';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

const DataTableViewOptions = <TData,>({ table }: DataTableViewOptionsProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle columns"
          variant="outline"
          size="sm"
          className="ml-auto hidden bg-[#3B3C4F] text-white lg:flex">
          <i className="fa-solid fa-eye flex size-4 items-center" aria-hidden="true" />
          <span>Show/Hide Columns</span>
          <i className="fa-solid fa-angle-down" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[30rem] w-[13rem] overflow-y-scroll">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map(column => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={value => column.toggleVisibility(value)}
                onSelect={event => {
                  event.preventDefault(); // Prevent the menu from closing
                }}>
                <span className="truncate">{(column.columnDef as ExtendedColumnDef<TData>).label}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableViewOptions;
