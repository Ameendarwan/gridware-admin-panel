import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';

import { Label } from '@app/components/Label/Label';
import { LineType } from '@app/pages/Deployments/components/MapBox/types';
import { SelectSpanProps } from '../../types';

const SelectSpan = ({ value, label, spanTypesCount, isDisabled, onChange }: SelectSpanProps) => {
  return (
    <div className="flex flex-col gap-1">
      <Label className="!text-xss font-bold text-secondary">{label}</Label>
      <Select value={value} onValueChange={value => onChange(value as LineType)} disabled={isDisabled}>
        <SelectTrigger className="h-6 w-[60px] bg-white" data-testid="line-type-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem disabled={!spanTypesCount?.primary} value={LineType.Primary}>
            P
          </SelectItem>
          <SelectItem disabled={!spanTypesCount?.transmission} value={LineType.Transmission}>
            T
          </SelectItem>
          <SelectItem disabled={!spanTypesCount?.secondary} value={LineType.Secondary}>
            S
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectSpan;
