import { ChevronDown, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { API } from '@app/lib/api-config';
import { Input } from '@app/components/Input/Input';
import { FixedSizeList as List } from 'react-window';

export interface Option {
  value: string;
  label: string;
  [key: string]: any;
}

export interface SearchableInfiniteSelectProps {
  fetchUrl: string;
  pageSize?: number;
  placeholder?: string;
  value?: any;
  onValueChange?: (values: any) => void;
  disabled?: boolean;
  responseMapper: (item: any) => Option;
  renderOptionLabel?: (option: Option) => React.ReactNode;
  multiSelect?: boolean;
  dataTestId?: string;
}

export const SearchableInfiniteSelect: React.FC<SearchableInfiniteSelectProps> = ({
  fetchUrl,
  pageSize = 10,
  placeholder = 'Select an option',
  value,
  onValueChange,
  disabled = false,
  responseMapper,
  renderOptionLabel,
  multiSelect = false,
  dataTestId,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState(value);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<any>(null);

  const fetchOptions = useCallback(
    async (reset = false) => {
      if (loading || (!hasMore && !reset)) return;

      setLoading(true);
      try {
        const response = await API.get(fetchUrl, {
          params: {
            skip: reset ? 0 : skip,
            limit: pageSize,
            ...(searchTerm && { where: searchTerm }),
            ...(selectedValue && {
              where: JSON.stringify({
                and: [
                  {
                    id: multiSelect
                      ? { in: selectedValue }
                      : { eq: Array.isArray(selectedValue) ? selectedValue[0] : selectedValue },
                  },
                ],
              }),
            }),
          },
        });

        const newOptions = response.data.data.records.map(responseMapper);

        setOptions(prevOptions => (reset ? newOptions : [...prevOptions, ...newOptions]));
        setSkip(reset ? pageSize : skip + pageSize);
        setHasMore(newOptions.length === pageSize);

        // Ensure selected options are properly set the first time
        setSelectedOptions(prevSelectedOptions => {
          let newSelected = newOptions.filter((newOpt: Option) =>
            selectedValues.some(val => newOpt.value.toString() === val.toString())
          );
          // If this is the first fetch (selectedValue exists), set selected options directly
          if (reset && selectedValue) {
            newSelected = newOptions;
          }
          const updatedOptions = [...prevSelectedOptions, ...newSelected].filter(
            (opt, index, self) => self.findIndex(o => o.value === opt.value) === index
          );
          setSelectedValues(updatedOptions.map(opt => opt.value));
          return updatedOptions;
        });

        setSelectedValue('');
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    },
    [fetchUrl, skip, pageSize, searchTerm, loading, hasMore, responseMapper]
  );

  // Fetch initial options
  useEffect(() => {
    if (selectedValue) {
      fetchOptions(true);
    }
  }, [selectedValue]);

  // Fetch options when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchOptions(true);
    }
  }, [isDropdownOpen]);

  // Refetch when search term changes
  useEffect(() => {
    if (!searchTerm) return;
    const handler = setTimeout(() => {
      fetchOptions(true);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle removing an option
  const handleRemoveOption = (optionToRemove: Option) => {
    const newSelectedValues = selectedValues.filter(val => val !== optionToRemove.value);
    const newSelectedOptions = selectedOptions.filter(opt => opt.value !== optionToRemove.value);

    setSelectedValues(newSelectedValues);
    setSelectedOptions(newSelectedOptions);
    onValueChange?.(newSelectedValues);
  };

  // Handle selecting an option
  const handleSelectOption = (option: Option) => {
    if (multiSelect) {
      // Toggle selection for multiselect
      const isSelected = selectedValues?.includes(option.value);

      if (isSelected) {
        // Remove if already selected
        handleRemoveOption(option);
      } else {
        // Add if not selected
        const newSelectedValues = [...selectedValues, option.value];
        const newSelectedOptions = [...selectedOptions, option];

        setSelectedValues(newSelectedValues);
        setSelectedOptions(newSelectedOptions);
        onValueChange?.(newSelectedValues);
      }
    } else {
      // Single select behavior
      setSelectedValues([option.value]);
      setSelectedOptions([option]);
      onValueChange?.([option.value]);
      setIsDropdownOpen(false);
    }
  };

  const OptionRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = options[index];
    const isSelected = selectedValues?.includes(option.value);

    return (
      <div
        style={style}
        data-testid={`${dataTestId}-option-${option.value}`}
        role="option"
        tabIndex={0}
        aria-selected={isSelected}
        onClick={() => handleSelectOption(option)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectOption(option);
          }
        }}
        className={`cursor-pointer p-2 hover:bg-gray-100 ${isSelected ? 'bg-primary/10 font-semibold' : ''}`}>
        <div className="flex items-center gap-x-2">
          {renderOptionLabel ? renderOptionLabel(option) : option.label}
          {isSelected && (
            <span className="text-primary" data-testid={`${dataTestId}-option-selected-${option.value}`}>
              ✓
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render selected values
  const renderSelectedValues = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-sm text-gray-500">{placeholder}</span>;
    }

    if (!multiSelect) {
      return renderOptionLabel ? renderOptionLabel(selectedOptions[0]) : selectedOptions[0].label;
    }

    return (
      <div className="flex flex-wrap items-center gap-1">
        {selectedOptions.map(option => (
          <div key={option.value} className="flex items-center rounded bg-primary/10 px-2 py-1 text-sm">
            {renderOptionLabel ? renderOptionLabel(option) : option.label}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${renderOptionLabel ? renderOptionLabel(option) : option.label}`}
              onClick={e => {
                e.stopPropagation();
                handleRemoveOption(option);
              }}
              className="ml-2 cursor-pointer hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef} data-testid={`${dataTestId}-container`}>
      <button
        type="button"
        data-testid={`${dataTestId}-trigger`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`flex w-full cursor-pointer items-center justify-between rounded border p-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}>
        <span data-testid={`${dataTestId}-value`}>{renderSelectedValues()}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      {isDropdownOpen && (
        <div
          data-testid={`${dataTestId}-dropdown`}
          role="listbox"
          aria-multiselectable={multiSelect}
          className="absolute z-50 mt-1 w-full rounded border bg-white shadow-lg">
          <div className="p-2">
            <Input
              data-testid={`${dataTestId}-search-input`}
              ref={inputRef}
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={disabled}
              className="w-full"
            />
          </div>
          {options.length > 0 ? (
            <List
              ref={listRef}
              height={250}
              itemCount={options.length}
              itemSize={40}
              width="100%"
              onItemsRendered={({ visibleStopIndex }) => {
                if (visibleStopIndex === options.length - 1 && hasMore && !loading) {
                  fetchOptions();
                }
              }}>
              {OptionRow}
            </List>
          ) : (
            <div data-testid={`${dataTestId}-no-options`} className="p-2 text-center text-sm text-gray-500">
              {loading ? 'Loading...' : 'No options available'}
            </div>
          )}
          {loading && (
            <div data-testid={`${dataTestId}-loading`} className="flex items-center justify-center p-2">
              <Loader2 className="mr-2 animate-spin" size={16} />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableInfiniteSelect;
