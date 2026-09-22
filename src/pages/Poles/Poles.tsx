import {
  ExtendedColumnDef,
  TextCell,
  createColumn,
  getCommonColumns,
  filterFnByIncludes,
  formatDate,
  formatDateUtc,
} from '@app/components/DataTable/DataTable.utils';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

import Grid from '@app/components/Grid';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import { urls } from '@app/routes/urls';
import { poleStatusesListView } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import { createIdColumn, createCreatedAtColumn, createUpdatedAtColumn } from '@app/utils/columnHelpers';
import { renderDeviceBadges, renderBooleanIcon, renderArrayValues } from '@app/utils/columnRenderers';
import type { Device } from '@app/store/apis/devices/types';

export const getColumns = (
  navigate: NavigateFunction,
  setSearchParams: SetURLSearchParams
): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.poles.list,
      navigateToMap: true,
      hideColumns: { hideExport: true, hideMap: true, hideMarkComplete: true, hideRetry: true },
      setSearchParams,
    }),
    createIdColumn(),
    createColumn('pole_id', 'POLE ID', ({ row }) => <TextCell row={row} accessorKey="pole_id" />, 'string'),
    createCreatedAtColumn(),
    createUpdatedAtColumn(),
    createColumn(
      'customer_id',
      'CUSTOMER ID',
      ({ row }) => <TextCell row={row} accessorKey="customer_id" />,
      'string'
    ),
    createColumn(
      'customer_name',
      'CUSTOMER NAME',
      ({ row }) => <TextCell row={row} accessorKey="customer_name" />,
      'string'
    ),
    createColumn('status', 'STATUS', ({ row }) => <TextCell row={row} accessorKey="status" />, 'string', {
      options: poleStatusesListView,
      filterFn: filterFnByIncludes,
      excludeQuickFilter: true,
      singleSelect: true,
    }),
    createColumn('lat', 'LATITUDE', ({ row }) => <TextCell row={row} accessorKey="lat" />, 'string', {
      excludeFilter: true,
    }),
    createColumn('long', 'LONGITUDE', ({ row }) => <TextCell row={row} accessorKey="long" />, 'string', {
      excludeFilter: true,
    }),
    createColumn(
      'installed_at',
      'INSTALLED AT',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="installed_at"
          transform={value => formatDate(value)}
          tooltipTransform={v => formatDateUtc(v)}
        />
      ),
      'date'
    ),
    createColumn(
      'installed_by',
      'INSTALLED BY',
      ({ row }) => <TextCell row={row} accessorKey="installed_by" />,
      'string'
    ),
    createColumn(
      'devices',
      'DEVICES',
      ({ row }) => renderDeviceBadges<Device>(row.getValue('devices'), device => device.serial_no),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'orientation',
      'ORIENTATION',
      ({ row }) => renderDeviceBadges<Device>(row.getValue('devices'), device => device.solar_orientation),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'did_connect',
      'DID CONNECT',
      ({ row }) => renderDeviceBadges<Device>(row.getValue('devices'), device => (device.is_blinked ? 'Yes' : 'No')),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),

    createColumn(
      'deployment_id',
      'DEPLOYMENT ID',
      ({ row }) => <TextCell row={row} accessorKey="deployment_id" />,
      'string'
    ),
    createColumn(
      'deployment_name',
      'DEPLOYMENT NAME',
      ({ row }) => <TextCell row={row} accessorKey="deployment_name" />,
      'string'
    ),
    createColumn(
      'installation_notes',
      'DEVICE NOTES',
      ({ row }) => <TruncatedTextCell value={row.getValue('installation_notes')} trimSize={25} />,
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'is_eppe_complete_v2',
      'EPPE COMPLETE',
      ({ row }) => renderBooleanIcon(row.getValue('is_eppe_complete_v2')),
      'boolean',
      { enableSorting: false }
    ),
    createColumn(
      'has_span_connected',
      'HAS ACTIVE SPAN CONNECTED',
      ({ row }) => renderBooleanIcon(row.getValue('has_span_connected')),
      'boolean',
      { enableSorting: false }
    ),

    createColumn(
      'enabled_spans_count',
      'NO OF ACTIVE SPANS',
      ({ row }) => <TextCell row={row} accessorKey="enabled_spans_count" />,
      'number'
    ),
    createColumn(
      'passed_equipment_check',
      'PASSED EQUIPMENT CHECK',
      ({ row }) => <TextCell row={row} accessorKey="passed_equipment_check" />,
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'vegetation_notes',
      'POLE NOTES',
      ({ row }) => <TextCell row={row} accessorKey="vegetation_notes" />,
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn('equipments', 'EQUIPMENTS', ({ row }) => renderArrayValues(row.getValue('equipments')), 'array', {
      enableSorting: false,
    }),

    createColumn('disabled', 'IS NON-EXISTENT', ({ row }) => renderBooleanIcon(row.getValue('disabled')), 'boolean', {
      enableSorting: false,
    }),
    createColumn(
      'is_miscellaneous',
      'IS MISCELLANEOUS',
      ({ row }) => renderBooleanIcon(row.getValue('is_miscellaneous')),
      'boolean',
      { enableSorting: false }
    ),
    createColumn('is_archived', 'IS DISABLED', ({ row }) => renderBooleanIcon(row.getValue('is_archived')), 'boolean', {
      enableSorting: false,
    }),
    createColumn('created_by', 'CREATED BY', ({ row }) => <TextCell row={row} accessorKey="created_by" />, 'string'),
    createColumn(
      'pole_updated_by',
      'POLE ID UPDATED BY',
      ({ row }) => <TextCell row={row} accessorKey="pole_updated_by" />,
      'string',
      { excludeFilter: true }
    ),
    createColumn('updated_by', 'UPDATED BY', ({ row }) => <TextCell row={row} accessorKey="updated_by" />, 'string'),
    createColumn('gridware_id', 'GRIDWARE ID', ({ row }) => <TextCell row={row} accessorKey="gridware_id" />, 'string'),
    createColumn(
      'status_type',
      'INACCESSIBLE REASON',
      ({ row }) => <TextCell row={row} accessorKey="status_type" />,
      'string'
    ),
    createColumn(
      'status_reason',
      'INACCESSIBLE COMMENT',
      ({ row }) => <TextCell row={row} accessorKey="status_reason" />,
      'string'
    ),
    createColumn(
      'last_date_accessed_attempted',
      'LAST DATE ACCESSED ATTEMPTED',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="last_date_accessed_attempted"
          transform={value => formatDate(value)}
          tooltipTransform={v => formatDateUtc(v)}
        />
      ),
      'date'
    ),
    createColumn(
      'status_changed_at',
      'STATUS CHANGED AT',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="status_changed_at"
          transform={value => formatDate(value)}
          tooltipTransform={v => formatDateUtc(v)}
        />
      ),
      'date'
    ),
    createColumn(
      'status_changed_by',
      'STATUS CHANGED BY',
      ({ row }) => <TextCell row={row} accessorKey="status_changed_by" />,
      'string'
    ),
  ];
};

const Poles = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return <Grid url="/pole/all" getColumns={() => getColumns(navigate, setSearchParams)} />;
};

export default Poles;
