import { LineType, SpanT } from '@app/pages/Deployments/components/MapBox/types';
import React, { useState } from 'react';

import QuantitySelector from './components/QuantitySelector';
import SVGIcon from '@app/components/SVGIcon';
import SelectSpan from './components/SelectSpan';

interface SpanProps {
  span: SpanT | null;
  spanTypesCount?: { primary: boolean; transmission: boolean; secondary: boolean };
  onUpdate: (updatedData: Partial<SpanT>) => void;
  onRemove?: (id: number) => void;
  hideSpanRemove?: boolean;
  selectSpanDisabled?: boolean;
}

const Span: React.FC<SpanProps> = ({
  span,
  spanTypesCount,
  hideSpanRemove,
  selectSpanDisabled,
  onUpdate,
  onRemove,
}) => {
  const [type, setType] = useState(span?.type ?? LineType.Primary);

  const handlePhaseChange = (newPhase: number) => {
    onUpdate({ phase: newPhase });
  };

  const handleLineChange = (newLine: number) => {
    onUpdate({ line: newLine });
  };

  const handleTypeChange = (newType: LineType) => {
    onUpdate({ type: newType });
    setType(newType);
  };

  return (
    <div className="relative mt-2.5 flex w-full items-start gap-2.5" key={span?.id}>
      <div className="flex flex-1 shrink basis-0 items-center gap-2.5">
        <div className="my-auto flex w-full flex-1 shrink basis-0 flex-col self-stretch">
          <SelectSpan
            spanTypesCount={spanTypesCount ?? null}
            value={type}
            label="Type"
            onChange={handleTypeChange}
            isDisabled={selectSpanDisabled}
          />
        </div>
      </div>

      {type !== LineType.Secondary && (
        <>
          <div className="flex flex-1 shrink basis-0 flex-col">
            <div className="mb-1 text-xss font-bold text-secondary">Phase</div>
            <QuantitySelector
              value={span?.phase ?? 1}
              incrementDisabled={span?.line === span?.phase}
              leftIcon="minus"
              rightIcon="plus"
              onChange={handlePhaseChange}
            />
          </div>
          <div className="flex flex-1 shrink basis-0 flex-col">
            <div className="mb-1 text-xss font-bold text-secondary">Line</div>
            <QuantitySelector value={span?.line ?? 1} leftIcon="minus" rightIcon="plus" onChange={handleLineChange} />
          </div>
        </>
      )}
      {!hideSpanRemove && (
        <SVGIcon
          icon="cross"
          color="fill-black"
          className="absolute right-0 top-0.5 cursor-pointer"
          onClick={() => onRemove?.(span?.id ?? -1)}
        />
      )}
    </div>
  );
};

export default Span;
