import {
  ExtendedColumnDef,
  TextCell,
  createColumn,
  formatDate,
  formatDateUtc,
  getCommonColumns,
} from '@app/components/DataTable/DataTable.utils';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import Grid from '@app/components/Grid';
import { urls } from '@app/routes/urls';

export const getColumns = (navigate: NavigateFunction): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.bug.list,
      hideColumns: {
        hideExport: true,
        hideMap: true,
        hideMarkComplete: true,
        hideEdit: true,
        hideDelete: true,
        hideMultiSelect: true,
        hideRetry: true
      },
    }),

    createColumn('title', 'Title', ({ row }) => <TextCell row={row} accessorKey="title" />, 'string'),
    createColumn('description', 'Description', ({ row }) => <TextCell row={row} accessorKey="description" />, 'string'),
    createColumn(
      'device_model',
      'Device Model',
      ({ row }) => <TextCell row={row} accessorKey="device_model" />,
      'string'
    ),
    createColumn('device_mac', 'Device Mac', ({ row }) => <TextCell row={row} accessorKey="device_mac" />, 'string'),
    createColumn(
      'mobile_db',
      'Mobile DB',
      ({ row }) => (
        <span>
          {row.getValue('mobile_db') ? (
            <a href={row.getValue('mobile_db')?.url} target="_blank" rel="noreferrer" className={'text-accent'}>
              <i className="fa-solid fa-file-csv" />
              {row.getValue('mobile_db')?.filename}
            </a>
          ) : (
            ''
          )}
        </span>
      ),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn('id', 'ID', ({ row }) => <TextCell row={row} accessorKey="id" />, 'number'),
    createColumn(
      'created_at',
      'CREATED AT',
      ({ row }) => <TextCell row={row} accessorKey="created_at" transform={value => formatDate(value)} tooltipTransform={v => formatDateUtc(v)}/>,
      'date'
    ),
    createColumn(
      'updated_at',
      'UPDATED AT',
      ({ row }) => <TextCell row={row} accessorKey="updated_at" transform={value => formatDate(value)} tooltipTransform={v => formatDateUtc(v)}/>,
      'date'
    ),
    createColumn('created_by', 'CREATED BY', ({ row }) => <TextCell row={row} accessorKey="created_by" />, 'string'),
  ];
};

const Bug = () => {
  const navigate = useNavigate();
  return <Grid url="/bug/all" getColumns={() => getColumns(navigate)} />;
};

export default Bug;
