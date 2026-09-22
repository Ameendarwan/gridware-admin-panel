import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import useErrorMessage from '@app/hooks/useErrorMessage';
import { useExportDeploymentGqlQuery } from '@app/store/apis/deployments/deployments';
import { ImportStatus, ImportSummary } from '../components/SideFilters/components/ImportToProductionDialog/types';

const useImportToProduction = (deploymentId: number | undefined, exportData?: any, deploymentName?: string) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importState, setImportState] = useState<ImportStatus>('confirm');
  const [shouldTriggerImport, setShouldTriggerImport] = useState(false);
  const [importErrorMessage, setImportErrorMessage] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const { data, isError, isLoading, isFetching, error } = useExportDeploymentGqlQuery(
    { deploymentId: deploymentId ?? -1 },
    { skip: !deploymentId || !shouldTriggerImport }
  );

  const errorMessage = useErrorMessage(error);

  useEffect(() => {
    if (errorMessage) setImportErrorMessage(errorMessage || 'Import failed');
  }, [errorMessage]);

  useEffect(() => {
    if (isError && errorMessage) {
      setShouldTriggerImport(false);
      setImportState('failed');
    }
  }, [isError, errorMessage]);

  const handleImportToProduction = () => {
    setShowImportDialog(true);
    setImportState('confirm');
  };

  const handleConfirmImport = () => {
    setImportState('loading');
    setShouldTriggerImport(true);
    setImportErrorMessage('');
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportState('confirm');
    setShouldTriggerImport(false);
    setImportSummary(null);
  };

  const handleImportAgain = () => {
    setImportState('confirm');
    setImportErrorMessage('');
  };

  const handleDownloadReport = async () => {
    if (!data) {
      toast.error('No data available to download');
      return;
    }

    try {
      const reportContent = JSON.stringify(data?.data, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = globalThis.URL.createObjectURL(blob);

      // Sanitize deployment name for filename
      const sanitizedName = deploymentName?.replaceAll(/[^a-zA-Z0-9-_]/g, '-') ?? `deployment-${deploymentId}`;
      const filename = `${sanitizedName}-import.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error downloading report');
    }
  };

  // Only show button when export data is available and no warnings
  const shouldShowButton = exportData && (!('warnings' in exportData) || !exportData.warnings?.length);

  useEffect(() => {
    if (data && shouldTriggerImport) {
      try {
        // Extract summary data from the response
        setImportSummary(data?.data);
        toast.success('Import completed successfully!');
        handleDownloadReport();
        setShouldTriggerImport(false);
        setImportState('complete');
      } catch (error) {
        console.error('Error processing import result:', error);
        toast.error('Error processing import result');
        setShouldTriggerImport(false);
        setImportState('failed');
      }
    }
  }, [data, shouldTriggerImport, deploymentId]);

  const loading = useMemo(
    () => isLoading || isFetching || importState === 'loading',
    [isLoading, isFetching, importState]
  );

  return {
    data,
    isError,
    isLoading: loading,
    error,
    errorMessage,
    importErrorMessage,
    importSummary,
    showImportDialog,
    importState,
    shouldShowButton,
    handleDownloadReport,
    handleImportToProduction,
    handleConfirmImport,
    handleCloseImportDialog,
    handleImportAgain,
  };
};

export default useImportToProduction;
