export interface MultiSelectOptionProps {
  title: string;
  optionsList?: string[];
  saveButtonOnClick: (values: string[], isSingleItemRemoved: boolean) => void;
  values?: string[];
  otherNote?: string;
  handleValidation?: (values: string[]) => {
    isValid: boolean;
    errors: string[];
  };
  onOtherSelect?: (value: string) => void;
  dataTestId?: string;
  disabled?: boolean;
}
