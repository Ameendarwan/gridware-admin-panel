import { createColumn, ExtendedColumnDef, getCommonColumns, TextCell } from '@app/components/DataTable/DataTable.utils';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

import Grid from '@app/components/Grid';
import SVGIcon from '@app/components/SVGIcon';
import { urls } from '@app/routes/urls';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import { createIdColumn, createCreatedAtColumn, createUpdatedAtColumn } from '@app/utils/columnHelpers';

export const getColumns = (
  navigate: NavigateFunction,
  setSearchParams: SetURLSearchParams
): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.batchTracking.list,
      hideColumns: { hideDelete: true, hideExport: true, hideMap: true, hideEdit: true, hideMultiSelect: true },
      setSearchParams,
    }),
    createIdColumn(),
    createCreatedAtColumn(),
    createUpdatedAtColumn(),
    createColumn('data_type', 'DATA TYPE', ({ row }) => <TextCell row={row} accessorKey="data_type" />, 'string'),
    createColumn('total', 'Total', ({ row }) => <TextCell row={row} accessorKey="total" />, 'number'),
    createColumn('created_by', 'REQUESTED BY', ({ row }) => <TextCell row={row} accessorKey="created_by" />, 'string'),
    createColumn(
      'is_completed',
      'IS COMPLETED',
      ({ row }) => (
        <span>
          {row.getValue('is_completed') ? (
            <SVGIcon icon={'check-circle'} width={20} height={20} color="fill-success" />
          ) : (
            <SVGIcon icon={'cross-circle'} width={20} height={20} color="fill-destructive" />
          )}
        </span>
      ),
      'boolean'
    ),
    createColumn(
      'errors',
      'ERRORS',
      ({ row }) => <TruncatedTextCell value={JSON.stringify(row.getValue('errors'), null, 1)} trimSize={30} />,
      'boolean',
      { enableSorting: false }
    ),
  ];
};

const BatchTracking = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return <Grid url="/status/all" getColumns={() => getColumns(navigate, setSearchParams)} />;
};

export default BatchTracking;
