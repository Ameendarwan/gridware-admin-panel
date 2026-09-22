import { ReactNode } from 'react';

export interface OptionItem {
  value: string;
  label: string;
}

export interface MultiSelectOptionProps {
  title?: string;
  sectionTitle?: string;
  optionsList?: (string | OptionItem)[];
  onSaveClick: (selectedValue: string) => void;
  onClose?: () => void;
  value?: string;
  value2?: string;
  hasTwoValues?: boolean;
  visibleValue?: string;
  dataTestId?: string;
  disabled?: boolean;
  disabledOptions?: boolean[];
  className?: string;
  hasError?: boolean;
  children?: ReactNode;
  placeholder?: string;
  tempValueParent?: string;
  triggerComponent?: ReactNode;
  deselect?: boolean;
  hideCloseButton?: boolean;
}
