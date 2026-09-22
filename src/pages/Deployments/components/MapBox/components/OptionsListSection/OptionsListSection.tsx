import { FC, ReactNode } from 'react';

import { Button } from '@app/components/Button/Button';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import SVGIcon from '@app/components/SVGIcon';

interface OptionsListSectionProps {
  title?: string;
  buttonTitle?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  buttonClass?: string;
  isValueChanged?: boolean;
  setShowOptions?: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose?: () => void;
  onSaveClick?: () => void;
}

const OptionsListSection: FC<OptionsListSectionProps> = ({
  title,
  buttonTitle,
  buttonClass,
  className,
  children,
  disabled,
  isValueChanged,
  setShowOptions,
  handleClose,
  onSaveClick,
}) => {
  const onClose = () => {
    handleClose?.();
    setShowOptions?.(false);
  };

  const handleSectionClose = () => {
    if (!isValueChanged) onClose();
  };

  return (
    <div className="absolute bottom-0 left-80 top-0 z-50 max-h-min rounded bg-white !font-mont shadow-custom">
      <div className="flex max-h-[78vh] w-[300px] flex-col">
        {title && (
          <div className="!border-b-1 mt-1.5 flex min-h-[34px] items-center justify-between border-muted px-4">
            <span className="break-all text-sm font-bold text-primary">{title}</span>
            <ConfirmationDialog
              title="You have unsaved changes"
              description="Are you sure you want to discard this edits? Your changes will be lost."
              cancelButtonTitle="Keep"
              triggerComponent={
                <SVGIcon icon="cross" color="fill-black" onClick={handleSectionClose} className="cursor-pointer" />
              }
              confirmationComponent={
                <Button type="button" variant="destructive" className="bg-redShades-shade1" onClick={onClose}>
                  Discard
                </Button>
              }
            />
          </div>
        )}

        {/* Scrollable content area */}
        <div className={`flex flex-col gap-2 overflow-auto bg-white p-4 pt-2 ${className}`}>{children}</div>

        {/* Sticky button at bottom */}
        {buttonTitle && (
          <div className="sticky bottom-0 z-10 border-t border-muted bg-white p-2">
            <Button
              type="button"
              className={`min-h-[40px] w-full bg-secondary font-bold hover:bg-secondary ${buttonClass}`}
              onClick={onSaveClick}
              disabled={Boolean(disabled)}
              data-testid="options-list-save">
              {buttonTitle}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsListSection;
