import React, { FC } from 'react';
import { DialogDescription } from '@app/components/Dialog/Dialog';
import { ImportSummary as ImportSummaryType } from '../types';
import { AlertCircle } from 'lucide-react';

interface ImportSummaryProps {
  importSummary: ImportSummaryType;
}

const ImportSummary: FC<ImportSummaryProps> = ({ importSummary }) => {
  return (
    <DialogDescription className="!mt-4 text-xs text-primary">
      <div className="space-y-2">
        {importSummary?.errors && importSummary?.errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <h4 className="mb-2 font-semibold text-red-900">
                  {importSummary.errors.length} Error{importSummary.errors.length > 1 ? 's' : ''} Found
                </h4>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {importSummary.errors.map((error, index) => (
                    <div
                      key={`error-${index}-${error.substring(0, 20)}`}
                      className="flex items-center gap-1.5 text-red-700">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span className="break-words">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            Poles Created: <span className="font-bold">{importSummary?.poles_created?.length || 0}</span>
          </div>
          <div>
            Poles Updated: <span className="font-bold">{importSummary?.poles_updated?.length || 0}</span>
          </div>
          <div>
            Device Installs Created:{' '}
            <span className="font-bold">{importSummary?.device_installs_created?.length || 0}</span>
          </div>
          <div>
            Pole Neighbors Created: <span className="font-bold">{importSummary?.pole_neighbors_created || 0}</span>
          </div>
          <div>
            Photos Uploaded: <span className="font-bold">{importSummary?.photos_uploaded?.length || 0}</span>
          </div>
        </div>
      </div>
    </DialogDescription>
  );
};

export default ImportSummary;
