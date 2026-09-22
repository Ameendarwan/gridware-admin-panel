import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Label } from '@radix-ui/react-dropdown-menu';
import OptionsListSection from '../../../OptionsListSection';
import TriggerItem from '../TriggerItem';
import { X } from 'lucide-react';
import { setIsMovingPole } from '@app/store/slices/polesSlice';
import { useDispatch } from 'react-redux';
import { MultiSelectOptionProps, OptionItem } from './types';

const SingleSelectOption: FC<MultiSelectOptionProps> = ({
  title,
  sectionTitle,
  value,
  value2,
  visibleValue,
  onSaveClick,
  onClose,
  optionsList,
  dataTestId,
  disabled,
  hasTwoValues,
  className,
  children,
  triggerComponent,
  hasError,
  placeholder,
  disabledOptions,
  deselect,
  hideCloseButton,
  tempValueParent = '',
}) => {
  const ref = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [tempValue, setTempValue] = useState<string>('');
  const dispatch = useDispatch();

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleSaveClick = () => {
    setShowOptions(false);
    onSaveClick(tempValue ?? '');
  };

  const handleSelectOption = (optionValue: string) => {
    setTempValue(optionValue);
  };

  const handleClose = () => {
    dispatch(setIsMovingPole(false));
    setTempValue(value ?? '');
    onClose?.();
  };

  const isValueChanged = useMemo(
    () =>
      (value !== tempValue && !hasTwoValues && !hideCloseButton) ||
      (Boolean(tempValueParent) && value !== tempValueParent),
    [value, tempValue, tempValueParent, hideCloseButton]
  );

  const normalizedOptions: OptionItem[] = useMemo(() => {
    if (!optionsList) return [];
    return optionsList.map(option => (typeof option === 'string' ? { value: option, label: option } : option));
  }, [optionsList]);

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`} ref={ref}>
      <div className="flex w-full cursor-pointer flex-col gap-1.5">
        {title && <Label className="!text-xss font-bold text-grayShades-shade7">{title}</Label>}
        <div className="flex flex-col gap-2">
          {triggerComponent || (
            <TriggerItem
              isDisabled={disabled}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
              selectedValue={visibleValue ?? value ?? ''}
              selectedValue2={value2 || ''}
              hasError={hasError || false}
              hasTwoValues={hasTwoValues || false}
              placeholder={placeholder || ''}
            />
          )}
        </div>
      </div>
      {showOptions && (
        <OptionsListSection
          title={sectionTitle ?? title ?? ''}
          onSaveClick={handleSaveClick}
          buttonTitle={isValueChanged || value === 'WEATHER STATION' ? 'Save & Close' : 'Close'}
          buttonClass={isValueChanged ? undefined : '!bg-primary hover:!bg-label'}
          disabled={disabled}
          isValueChanged={isValueChanged}
          setShowOptions={setShowOptions}
          handleClose={handleClose}>
          {children ||
            normalizedOptions.map((option, index) => (
              <div key={option.value} className="flex flex-col gap-1">
                <button
                  type="button"
                  className={`flex ${
                    disabledOptions?.[index] ? 'cursor-not-allowed' : 'cursor-pointer'
                  } min-h-[40px] flex-row items-center gap-3 rounded-md border p-2 transition-all ${
                    tempValue === option.value
                      ? 'border-transparent bg-secondary text-white'
                      : 'border-muted bg-white text-primary'
                  }`}
                  data-testid={`${dataTestId}-${option.value}`}
                  disabled={disabledOptions?.[index]}
                  onClick={() => !disabledOptions?.[index] && handleSelectOption(option.value)}>
                  <Label className="text-xs font-bold capitalize">{option.label}</Label>
                  {deselect && tempValue === option.value && (
                    <button
                      className="ml-auto text-white"
                      onClick={e => {
                        e.stopPropagation();
                        setTempValue('');
                      }}>
                      <X className="h-4 w-4 cursor-pointer" />
                    </button>
                  )}
                </button>
              </div>
            ))}
        </OptionsListSection>
      )}
    </div>
  );
};

export default SingleSelectOption;
