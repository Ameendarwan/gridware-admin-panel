import * as React from 'react';
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@app/components/Table/Table';
import { cn } from '@app/lib/utils';
import { getCommonPinningStyles } from '@app/components/DataTable/data-table.utils';
import DataTablePagination from '@app/components/DataTable/data-table-pagination';

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  floatingBar?: React.ReactNode | null;
  totalRows?: number;
}

const DataTable = <TData,>({
  table,
  floatingBar = null,
  children,
  className,
  totalRows,
  ...props
}: DataTableProps<TData>) => (
  <div className={cn('w-full space-y-2.5 overflow-auto bg-white', className)} {...props}>
    {children}
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    ...getCommonPinningStyles({ column: header.column }),
                  }}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles({ column: cell.column }),
                    }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex flex-col gap-2.5">
      <DataTablePagination totalRows={totalRows} table={table} />
      {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
    </div>
  </div>
);

export default DataTable;
