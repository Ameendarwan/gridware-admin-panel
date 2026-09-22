import { createColumn, ExtendedColumnDef, getCommonColumns } from '@app/components/DataTable/DataTable.utils';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

import Grid from '@app/components/Grid';
import { urls } from '@app/routes/urls';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import { createAuditColumns, createDeploymentColumns } from '@app/utils/columnHelpers';

export const getColumns = (
  navigate: NavigateFunction,
  setSearchParams: SetURLSearchParams
): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.publicInfoCircuit.list,
      hideColumns: { hideExport: true, hideMap: true, hideMarkComplete: true, hideRetry: true },
      setSearchParams,
    }),
    ...createAuditColumns(),
    ...createDeploymentColumns(),
    createColumn(
      'coordinates',
      'COORDINATES',
      ({ row }) => <TruncatedTextCell value={JSON.stringify(row.getValue('coordinates'), null, 1)} trimSize={30} />,
      'boolean',
      { enableSorting: false }
    ),
  ];
};

const PublicInfoCircuit = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  return (
    <Grid
      url="/circuit/all"
      buttonText="New Circuit"
      onButtonClick={() => navigate(urls.publicInfoCircuit.create)}
      getColumns={() => getColumns(navigate, setSearchParams)}
    />
  );
};

export default PublicInfoCircuit;
