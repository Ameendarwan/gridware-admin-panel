import React, { FC } from 'react';
import { Button } from '@app/components/Button/Button';
import Loader from '@app/components/Loader/Loader';
import useImportToProduction from '@app/pages/Deployments/hooks/useImportToProduction';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/Dialog/Dialog';
import { ImportToProductionDialogProps } from './types';
import ImportSummary from './ImportSummary/ImportSummary';

const ImportToProductionDialog: FC<ImportToProductionDialogProps> = ({
  deploymentId,
  deploymentName,
  exportData,
  className = 'w-full text-xs',
}) => {
  const {
    importErrorMessage,
    importSummary,
    showImportDialog,
    importState,
    shouldShowButton,
    isLoading,
    handleDownloadReport,
    handleImportToProduction,
    handleConfirmImport,
    handleCloseImportDialog,
  } = useImportToProduction(Number(deploymentId), exportData, deploymentName);

  if (!shouldShowButton) {
    return null;
  }

  return (
    <>
      <Button onClick={handleImportToProduction} className={className} variant="muted">
        Import data into Production
      </Button>

      <Dialog open={showImportDialog}>
        <DialogContent className="!rounded-[12px] font-mont sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className={`text-sm font-bold ${importState === 'failed' && 'text-red-600'} ${importState === 'complete' && 'text-green-600'}`}>
              {importState === 'confirm' && 'Import deployment to Production'}
              {isLoading && 'Importing deployment...'}
              {importState === 'complete' && 'Import completed!'}
              {importState === 'failed' && 'Import failed'}
            </DialogTitle>
            {isLoading && (
              <DialogDescription className="!mt-4 text-xs font-semibold text-primary">
                Importing… This can take a little while. Don't close this window.
              </DialogDescription>
            )}
            {importState === 'complete' && importSummary && <ImportSummary importSummary={importSummary} />}
            {importState === 'failed' && !isLoading && (
              <DialogDescription className="!mt-4 text-xs text-primary">
                {importErrorMessage && <div className="mb-2">{importErrorMessage}</div>}
                <span>Please try again.</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader width="60" height="60" />
            </div>
          )}

          <DialogFooter className="justify-between">
            <div className="flex w-full flex-row justify-between gap-2">
              {importState === 'confirm' && (
                <>
                  <Button variant="muted" className="text-accent" onClick={handleCloseImportDialog}>
                    Close
                  </Button>
                  <Button variant="secondary" onClick={handleConfirmImport}>
                    Import
                  </Button>
                </>
              )}
              {importState === 'complete' && (
                <>
                  <Button variant="muted" className="text-accent" onClick={handleCloseImportDialog}>
                    Close
                  </Button>
                  <Button variant="secondary" onClick={handleDownloadReport}>
                    Download Report Again
                  </Button>
                </>
              )}
              {importState === 'failed' && (
                <>
                  <Button variant="muted" className="text-accent" onClick={handleCloseImportDialog}>
                    Close
                  </Button>
                  <Button variant="secondary" onClick={handleConfirmImport}>
                    Import again
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportToProductionDialog;
