import {
  ExtendedColumnDef,
  TextCell,
  createColumn,
  getCommonColumns,
  formatDate,
  formatDateUtc,
} from '@app/components/DataTable/DataTable.utils';
import { FC, useState } from 'react';
import { Link, NavigateFunction, SetURLSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

import { Badge } from '@app/components/Badge/Badge';
import { Button } from '@app/components/Button/Button';
import ExportWarningsModal from '@app/components/ExportWarningsModal';
import { DeploymentsProps } from './types';
import Grid from '@app/components/Grid';
import Loader from '@app/components/Loader/Loader';
import MapBox from './components/MapBox';
import SVGIcon from '@app/components/SVGIcon';
import SideFilters from './components/SideFilters';
import ToggleView from './components/ToggleView';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import { urls } from '@app/routes/urls';
import useExportDeployment from '@app/hooks/useExportDeployment';
import { API } from '@app/lib/api-config';
import { downloadCSV } from '@app/utils/csvDownload';
import { createCreatedAtColumn, createUpdatedAtColumn } from '@app/utils/columnHelpers';

const getColumns = (
  navigate: NavigateFunction,
  handleView: (url: string) => void,
  setSearchParams: SetURLSearchParams,
  handleExport?: (deploymentId: number, deploymentName?: string) => void
): ExtendedColumnDef<any>[] => {
  const handlePoleView = (deploymentId: number) => {
    handleView(`${urls.deployments.map}/${deploymentId}`);
  };

  const handleDownloadReport = async (deploymentId: number, type: string, deploymentName?: string) => {
    try {
      const response = await API.get(`/deployment/report-mvp/${deploymentId}?report_type=${type}`);

      // Define the mapping configuration
      const fieldMapping = {
        pole_id: 'Pole ID',
        deployment_id: 'Customer Deployment ID',
        installed_at: 'Installed At (Date)',
        lat: 'Lat',
        long: 'Long',
        status: 'Status',
        status_type: 'Inaccessible Reason',
        access_efforts: 'Access Attempts',
        status_reason: 'Inaccessible Comment',
        last_date_accessed_attempted: 'Date Access Attempted',
        updated_by: 'Email Address of User who attempted access',
      };

      // Get the headers for the CSV
      const csvHeaders = Object.values(fieldMapping);

      if (response.data?.data) {
        // Map the data using the field mapping
        const csvData = response.data.data.map((item: any) => {
          const mappedItem: any = {};
          for (const [key, header] of Object.entries(fieldMapping)) {
            mappedItem[header] = item[key] || '';
          }
          return mappedItem;
        });

        // Download the CSV file
        downloadCSV(csvData, `${deploymentName}`, undefined, {
          forceTextFormat: true,
          defaultHeaders: csvHeaders,
        });
      } else {
        // No data returned, create empty CSV with headers
        downloadCSV([], `${deploymentName}`, undefined, {
          forceTextFormat: true,
          defaultHeaders: csvHeaders,
        });
      }
    } catch (error) {
      console.error('Error fetching install report:', error);
      // You might want to show an error message to the user here
    }
  };

  return [
    ...getCommonColumns({
      navigate,
      url: urls.deployments.list,
      hideColumns: { hideMarkComplete: true, hideMultiSelect: true, hideDelete: true, hideRetry: true },
      handlePoleView,
      setSearchParams,
      handleExport,
    }),
    createColumn(
      'shortcuts',
      'SHORTCUTS',
      ({ row }) => (
        <div className="flex gap-x-2">
          <Button onClick={() => handlePoleView(row.original.id)}>View all poles</Button>
          <Button
            onClick={() =>
              globalThis.open(
                `${urls.devices.list}?deployment_name=${encodeURIComponent(row.getValue('name'))}~contains`,
                '_blank'
              )
            }>
            View all Devices
          </Button>
          <Button onClick={() => handleDownloadReport(row.getValue('id'), 'install_report', row.getValue('name'))}>
            Install Report
          </Button>
          <Button
            onClick={() => handleDownloadReport(row.getValue('id'), 'inaccessible_poles_report', row.getValue('name'))}>
            Inaccessible Poles Report
          </Button>
        </div>
      ),
      'string',
      { enableSorting: false, enableHiding: false, excludeFilter: true }
    ),
    createColumn('id', 'ID', ({ row }) => <TextCell row={row} accessorKey="id" />, 'string'),
    createColumn('name', 'DEPLOYMENT NAME', ({ row }) => <TextCell row={row} accessorKey="name" />, 'string'),
    createColumn('location', 'LOCATION', ({ row }) => <TextCell row={row} accessorKey="location" />, 'string'),
    createColumn('poles_count', 'POLES COUNT', ({ row }) => <TextCell row={row} accessorKey="poles_count" />, 'number'),
    createColumn(
      'stats',
      'STATS',
      ({ row }) => <TruncatedTextCell value={row.getValue('stats')} trimSize={25} />,
      'string',
      { excludeFilter: true, enableSorting: false }
    ),

    createColumn(
      'file_path',
      'JSON FILE',
      ({ row }) => (
        <span>
          {row.getValue('file_path') ? (
            <a
              href={row.getValue('file_path')?.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-x-1 text-accent">
              <i className="fa-solid fa-file" />
              {row.getValue('file_path')?.filename}
            </a>
          ) : (
            ''
          )}
        </span>
      ),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'kml_path',
      'PUBLIC INFO MAP OVERLAY',
      ({ row }) => (
        <span>
          {row.getValue('kml_path') ? (
            <a
              href={row.getValue('kml_path')?.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-x-1 text-accent">
              <i className="fa-solid fa-file" />
              {row.getValue('kml_path')?.filename}
            </a>
          ) : (
            ''
          )}
        </span>
      ),
      'string',
      {
        excludeFilter: true,
        enableSorting: false,
      }
    ),
    createCreatedAtColumn(),
    createUpdatedAtColumn(),
    createColumn(
      'customer',
      'CUSTOMER',
      ({ row }) => (
        <span className="flex gap-x-2">
          {row.getValue('customer') ? (
            <Link to={`/customers/${row.getValue('customer')?.id}/view`} key={row.getValue('customer')?.id}>
              <Badge variant="outline" className="min-w-max cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
                {`${row.getValue('customer')?.id} - ${row.getValue('customer')?.name}`}
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
      'customer_id',
      'CUSTOMER ID',
      ({ row }) => <TextCell row={row} accessorKey="customer_id" />,
      'string',
      { hide: true }
    ),
    createColumn(
      'customer_name',
      'CUSTOMER NAME',
      ({ row }) => <TextCell row={row} accessorKey="customer_name" />,
      'string',
      { hide: true }
    ),
    createColumn(
      'users',
      'USERS',
      ({ row }) => (
        <span className="flex gap-x-2">
          {row.getValue('users')?.map((user: any) => (
            <Link to={`/users/${user.id}/view`} key={user.id}>
              <Badge variant="outline" className="cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
                {`${user.email}`}
              </Badge>
            </Link>
          ))}
        </span>
      ),
      'string',
      { excludeFilter: true, enableSorting: false }
    ),

    createColumn('created_by', 'CREATED BY', ({ row }) => <TextCell row={row} accessorKey="created_by" />, 'string'),
    createColumn('updated_by', 'UPDATED BY', ({ row }) => <TextCell row={row} accessorKey="updated_by" />, 'string'),
    createColumn(
      'gridware_id',
      'GRIDWARE ID',
      ({ row }) => <TextCell row={row} accessorKey="gridware_id" />,
      'string',
      { excludeFilter: true, enableSorting: false }
    ),
    createColumn(
      'validated',
      'VALIDATED',
      ({ row }) => (
        <span>
          {row?.getValue('validated')?.toLowerCase() === 'yes' ? (
            <SVGIcon icon={'check-circle'} width={20} height={20} color="fill-success" />
          ) : (
            <SVGIcon icon={'cross-circle'} width={20} height={20} color={'fill-destructive'} />
          )}
        </span>
      ),
      'boolean'
    ),
    // createColumn(
    //   'import_status',
    //   'IMPORT STATUS',
    //   ({ row }) => <TextCell row={row} accessorKey="import_status" />,
    //   'string'
    // ),
    createColumn(
      'validation_completed_at',
      'VALIDATION COMPLETED AT',
      ({ row }) => (
        <TextCell
          row={row}
          accessorKey="validation_completed_at"
          transform={value => formatDate(value)}
          tooltipTransform={v => formatDateUtc(v)}
        />
      ),
      'date'
    ),
    createColumn(
      'validation_completed_by',
      'VALIDATION COMPLETED BY',
      ({ row }) => <TextCell row={row} accessorKey="validation_completed_by" />,
      'string'
    ),
  ];
};

const Deployments: FC<DeploymentsProps> = ({ isMapView }) => {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  const [deploymentId, setDeploymentId] = useState(0);
  const [deploymentName, setDeploymentName] = useState('');
  const [isExportDisabled, setIsExportDisabled] = useState(true);

  // Custom hook to handle export logic
  const {
    isLoading,
    isFetching,
    data: exportData,
    resetWarningsCheck,
    showWarningsModal,
    handleProceedWithWarnings,
    handleCancelExport,
  } = useExportDeployment(deploymentId, isExportDisabled, deploymentName, true);

  const handleView = (url: string) => {
    globalThis.open(url, '_blank');
  };

  const handleExport = (id: number, name?: string) => {
    setDeploymentId(id);
    setDeploymentName(name ?? '');
    // Reset warnings check to trigger the initial check
    resetWarningsCheck();
    // Enable the export functionality directly
    setIsExportDisabled(false);
  };

  return (
    <>
      {!isMapView && (
        <>
          <Grid
            url="/deployment/all"
            buttonText="New Deployment"
            onButtonClick={() => navigate(urls.deployments.create)}
            getColumns={() => getColumns(navigate, handleView, setSearchParams, handleExport)}
          />
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 z-50 flex h-screen w-full items-center justify-center">
              <Loader />
            </div>
          )}
        </>
      )}
      {isMapView && (
        <div className="relative flex h-full flex-row">
          <div className="hidden lg:flex">
            <SideFilters />
          </div>

          <div className="flex h-full w-full flex-col items-start justify-center">
            <ToggleView isMapView={isMapView} handleView={handleView} />
            <MapBox />
          </div>
        </div>
      )}

      {/* Export Warnings Modal */}
      <ExportWarningsModal
        isOpen={showWarningsModal}
        onClose={() => handleCancelExport(() => setIsExportDisabled(true))}
        onProceed={handleProceedWithWarnings}
        warnings={exportData && 'warnings' in exportData ? exportData.warnings || [] : []}
        warningCount={exportData && 'warning_count' in exportData ? exportData.warning_count || 0 : 0}
        isLoading={isLoading}
      />
    </>
  );
};

export default Deployments;
