import Grid from '@app/components/Grid';
import { createColumn, ExtendedColumnDef, getCommonColumns, TextCell } from '@app/components/DataTable/DataTable.utils';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { urls } from '@app/routes/urls';
import { createAuditColumns } from '@app/utils/columnHelpers';

const getColumns = (navigate: NavigateFunction, setSearchParams: SetURLSearchParams): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.customers.list,
      hideColumns: { hideExport: true, hideMap: true, hideMarkComplete: true, hideMultiSelect: true, hideRetry: true },
      setSearchParams,
    }),
    ...createAuditColumns(),
    createColumn('name', 'Name', ({ row }) => <TextCell row={row} accessorKey="name" />, 'string'),
    createColumn('description', 'DESCRIPTION', ({ row }) => <TextCell row={row} accessorKey="description" />, 'string'),
    createColumn(
      'gridware_id',
      'GRIDWARE UUID',
      ({ row }) => <TextCell row={row} accessorKey="gridware_id" />,
      'string',
      { enableSorting: false }
    ),
  ];
};

const Customers = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  return (
    <Grid
      url="/customer/all"
      buttonText="New Customer"
      onButtonClick={() => navigate(urls.customers.create)}
      getColumns={() => getColumns(navigate, setSearchParams)}
    />
  );
};

export default Customers;
