import Grid from '@app/components/Grid';
import { Link, NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createColumn, ExtendedColumnDef, getCommonColumns, TextCell } from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import { Badge } from '@app/components/Badge/Badge';
import { createAuditColumns } from '@app/utils/columnHelpers';

const getColumns = (navigate: NavigateFunction, setSearchParams: SetURLSearchParams): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.spans.list,
      hideColumns: {
        hideExport: true,
        hideMap: true,
        hideMarkComplete: true,
        hideEdit: true,
        hideView: true,
        hideRetry: true,
      },
      setSearchParams,
    }),
    ...createAuditColumns(),
    createColumn('type', 'SPAN CONFIGURATION', ({ row }) => <TextCell row={row} accessorKey="type" />, 'string'),
    createColumn('phase', 'PHASE NUMBER', ({ row }) => <TextCell row={row} accessorKey="phase" />, 'number'),
    createColumn('line', 'LINE NUMBER', ({ row }) => <TextCell row={row} accessorKey="line" />, 'number'),
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
                {`${row.getValue('deployment_id')}:${row.getValue('deployment')?.name}`}
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
    createColumn(
      'deployment_id',
      'DEPLOYMENT ID',
      ({ row }) => <TextCell row={row} accessorKey="deployment_id" />,
      'number'
    ),
    createColumn(
      'edges',
      'EDGES',
      ({ row }) => (
        <span className="flex gap-x-2">
          {row.getValue('edges')?.map((edge: any) => (
            <Link to={`/edge?id=${edge.id}~contains`} key={edge.id} target={'_blank'}>
              <Badge variant="outline" className="cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
                {edge.id}
              </Badge>
            </Link>
          ))}
        </span>
      ),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
  ];
};

const Spans = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return <Grid url="/span/all" getColumns={() => getColumns(navigate, setSearchParams)} />;
};

export default Spans;
