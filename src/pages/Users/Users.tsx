import Grid from '@app/components/Grid';
import { createColumn, ExtendedColumnDef, getCommonColumns, TextCell } from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createAuditColumns } from '@app/utils/columnHelpers';

const getColumns = (navigate: NavigateFunction, setSearchParams: SetURLSearchParams): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.users.list,
      hideColumns: { hideExport: true, hideMap: true, hideMarkComplete: true, hideEdit: true, hideRetry: true },
      setSearchParams,
    }),
    ...createAuditColumns().slice(0, 3), // Only ID, created_at, updated_at
    createColumn('email', 'EMAIL', ({ row }) => <TextCell row={row} accessorKey="email" />, 'string'),
    createColumn('provider_id', 'PROVIDER ID', ({ row }) => <TextCell row={row} accessorKey="provider_id" />, 'string'),
    ...createAuditColumns().slice(3), // created_by, updated_by
  ];
};

const Users = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  return (
    <Grid
      url="/user/all"
      buttonText="New User"
      buttonTestId="new-user-btn"
      onButtonClick={() => navigate(urls.users.create)}
      getColumns={() => getColumns(navigate, setSearchParams)}
    />
  );
};

export default Users;
