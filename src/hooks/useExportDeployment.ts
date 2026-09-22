import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import useErrorMessage from './useErrorMessage';
import { useExportDeploymentQuery } from '@app/store/apis/deployments/deployments';

const useExportDeployment = (
  deploymentId: number | undefined,
  disabledDownload?: boolean,
  deploymentName?: string,
  checkWarnings?: boolean
) => {
  const [shouldCheckWarnings, setShouldCheckWarnings] = useState(checkWarnings !== false);
  const [showWarningsModal, setShowWarningsModal] = useState(false);

  const { data, isError, isLoading, isFetching, error, refetch } = useExportDeploymentQuery(
    {
      deploymentId: deploymentId ?? -1,
      check_warnings: shouldCheckWarnings,
    },
    { skip: !deploymentId || disabledDownload } // Skip the query if no deploymentId or download is disabled
  );

  // Get the error message from the custom hook
  const errorMessage = useErrorMessage(error);

  // useEffect to display an error toast when an error occurs
  useEffect(() => {
    if (isError) {
      toast.error(errorMessage ?? 'Export failed');
    }
  }, [isError, errorMessage]);

  // Handle export warnings response
  useEffect(() => {
    if (data && shouldCheckWarnings) {
      // Check if the response has warnings (is ExportDeploymentWarningsResponse)
      if ('warnings' in data && 'warning_count' in data) {
        const response = data;

        if (response.has_warnings && response.warnings?.length > 0) {
          // Show warnings modal
          setShowWarningsModal(true);
        } else if (!response.has_warnings) {
          // No warnings, proceed automatically
          proceedWithDownload();
        }
      } else {
        // File response - no warnings, start download
        proceedWithDownload();
      }
    }
  }, [data, shouldCheckWarnings]);

  // useEffect to trigger the download of data once it's available
  useEffect(() => {
    if (data && !shouldCheckWarnings && typeof globalThis !== 'undefined' && globalThis.URL?.createObjectURL) {
      // Check if this is a file response (has 'data' and 'filename' properties)
      if ('data' in data && 'filename' in data) {
        // Only download if we're not checking for warnings and in a browser environment
        const jsonData = JSON.stringify(data.data, null, 2); // Format with 2-space indentation
        // Create a Blob from the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });
        // Generate a URL for the Blob
        const blobUrl = globalThis.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `${deploymentName ?? data.filename}`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        globalThis.URL.revokeObjectURL(blobUrl);
      }
    }
  }, [data, shouldCheckWarnings, deploymentName]);

  const proceedWithDownload = () => {
    setShouldCheckWarnings(false);
  };

  // Refetch when shouldCheckWarnings changes to get the file data
  useEffect(() => {
    if (!shouldCheckWarnings && deploymentId && !disabledDownload) {
      refetch();
    }
  }, [shouldCheckWarnings, refetch, deploymentId, disabledDownload]);

  const resetWarningsCheck = () => {
    setShouldCheckWarnings(true);
  };

  // Handle warnings modal actions
  const handleProceedWithWarnings = () => {
    setShowWarningsModal(false);
    proceedWithDownload();
  };

  const handleCancelExport = (resetDisabled?: () => void) => {
    setShowWarningsModal(false);
    setShouldCheckWarnings(true);
    // Call the optional reset function to handle component-specific cleanup
    if (resetDisabled) {
      resetDisabled();
    }
  };

  return {
    data,
    isError,
    isLoading,
    isFetching,
    error,
    proceedWithDownload,
    resetWarningsCheck,
    isCheckingWarnings: shouldCheckWarnings,
    // Modal-related returns
    showWarningsModal,
    handleProceedWithWarnings,
    handleCancelExport,
    setShowWarningsModal,
  };
};

export default useExportDeployment;
