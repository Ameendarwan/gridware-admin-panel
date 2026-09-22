import Grid from '@app/components/Grid';
import { Link, NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createColumn,
  ExtendedColumnDef,
  filterFnByIncludes,
  getCommonColumns,
  TextCell,
} from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import SVGIcon from '@app/components/SVGIcon';
import { Badge } from '@app/components/Badge/Badge';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { DeviceTypes, OrientationOptions } from '@app/store/apis/devices/types';
import {
  createIdColumn,
  createCreatedAtColumn,
  createUpdatedAtColumn,
  createCreatedByColumn,
  createUpdatedByColumn,
} from '@app/utils/columnHelpers';

const getColumns = (navigate: NavigateFunction, setSearchParams: SetURLSearchParams): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.devices.list,
      hideColumns: { hideExport: true, hideMap: true, hideMarkComplete: true, hideRetry: true },
      setSearchParams,
    }),
    createIdColumn(),
    createColumn(
      'deployment_name',
      'DEPLOYMENT NAME',
      ({ row }) => <TextCell row={row} accessorKey="deployment_name" />,
      'string'
    ),
    createCreatedAtColumn(),
    createCreatedByColumn(),
    createUpdatedByColumn(),
    createUpdatedAtColumn(),
    createColumn('serial_no', 'SERIAL NO', ({ row }) => <TextCell row={row} accessorKey="serial_no" />, 'string'),
    createColumn('type', 'TYPE', ({ row }) => <TextCell row={row} accessorKey="type" />, 'string', {
      options: Object.values(DeviceTypes).map(option => ({ label: option, value: option })),
      filterFn: filterFnByIncludes,
      excludeQuickFilter: true,
      singleSelect: true,
    }),
    createColumn(
      'pole',
      'POLE',
      ({ row }) => (
        <span className="flex gap-x-2">
          {row.getValue('pole') ? (
            <Link
              to={`/deployments/map/${row.getValue('pole')?.deployment_id}?mode=${MapMode.POLEVIEW}&pole_id=${row.getValue('pole_id')}`}
              key={row.getValue('pole')?.pole_id}>
              <Badge variant="outline" className="min-w-max cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
                <TruncatedTextCell value={row.getValue('pole')?.pole_id} trimSize={20} />
              </Badge>
            </Link>
          ) : (
            ''
          )}
        </span>
      ),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn('pole_id', 'POLE ID', ({ row }) => <TextCell row={row} accessorKey="pole_id" />, 'string'),
    createColumn(
      'solar_orientation',
      'SOLAR ORIENTATION',
      ({ row }) => <TextCell row={row} accessorKey="solar_orientation" />,
      'string',
      {
        options: Object.values(OrientationOptions).map(option => ({ label: option, value: option })),
        filterFn: filterFnByIncludes,
        excludeQuickFilter: true,
        singleSelect: true,
      }
    ),
    createColumn(
      'is_blinked',
      'IS BLINKED',
      ({ row }) => (
        <span>
          {row.getValue('is_blinked') ? (
            <SVGIcon icon={'check-circle'} width={20} height={20} color="fill-success" />
          ) : (
            <SVGIcon icon={'cross-circle'} width={20} height={20} color="fill-destructive" />
          )}
        </span>
      ),
      'boolean'
    ),
    createColumn(
      'disabled',
      'NONEXISTENT',
      ({ row }) => (
        <span>
          {row.getValue('disabled') ? (
            <SVGIcon icon={'check-circle'} width={20} height={20} color="fill-success" />
          ) : (
            <SVGIcon icon={'cross-circle'} width={20} height={20} color="fill-destructive" />
          )}
        </span>
      ),
      'boolean'
    ),
  ];
};

const Devices = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return (
    <Grid
      url="/device/all"
      buttonText="New Device"
      onButtonClick={() => navigate(urls.devices.create)}
      getColumns={() => getColumns(navigate, setSearchParams)}
    />
  );
};

export default Devices;
