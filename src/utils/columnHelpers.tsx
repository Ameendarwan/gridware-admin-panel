import { Link } from 'react-router-dom';
import { Badge } from '@app/components/Badge/Badge';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import {
  createColumn,
  ExtendedColumnDef,
  formatDate,
  formatDateUtc,
  TextCell,
} from '@app/components/DataTable/DataTable.utils';

/**
 * Creates a standard ID column
 */
export const createIdColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn('id', 'ID', ({ row }) => <TextCell row={row} accessorKey="id" />, 'number');

/**
 * Creates a standard created_at column with date formatting
 */
export const createCreatedAtColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn(
    'created_at',
    'CREATED AT',
    ({ row }) => (
      <TextCell
        row={row}
        accessorKey="created_at"
        transform={value => formatDate(value)}
        tooltipTransform={v => formatDateUtc(v)}
      />
    ),
    'date'
  );

/**
 * Creates a standard updated_at column with date formatting
 */
export const createUpdatedAtColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn(
    'updated_at',
    'UPDATED AT',
    ({ row }) => (
      <TextCell
        row={row}
        accessorKey="updated_at"
        transform={value => formatDate(value)}
        tooltipTransform={v => formatDateUtc(v)}
      />
    ),
    'date'
  );

/**
 * Creates a standard created_by column
 */
export const createCreatedByColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn('created_by', 'CREATED BY', ({ row }) => <TextCell row={row} accessorKey="created_by" />, 'string');

/**
 * Creates a standard updated_by column
 */
export const createUpdatedByColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn('updated_by', 'UPDATED BY', ({ row }) => <TextCell row={row} accessorKey="updated_by" />, 'string');

/**
 * Creates a standard deployment column with badge and link
 */
export const createDeploymentColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn(
    'deployment',
    'DEPLOYMENT',
    ({ row }) => (
      <span className="flex gap-x-2">
        {row.getValue('deployment') ? (
          <Link
            to={`/deployments/${row.getValue('deployment_id')}/view`}
            key={row.getValue('deployment_id')}
            target={'_blank'}>
            <Badge variant="outline" className="min-w-max cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
              <TruncatedTextCell value={row.getValue('deployment')?.name} trimSize={20} />
            </Badge>
          </Link>
        ) : (
          ''
        )}
      </span>
    ),
    'string',
    { excludeFilter: true, enableSorting: false }
  );

/**
 * Creates a standard deployment_id column
 */
export const createDeploymentIdColumn = <TData,>(): ExtendedColumnDef<TData> =>
  createColumn(
    'deployment_id',
    'DEPLOYMENT ID',
    ({ row }) => <TextCell row={row} accessorKey="deployment_id" />,
    'number'
  );

/**
 * Creates a set of standard audit columns (ID, created_at, updated_at, created_by, updated_by)
 */
export const createAuditColumns = <TData,>(): ExtendedColumnDef<TData>[] => [
  createIdColumn<TData>(),
  createCreatedAtColumn<TData>(),
  createUpdatedAtColumn<TData>(),
  createCreatedByColumn<TData>(),
  createUpdatedByColumn<TData>(),
];

/**
 * Creates a set of standard deployment-related columns (deployment, deployment_id)
 */
export const createDeploymentColumns = <TData,>(): ExtendedColumnDef<TData>[] => [
  createDeploymentColumn<TData>(),
  createDeploymentIdColumn<TData>(),
];

/**
 * Creates a pole link column with badge that links to map view
 * @param accessorKey - The key for the pole ID (e.g., 'from_pole_id', 'to_pole_id')
 * @param label - The column label (e.g., 'FROM POLE ID', 'TO POLE ID')
 */
export const createPoleLinkColumn = <TData,>(
  accessorKey: string,
  label: string,
  poleObjectKey: string,
  MapMode: any
): ExtendedColumnDef<TData> =>
  createColumn(
    poleObjectKey,
    label,
    ({ row }) => (
      <span className="flex gap-x-2">
        <Link
          to={`/deployments/map/${row.getValue('deployment_id')}?mode=${MapMode.POLEVIEW}&pole_id=${row.getValue(accessorKey)}`}
          target={'_blank'}>
          <Badge variant="outline" className="cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
            {row.getValue(poleObjectKey)?.pole_id}
          </Badge>
        </Link>
      </span>
    ),
    'string',
    { enableSorting: false }
  );
