import React, { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/Dialog/Dialog';
import { Button } from '@app/components/Button/Button';
import { AlertTriangle } from 'lucide-react';

interface ExportWarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  warnings: string[];
  warningCount: number;
  isLoading?: boolean;
}

const ExportWarningsModal: FC<ExportWarningsModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  warnings,
  warningCount,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <DialogTitle className="text-lg font-semibold">Export Warnings ({warningCount})</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            The following warnings were found. You can proceed with the export or cancel to review these issues.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto rounded-md bg-yellow-50 p-4">
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li
                key={`warning-${index}-${warning.substring(0, 30)}`}
                className="flex items-start gap-2 text-sm text-yellow-800">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-600" />
                <span className="whitespace-pre-line">{warning}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="secondary"
            onClick={onProceed}
            loading={isLoading}
            className="bg-yellow-600 text-white hover:bg-yellow-700">
            Proceed with Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportWarningsModal;
