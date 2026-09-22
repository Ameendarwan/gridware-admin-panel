import { Issue, Validation, ValidationErrorT } from '@app/pages/Deployments/components/SideFilters/types';
import React, { FC, useEffect, useRef, useState } from 'react';
import { stageValidationMap, validationsTabs } from '@app/pages/Deployments/components/SideFilters/SideFilters.utils';

import { Button } from '@app/components/Button/Button';
import ErrorRows from '@app/pages/Deployments/components/SideFilters/components/ValidationError/components/ErrorRows';
import { VariableSizeList as List } from 'react-window';
import Loader from '@app/components/Loader/Loader';
import SVGIcon from '@app/components/SVGIcon';
import Tab from '@app/components/Tab';
import { setGpsLocationCoordinates, setPolesValidationErrors } from '@app/store/slices/polesSlice';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import useExportDeployment from '@app/hooks/useExportDeployment';
import { useValidateDeploymentMutation, useLazyGetValidationResultsQuery } from '@app/store/apis/validation/validation';
import ExportWarningsModal from '@app/components/ExportWarningsModal';
import ImportToProductionDialog from '../ImportToProductionDialog';
import useErrorMessage from '@app/hooks/useErrorMessage';
import { validationStorage } from '../../utils/validationStorage';
import { Progress } from '@app/components/Progress';

interface ValidationContentProps {
  isCollapsed: boolean;
  deploymentId?: string;
  deploymentName?: string;
}

const ValidationContent: FC<ValidationContentProps> = ({ deploymentId, isCollapsed, deploymentName }) => {
  const dispatch = useDispatch();

  const listRef = useRef<List>(null);
  const sizeMap = useRef<Map<number, number>>(new Map());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [listKey, setListKey] = useState(0);
  const [initialHeightsCalculated, setInitialHeightsCalculated] = useState(false);
  const [stages, setStages] = useState([...validationsTabs]);
  const [selectedStage, setSelectedStage] = useState<Validation>(validationsTabs[0]);
  const [isFinalCheckPassed, setIsFinalCheckPassed] = useState(false);
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [errors, setErrors] = useState<ValidationErrorT['issues']>();
  const [ignorableIssues, setIgnorableIssues] = useState<string[]>([]);
  const [validationProgress, setValidationProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [validationStartTime, setValidationStartTime] = useState<number | null>(null);
  const [validationCompletedTime, setValidationCompletedTime] = useState<number | null>(null);

  // Custom hook to handle export logic
  const {
    isLoading: exportLoading,
    isFetching: exportFetching,
    data: exportData,
    resetWarningsCheck,
    isCheckingWarnings,
    showWarningsModal,
    handleProceedWithWarnings,
    handleCancelExport,
  } = useExportDeployment(Number(deploymentId), isExportDisabled, deploymentName, true);

  // API hook to validate device
  const [validateDevice, { isLoading: isValidating, isError: isErrorValidations, error }] =
    useValidateDeploymentMutation();
  const [getValidationResults] = useLazyGetValidationResultsQuery();

  const errorMessage = useErrorMessage(error);

  useEffect(() => {
    // Show error toast if validation API fails
    if (isErrorValidations) {
      toast.error(errorMessage || 'Error Fetching validation details');
    }
  }, [isErrorValidations, errorMessage]);

  // Add this effect to reset after initial measurements
  useEffect(() => {
    if (errors?.length && !initialHeightsCalculated) {
      const timer = setTimeout(() => {
        setInitialHeightsCalculated(true);
        listRef.current?.resetAfterIndex(0);
        setListKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [errors, initialHeightsCalculated]);

  // Check for existing validation task on component mount
  useEffect(() => {
    if (!deploymentId) return;

    const existingTask = validationStorage.getValidationTask(deploymentId);
    if (existingTask) {
      setValidationProgress({ current: 0, total: existingTask.noOfBatches });

      // Restore timing information if available
      if (existingTask.startTime) {
        setValidationStartTime(existingTask.startTime);
      }
      if (existingTask.completionTime) {
        setValidationCompletedTime(existingTask.completionTime);
      }

      startPolling(existingTask.backgroundTaskId);
    } else {
      // Check for completed validation info
      const completionInfo = validationStorage.getValidationCompletion(deploymentId);
      if (completionInfo) {
        setValidationStartTime(completionInfo.startTime);
        setValidationCompletedTime(completionInfo.completionTime);
      }
    }
  }, [deploymentId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle tab selection manually
  const handleSelectTab = (tab: Validation) => {
    setSelectedStage(tab);
  };

  // Helper: Update validation progress
  const updateValidationProgress = (taskId: string, progressCurrent: number, progressTotal: number) => {
    setValidationProgress({
      current: progressCurrent,
      total: progressTotal,
    });

    if (deploymentId) {
      validationStorage.setValidationTask(deploymentId, taskId, progressTotal, validationStartTime ?? undefined);
    }
  };

  // Helper: Stop polling and cleanup
  const stopPollingAndCleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsPolling(false);
    setValidationProgress(null);

    if (deploymentId) {
      validationStorage.removeValidationTask(deploymentId);
    }
  };

  // Helper: Handle validation completion
  const handleValidationCompletion = (result: any) => {
    const completionTime = Date.now();
    setValidationCompletedTime(completionTime);

    // Store completion info persistently before removing task
    if (deploymentId && validationStartTime) {
      validationStorage.setValidationCompletion(deploymentId, validationStartTime, completionTime);
    }

    stopPollingAndCleanup();

    // Process the final results if available
    if (result?.data?.records) {
      try {
        processValidationResults(result?.data?.records);
      } catch (error) {
        console.error('Error processing validation results:', error);
        toast.error('Error processing validation results');
      }
    } else {
      // If no records, assume validation passed
      setIsFinalCheckPassed(true);
      setSelectedStage(validationsTabs[0]);
      setErrors([]);
      dispatch(setPolesValidationErrors(undefined));
    }
  };

  // Helper: Handle validation failure
  const handleValidationFailure = () => {
    stopPollingAndCleanup();
    toast.error('Validation failed. Please try again.');
  };

  // Start polling for validation results
  const startPolling = async (taskId: string) => {
    if (!deploymentId) return;

    setIsPolling(true);

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial check
    checkValidationStatus(taskId);

    // Set up polling interval (10 seconds)
    pollingIntervalRef.current = setInterval(() => {
      checkValidationStatus(taskId);
    }, 10000);
  };

  // Check validation status
  const checkValidationStatus = async (taskId: string) => {
    try {
      const result = await getValidationResults({ taskId }).unwrap();

      if (!result) return;

      const { progress_current, progress_total, status } = result;

      // Update progress with actual values from API
      updateValidationProgress(taskId, progress_current, progress_total);

      // Handle different status cases
      if (status === 'completed') {
        handleValidationCompletion(result);
      } else if (status === 'failed') {
        handleValidationFailure();
      }
      // Continue polling for 'in_progress' status
    } catch (error) {
      console.error('Error checking validation status:', error);
      // Continue polling even if there's an error
    }
  };

  // Process validation results
  const processValidationResults = (response: ValidationErrorT[]) => {
    if (!response || response.length === 0) {
      setIsFinalCheckPassed(true);
      setSelectedStage(validationsTabs[0]);
      setErrors([]);
      dispatch(setPolesValidationErrors(undefined));
      return;
    }

    const allStagesCompleted = response?.every(record => record.status === 'complete');

    // Helper function to check if stage is completed
    const checkStageCompletion = (stageStep: number) => {
      const matchingRecord = response?.find(res => stageStep === Number(res.stage));
      return matchingRecord?.status === 'complete';
    };

    // Update UI stage completion status
    setStages(prevStages => {
      return prevStages?.map(stage => ({
        ...stage,
        isCompleted: checkStageCompletion(stage.step),
      }));
    });

    if (allStagesCompleted) {
      setIsFinalCheckPassed(true);
      setSelectedStage(validationsTabs[0]);
      setErrors([]);
      dispatch(setPolesValidationErrors(undefined));
      return;
    }

    // Find the first incomplete stage
    const inCompleteStage = response?.find(record => record.status === 'in_complete');
    const stage = validationsTabs?.find(tab => tab.step == inCompleteStage?.stage) || validationsTabs[0];

    setSelectedStage(stage);

    // Find validation mapping for the stage
    const stageValidation = stageValidationMap[stage.step];

    if (stageValidation && inCompleteStage) {
      const pole_ids = inCompleteStage?.issues?.flatMap((issue: Issue) => issue?.ids) ?? [];
      setErrors(inCompleteStage?.issues);
      dispatch(
        setPolesValidationErrors({ type: stageValidation.validationType, pole_ids, icon: stageValidation.icon })
      );
    } else {
      setErrors([]);
      dispatch(setPolesValidationErrors(undefined));
    }
  };

  // Main function: triggers validations and updates stages/errors
  const triggerValidations = async () => {
    dispatch(setGpsLocationCoordinates(null));

    // Clear any existing completion data
    if (deploymentId) {
      validationStorage.removeValidationCompletion(deploymentId);
    }

    // Reset and record validation start time
    setValidationStartTime(Date.now());
    setValidationCompletedTime(null);
    setIsFinalCheckPassed(false);

    try {
      // Initial validation API call
      const validationResponse = await validateDevice({ deploymentId: deploymentId ?? '', ignorableIssues });
      const validationResults = validationResponse?.data;

      if (!validationResults) {
        toast.error('Failed to start validation');
        return;
      }

      const taskId = validationResults.task_id;

      // Store task info in localStorage and start polling
      if (taskId && deploymentId) {
        // Set initial progress state (will be updated by API)
        setValidationProgress({ current: 0, total: 0 });
        validationStorage.setValidationTask(deploymentId, taskId, 0, validationStartTime ?? undefined); // Store start time
        startPolling(taskId);
      }
    } catch (error) {
      console.error('Error starting validation:', error);
      toast.error('Failed to start validation');
    }
  };

  // Handle moving to the next step or enabling export
  const handleExport = () => {
    if (isFinalCheckPassed) {
      // Reset warnings check to trigger the initial check
      resetWarningsCheck();
      // Enable the export functionality directly
      setIsExportDisabled(false);
    }
  };

  const setRowHeight = (index: number, size: number) => {
    if (sizeMap.current.get(index) !== size) {
      sizeMap.current.set(index, size);
      listRef.current?.resetAfterIndex(index);
    }
  };

  // Update your getItemSize function
  const getItemSize = (index: number) => {
    // Return a smaller default height initially
    return initialHeightsCalculated ? (sizeMap.current.get(index) ?? 150) : 50; // Smaller initial height
  };

  // Helper function to format validation time
  const formatValidationTime = (startTime: number, endTime: number) => {
    const durationMs = endTime - startTime;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Handle ignoring all ignorable issues at once
  const handleIgnoreAll = () => {
    if (!errors) return;

    // Find all ignorable issues (is_warning = true)
    const ignorableIssueIds = errors.filter(err => err.is_warning && !err.isIgnored).map(err => err.id);

    if (ignorableIssueIds.length === 0) return;

    // Mark all ignorable issues as ignored
    setErrors(prev => prev?.map(err => (err.is_warning ? { ...err, isIgnored: true } : err)));

    // Add all ignorable issue IDs to the ignorableIssues state
    setIgnorableIssues(prev => Array.from(new Set([...prev, ...ignorableIssueIds])));
  };

  // Check if there are any ignorable issues that are not yet ignored
  const hasIgnorableIssues = errors?.some(err => err.is_warning && !err.isIgnored);

  // Get button text based on current state
  const getValidationButtonText = () => {
    if (isPolling) return 'Validation in Progress...';
    if (errors?.length) return 'Re-run Check';
    return 'Run Check';
  };

  return (
    <>
      {!isCollapsed && (
        <>
          {/* Tabs header */}
          <div className="flex w-full items-center justify-center border-b border-stone-300 bg-white px-4">
            {stages?.map(stage => (
              <Tab
                item={stage}
                key={stage.step}
                isActive={isFinalCheckPassed ? false : stage.step === selectedStage?.step}
                handleSelect={handleSelectTab}
                isDisabled={selectedStage?.step !== stage?.step}
                isCompleted={stage.isCompleted}
                isPending={Number(stage.step) > Number(selectedStage.step)}
              />
            ))}
          </div>

          {/* Validation section */}
          <div className="flex flex-col">
            {!isFinalCheckPassed && (
              <h2 className="mt-2 flex h-10 w-full items-center bg-white px-4 text-sm font-bold text-primary">
                {selectedStage?.stepTitle}
              </h2>
            )}
            <div className="relative mb-3 flex flex-col justify-end gap-2 px-4">
              {/* Re-run validation button */}
              {!isFinalCheckPassed && (
                <div className="flex flex-col">
                  {!isPolling && !isValidating && (
                    <Button
                      variant="secondary"
                      className={`font-bold ${errors?.length ? '!bg-blackShades-shade1' : ''}`}
                      loading={isValidating || isPolling}
                      onClick={triggerValidations}>
                      {getValidationButtonText()}
                    </Button>
                  )}

                  {/* Progress bar for validation */}
                  {validationProgress && (
                    <div className="mt-1">
                      <Progress
                        value={validationProgress.current}
                        max={validationProgress.total || 100}
                        showPercentage
                        progressBgColor="bg-green-400"
                      />
                      <p className="mt-2 text-center text-sm text-stone-600">Processing validation...</p>
                    </div>
                  )}
                </div>
              )}
              {/* Validation completion message */}
              {validationStartTime && validationCompletedTime && (
                <div className="mt-3 flex flex-col gap-2 rounded-[6px] border border-success/20 bg-success/10 p-4">
                  <span className="text-xs text-stone-600">
                    Validation completed in {formatValidationTime(validationStartTime, validationCompletedTime)}
                  </span>
                </div>
              )}

              {/* Export button after successful recheck */}
              {!errors?.length && isFinalCheckPassed && (
                <div className="mt-1 flex flex-col">
                  <Button
                    variant="success"
                    onClick={handleExport}
                    loading={exportLoading || exportFetching}
                    disabled={exportLoading || exportFetching}>
                    <SVGIcon icon="export" color="fill-white" />
                    Export
                  </Button>
                </div>
              )}

              <ImportToProductionDialog
                deploymentId={deploymentId}
                deploymentName={deploymentName}
                exportData={exportData}
                className="w-full text-xs"
              />

              {/* Validation checks information */}
              {!errors?.length && !isFinalCheckPassed && !isPolling && !isValidating && (
                <div className="flex flex-col gap-3">
                  {selectedStage?.checks?.map(check => (
                    <div className="flex flex-col gap-2 rounded-[6px] bg-[#EDEDEF] p-4" key={check.id}>
                      <span className="text-xs font-medium">{check.title}</span>
                      <span className="text-[10px] font-medium">{check.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Errors list section */}
          <div className="relative flex w-full flex-col justify-between">
            {isValidating || isPolling ? (
              <div className="flex h-auto items-center justify-center">
                <Loader width={'150'} height={'150'} />
              </div>
            ) : (
              <>
                {errors && errors?.length > 0 ? (
                  <>
                    {/* Ignore All button */}
                    {hasIgnorableIssues && (
                      <div className="px-4 pb-3">
                        <Button className="w-full !text-[12px] !font-bold" onClick={handleIgnoreAll}>
                          <SVGIcon icon="eye-closed" />
                          Ignore All
                        </Button>
                      </div>
                    )}
                    <List
                      key={listKey}
                      height={550}
                      itemCount={errors?.length ?? 0}
                      itemSize={getItemSize}
                      width="100%"
                      itemData={{
                        errors: errors ?? [],
                        selectedStage,
                        setErrors,
                        setRowHeight,
                        setIgnorableIssues,
                      }}
                      ref={listRef}>
                      {ErrorRows}
                    </List>
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Export Warnings Modal */}
      <ExportWarningsModal
        isOpen={showWarningsModal}
        onClose={() => handleCancelExport(() => setIsExportDisabled(true))}
        onProceed={handleProceedWithWarnings}
        warnings={exportData && 'warnings' in exportData ? exportData.warnings || [] : []}
        warningCount={exportData && 'warning_count' in exportData ? exportData.warning_count || 0 : 0}
        isLoading={exportLoading && !isCheckingWarnings}
      />
    </>
  );
};

export default ValidationContent;
