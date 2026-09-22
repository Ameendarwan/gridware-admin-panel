import { LineType, SpanT } from '../../types';

import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';

export interface SpanProps {
  span: SpanT;
}

export interface QuantitySelectorProps {
  value: number;
  leftIcon: IconNames;
  rightIcon: IconNames;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
  incrementDisabled?: boolean;
  decrementDisabled?: boolean;
}

export interface SelectSpanProps {
  value: LineType;
  options?: string[];
  label: string;
  spanTypesCount: { primary: boolean; transmission: boolean; secondary: boolean } | null;
  onChange: (value: LineType) => void;
  isDisabled?: boolean;
}
