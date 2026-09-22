import Grid from '@app/components/Grid';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createColumn, ExtendedColumnDef, getCommonColumns } from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { createAuditColumns, createDeploymentColumns, createPoleLinkColumn } from '@app/utils/columnHelpers';

const getColumns = (navigate: NavigateFunction, setSearchParams: SetURLSearchParams): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.edge.list,
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
    createColumn('from_pole_id', 'FROM POLE ID', ({ row }) => (
      <span className="flex gap-x-2">{row.getValue('from_pole_id')}</span>
    )),
    createPoleLinkColumn('from_pole_id', 'FROM POLE OBJECT', 'from_pole', MapMode),
    createColumn('to_pole_id', 'TO POLE ID', ({ row }) => (
      <span className="flex gap-x-2">{row.getValue('to_pole_id')}</span>
    )),
    createPoleLinkColumn('to_pole_id', 'TO POLE OBJECT', 'to_pole', MapMode),
    ...createDeploymentColumns(),
  ];
};

const Edges = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return <Grid url="/edge/all" getColumns={() => getColumns(navigate, setSearchParams)} />;
};

export default Edges;
