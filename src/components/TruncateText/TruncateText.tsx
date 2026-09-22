import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';

import { FC } from 'react';

interface TruncatedTextCellProps {
  value: unknown;
  trimSize: number;
  className?: string;
  position?: 'top' | 'bottom';
}

const TruncatedTextCell: FC<TruncatedTextCellProps> = ({ value, trimSize, className, position = 'top' }) => {
  if (value === null || value === undefined) {
    return (
      <span data-testid="no-data" className="text-gray-500">
        No data
      </span>
    );
  }

  const stringValue =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : (value as string | number | boolean).toString();
  const truncatedValue = stringValue.length > trimSize ? `${stringValue.slice(0, trimSize)}...` : stringValue;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`line-clamp-1 cursor-pointer truncate ${className}`}>{truncatedValue}</span>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side={position}
            sideOffset={5}
            align="start"
            className="relative z-[9999] max-h-[70vh] w-96 overflow-auto rounded-lg border bg-white p-2 text-black shadow-lg"
            style={{
              position: 'relative',
              isolation: 'isolate',
            }}>
            <div className="absolute inset-0 -z-10 bg-white" />
            <pre className="relative whitespace-pre-wrap break-words">{stringValue}</pre>
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TruncatedTextCell;
