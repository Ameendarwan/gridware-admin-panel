import React, { FC, ReactNode } from 'react';

import { Button } from '@app/components/Button/Button';
import SVGIcon from '@app/components/SVGIcon';

interface TriggerItemProps {
  testId?: string;
  selectedValue: string;
  selectedValue2?: string;
  showOptions: boolean;
  setShowOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled?: boolean;
  hasError?: boolean;
  children?: ReactNode;
  hasTwoValues?: boolean;
  placeholder?: string;
}

const TriggerItem: FC<TriggerItemProps> = ({
  testId,
  selectedValue,
  selectedValue2,
  showOptions,
  isDisabled,
  hasError,
  children,
  hasTwoValues,
  setShowOptions,
  placeholder,
}) => {
  const buttonClasses = `
    flex min-h-[32px] h-auto items-center justify-between rounded-lg px-2
    hover:bg-grayShades-shade1
    ${showOptions ? 'border border-blueShades-shade2 bg-blueShades-shade3' : 'border border-transparent bg-grayShades-shade1'}
    ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    ${hasError && '!border-destructive'}
  `;

  const textClasses = `
    break-all text-xs font-bold capitalize text-primary text-left
    ${hasError ? '!text-destructive' : ''}
  `;

  return (
    <Button
      type="button"
      data-testid={testId}
      onClick={() => !isDisabled && setShowOptions(prev => !prev)}
      className={buttonClasses.trim()}>
      {children ??
        (hasTwoValues ? (
          <div className="flex w-full flex-row items-center">
            <span className={`flex-1 ${textClasses}`}>{selectedValue}</span>
            <span className={`flex-1 ${textClasses}`}>{selectedValue2}</span>
          </div>
        ) : (
          <span className={`whitespace-break-spaces text-justify ${textClasses}`}>
            {selectedValue || placeholder || ''}
          </span>
        ))}
      <SVGIcon icon="chevron" height={10} width={9} className="-rotate-90" />
    </Button>
  );
};

export default TriggerItem;
