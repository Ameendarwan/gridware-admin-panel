import Grid from '@app/components/Grid';
import { NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createColumn, ExtendedColumnDef, getCommonColumns } from '@app/components/DataTable/DataTable.utils';
import { urls } from '@app/routes/urls';
import { createAuditColumns, createDeploymentColumns } from '@app/utils/columnHelpers';

export const getColumns = (
  navigate: NavigateFunction,
  setSearchParams: SetURLSearchParams
): ExtendedColumnDef<any>[] => {
  return [
    ...getCommonColumns({
      navigate,
      url: urls.csv.list,
      hideColumns: {
        hideExport: true,
        hideMap: true,
        hideMarkComplete: true,
        hideEdit: true,
        hideRetry: true,
      },
      setSearchParams,
    }),
    ...createAuditColumns(),
    ...createDeploymentColumns(),
    createColumn(
      'file_path',
      'CSV FILE',
      ({ row }) => (
        <span>
          {row.getValue('file_path') ? (
            <a href={row.getValue('file_path')?.url} target="_blank" rel="noreferrer" className={'text-accent'}>
              <i className="fa-solid fa-file-csv" />
              {row.getValue('file_path')?.filename}
            </a>
          ) : (
            ''
          )}
        </span>
      ),
      'string',
      { excludeFilter: true }
    ),
  ];
};

const CSV = () => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  return <Grid url="/csv/all" getColumns={() => getColumns(navigate, setSearchParams)} />;
};

export default CSV;
