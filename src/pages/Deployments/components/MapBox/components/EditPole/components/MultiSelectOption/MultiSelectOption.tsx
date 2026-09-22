import { FC, useEffect, useRef, useState } from 'react';

import { Checkbox } from '@app/components/Checkbox/Checkbox';
import { Label } from '@radix-ui/react-dropdown-menu';
import OptionsListSection from '../../../OptionsListSection';
import { Textarea } from '@app/components/TextArea/Textarea';
import { isEqual } from 'lodash';
import { MultiSelectOptionProps } from './types';
import SVGIcon from '@app/components/SVGIcon';

const SPECIAL_OPTIONS = new Set(['no general equipment', 'none']);

const MultiSelectOption: FC<MultiSelectOptionProps> = ({
  title,
  values,
  saveButtonOnClick,
  handleValidation,
  onOtherSelect,
  optionsList,
  otherNote,
  dataTestId,
  disabled,
}) => {
  const ref = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [tempValues, setTempValues] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    /**
     * Effect hook that updates `tempValues` whenever the `values` prop changes.
     * - If `values` is provided (non-empty array), it updates `tempValues` with a copy of `values`.
     */
    if (values?.length) setTempValues([...values]);
  }, [values]);

  const handleShowOptions = () => {
    /**
     * Toggles the visibility of the options.
     * - If options are currently visible, it hides them; otherwise, it shows them.
     */
    if (!showOptions && values?.length) setTempValues([...values]);
    setShowOptions(prevState => !prevState);
  };

  const handleSaveClick = () => {
    /**
     * Handles the save button click.
     * - Hides the options.
     * - Calls `onOtherSelect` callback if a note exists.
     * - Passes the `tempValues` array to the `saveButtonOnClick` function.
     */
    setShowOptions(false);

    if (note) onOtherSelect?.(note);

    if (isEqual(tempValues, values)) return;

    if (tempValues?.length) {
      const result = handleValidation?.(tempValues);
      if (handleValidation && !result?.isValid) {
        return;
      }
    }
    saveButtonOnClick(tempValues, false);
  };

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <button
        type="button"
        aria-expanded={showOptions}
        aria-label={`${title} - Select options`}
        className="flex w-full cursor-pointer flex-col gap-1.5 border-0 bg-transparent p-0 text-left"
        onClick={handleShowOptions}
        data-testid={dataTestId}>
        <Label className="!text-xss font-bold text-grayShades-shade7">{title}</Label>
        <div
          className={`flex min-h-[32px] flex-row items-center justify-between gap-1 rounded-lg px-1 py-1 ${showOptions ? 'bg-blueShades-shade1' : 'bg-grayShades-shade1'}`}>
          <div className="flex flex-col">
            {values?.map(value => (
              <div
                key={value}
                className={`flex min-h-[24px] items-center justify-between rounded-[6px] px-2 ${disabled ? 'pointer-events-none cursor-not-allowed' : ''}`}>
                <span className="overflow-hidden break-words text-xs font-bold text-primary">
                  {value === 'OTHER' ? `${value} ( ${otherNote} )` : value}
                </span>
              </div>
            ))}
          </div>
          <SVGIcon icon="chevron" height={10} width={9} className="-rotate-90" />
        </div>
      </button>

      {showOptions && (
        <OptionsListSection
          title={title}
          onSaveClick={handleSaveClick}
          buttonTitle={isEqual(tempValues, values) ? 'Close' : 'Save & Close'}
          buttonClass={isEqual(tempValues, values) ? '!bg-label hover:!bg-label' : ''}
          isValueChanged={!isEqual(tempValues, values)}
          setShowOptions={setShowOptions}>
          <div className="flex flex-col gap-6 py-3">
            {optionsList?.map((option: string) => (
              <div key={option} className="flex flex-col gap-3">
                <div className="flex flex-row items-center gap-3">
                  <Checkbox
                    data-testid={`${dataTestId}-${option}`}
                    checked={tempValues.includes(option)}
                    disabled={
                      tempValues.some(selected => SPECIAL_OPTIONS.has(selected?.toLowerCase())) &&
                      !SPECIAL_OPTIONS.has(option?.toLowerCase())
                    }
                    onCheckedChange={() => {
                      let updatedValue: string[];

                      if (SPECIAL_OPTIONS.has(option?.toLowerCase())) {
                        // If selecting "No General Equipment" or "None", uncheck everything else
                        updatedValue = tempValues.includes(option) ? [] : [option];
                      } else {
                        // If selecting a regular option, uncheck special options
                        updatedValue = tempValues.includes(option)
                          ? tempValues.filter(item => item !== option)
                          : [...tempValues.filter(item => !SPECIAL_OPTIONS.has(item?.toLowerCase())), option];
                      }

                      setTempValues(updatedValue);
                    }}
                  />
                  <Label className="text-xs font-bold text-blackShades-shade1">{option}</Label>
                </div>
                {option === 'OTHER' && tempValues?.includes('OTHER') && (
                  <Textarea
                    value={note}
                    onChange={ev => setNote(ev.target.value)}
                    className="min-h-[48px] overflow-hidden break-words !text-xs"
                    maxLength={200}
                  />
                )}
              </div>
            ))}
          </div>
        </OptionsListSection>
      )}
    </div>
  );
};

export default MultiSelectOption;
