import * as React from 'react';
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@app/components/Table/Table';
import { cn } from '@app/lib/utils';
import { getCommonPinningStyles } from '@app/components/DataTable/DataTable.utils';
import DataTablePagination from '@app/components/DataTable/components/DataTablePagination';
import Loader from '@app/components/Loader/Loader';

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  floatingBar?: React.ReactNode | null;
  totalRows?: number;
  loading?: boolean;
}

const DataTable = <TData,>({
  table,
  floatingBar = null,
  children,
  className,
  totalRows,
  loading,
  ...props
}: DataTableProps<TData>) => (
  <div className={cn('w-full space-y-2.5 overflow-auto bg-white', className)} {...props}>
    {children}
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader className="bg-[#F9F9FB]">
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
          {(() => {
            if (loading) {
              return (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-56 text-center">
                    <div className="flex h-56 items-center justify-start">
                      <Loader />
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            if (table.getRowModel().rows?.length) {
              return table.getRowModel().rows.map(row => (
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
              ));
            }

            return (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            );
          })()}
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
