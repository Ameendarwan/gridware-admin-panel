'use client';

import {
  createColumn,
  ExtendedColumnDef,
  filterFnByIncludes,
  formatDate,
  getCommonColumns,
  TextCell,
} from '@app/components/DataTable/DataTable.utils';

export function getColumns(): ExtendedColumnDef<any>[] {
  return [
    ...getCommonColumns(),
    createColumn('name', 'Name', ({ row }) => <TextCell row={row} accessorKey="name" />),
    createColumn(
      'films',
      'Film',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="films"
          transform={value => (Array.isArray(value) && value.length > 0 ? value[0] : 'N/A')}
        />
      ),
      {
        filterFn: filterFnByIncludes,
      }
    ),
    createColumn(
      'videoGames',
      'Video Games',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="videoGames"
          transform={value => (Array.isArray(value) && value.length > 0 ? value[0] : 'N/A')}
        />
      ),
      {
        filterFn: filterFnByIncludes,
      }
    ),
    createColumn('createdAt', 'Created At', ({ row }) => (
      <TextCell row={row} accessorKey="createdAt" transform={value => formatDate(value)} />
    )),
  ];
}
