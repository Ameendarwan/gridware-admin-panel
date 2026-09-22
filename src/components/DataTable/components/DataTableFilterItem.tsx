import { dataTableConfig, DataTableFilterOption } from '@app/components/DataTable/DataTable.types';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/Select/Select';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@app/components/Button/Button';
import DataTableAdvancedFacetedFilter from '@app/components/DataTable/components/DataTableAdvancedFacetedFilter';
import { Input } from '@app/components/Input/Input';
import { Table } from '@tanstack/react-table';
import { cn } from '@app/lib/utils';
import { createQueryString, ExtendedColumnDef } from '@app/components/DataTable/DataTable.utils';
import { useDebounce } from '@app/hooks/useDebounce';
import { useDeferredFilter } from '@app/components/DataTable/contexts/DeferredFilterContext';

interface DataTableFilterItemProps<TData> {
  table: Table<TData>;
  selectedOption: DataTableFilterOption<TData>;
  selectedOptions: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<DataTableFilterOption<TData>[]>>;
  defaultOpen: boolean;
}

// Default time to use when only a date is selected
const DEFAULT_TIME = '12:00';

const DataTableFilterItem = <TData,>({
  table,
  selectedOption,
  selectedOptions,
  setSelectedOptions,
  defaultOpen,
}: DataTableFilterItemProps<TData>) => {
  const navigate = useNavigate();
  const location = useLocation();

  const column = table.getColumn(selectedOption.value ? String(selectedOption.value) : '');
  const selectedValues = new Set(selectedOptions.find(item => item.value === column?.id)?.filterValues);
  const columnDef = column?.columnDef as ExtendedColumnDef<TData>;

  const filterValues = Array.from(selectedValues);
  const filterOperator = selectedOptions.find(item => item.value === column?.id)?.filterOperator;

  // Determine the appropriate operators based on the column type
  let operators;
  if (selectedOption.options.length > 0) {
    operators = dataTableConfig.selectableOperators.filter(op => op.value !== 'is_null' && op.value !== 'is_not_null');
  } else if (columnDef.type === 'boolean') {
    operators = dataTableConfig.booleanOperators;
  } else if (columnDef.type === 'date') {
    operators = dataTableConfig.dateOperators;
  } else if (columnDef.type === 'number') {
    operators = dataTableConfig.integerOperators;
  } else if (columnDef.type === 'array') {
    operators = dataTableConfig.arrayOperators;
  } else {
    operators = dataTableConfig.stringOperators;
  }

  // Parse date and time from value
  const parseDateTime = (value?: string) => {
    if (!value) return { date: '', time: DEFAULT_TIME };

    // Handle ISO format with timezone: 2025-05-02T16:57:00+05:00
    const parts = value.split('T');
    if (parts.length === 2) {
      const date = parts[0];
      // Extract just the time portion (HH:MM) from the time part (which includes seconds and timezone)
      const time = parts[1].split(/[-+:.]/)[0] + ':' + parts[1].split(/[-+:.]/)[1];
      return { date, time };
    }

    return { date: value, time: DEFAULT_TIME };
  };

  // State for single value filter
  const singleDateValue = parseDateTime(filterValues[0]);
  const [value, setValue] = useState(singleDateValue.date);
  const [timeValue, setTimeValue] = useState(singleDateValue.time);

  // State for date range filter
  const [dateRange, setDateRange] = useState(() => {
    const startDateTime = parseDateTime(filterValues[0]);
    const endDateTime = parseDateTime(filterValues[1]);

    return {
      startDate: startDateTime.date,
      endDate: endDateTime.date,
      startTime: startDateTime.time,
      endTime: endDateTime.time,
    };
  });

  // State for numeric range filter
  const [numericRange, setNumericRange] = useState({
    min: filterValues[0] || '',
    max: filterValues[1] || '',
  });

  const debounceValue = useDebounce(value, 500);
  const debounceTimeValue = useDebounce(timeValue, 500);
  const debounceStartDate = useDebounce(dateRange.startDate, 500);
  const debounceStartTime = useDebounce(dateRange.startTime, 500);
  const debounceEndDate = useDebounce(dateRange.endDate, 500);
  const debounceEndTime = useDebounce(dateRange.endTime, 500);
  const debounceMinValue = useDebounce(numericRange.min, 500);
  const debounceMaxValue = useDebounce(numericRange.max, 500);

  const [open, setOpen] = useState(defaultOpen);
  const [selectedOperator, setSelectedOperator] = useState(
    operators.find(c => c.value === filterOperator) ?? operators[0]
  );
  const isSingleFilter = [
    'is_null',
    'is_not_null',
    'is_true',
    'is_false',
    'is_array_empty',
    'is_array_not_empty',
  ].includes(selectedOperator?.value);
  const isRangeFilter = ['between', 'not_between'].includes(selectedOperator?.value);

  // Get deferred filter context
  const { deferFilters, updatePendingFilter } = useDeferredFilter();

  // Track if this filter was present in the initial URL (vs newly added)
  const [wasInInitialUrl] = useState(() => {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.has(String(selectedOption.value));
  });

  // Track if this is the initial mount for this specific filter
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Check if the filter is for date fields
  const isDateField = [
    'created at',
    'updated at',
    'installed at',
    'status changed at',
    'last date accessed attempted',
    'validation completed at',
  ].includes(selectedOption.label.toLowerCase());
  // Check if it's a numeric field
  const isNumericField = columnDef.type === 'number';

  // Format date with timezone for API
  const formatDateWithTimezone = (dateString: string, timeString: string = DEFAULT_TIME) => {
    if (!dateString) return '';

    // Parse date and time components
    const [hours, minutes] = timeString.split(':').map(Number);

    // Get timezone offset
    const date = new Date();
    const tzOffset = date.getTimezoneOffset() * -1; // Timezone offset in minutes
    const tzHours = Math.floor(Math.abs(tzOffset) / 60)
      .toString()
      .padStart(2, '0');
    const tzMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
    const tzSign = tzOffset >= 0 ? '+' : '-';

    // Format components directly to preserve user input exactly
    const formattedDate = `${dateString}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00${tzSign}${tzHours}:${tzMinutes}`;

    return formattedDate;
  };

  // Format displayed date
  const formatDisplayDate = (dateString: string, timeString: string = DEFAULT_TIME) => {
    if (!dateString) return '';
    // Display in localized 24-hour format
    return `${dateString} ${timeString}`;
  };

  // Helper function to build filter value based on type
  const buildFilterValue = () => {
    const operatorSuffix = `~${selectedOperator?.value}`;
    
    if (isSingleFilter) {
      return operatorSuffix;
    }
    
    if (isRangeFilter) {
      if (isDateField && debounceStartDate && debounceEndDate) {
        const start = formatDateWithTimezone(debounceStartDate, debounceStartTime);
        const end = formatDateWithTimezone(debounceEndDate, debounceEndTime);
        return `${start}|${end}${operatorSuffix}`;
      }
      if (isNumericField && debounceMinValue && debounceMaxValue) {
        return `${debounceMinValue}|${debounceMaxValue}${operatorSuffix}`;
      }
      return null;
    }
    
    if (!debounceValue) return null;
    
    const value = isDateField 
      ? formatDateWithTimezone(debounceValue, debounceTimeValue)
      : debounceValue;
    
    return `${value}${operatorSuffix}`;
  };

  // Helper function to handle navigation or deferred update
  const applyFilterUpdate = (value: string | null) => {
    const newSearchParams = createQueryString({
      [String(selectedOption.value)]: value,
    });

    if (deferFilters) {
      updatePendingFilter(String(selectedOption.value), value);
    } else {
      navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
    }
  };

  useEffect(() => {
    /**
     * Effect hook to update the URL search parameters whenever the selected filter option,
     * debounce value, or selected operator changes.
     * - If the selected option has nested options, it constructs a query string based on the selected filter values and operator.
     * - Otherwise, it sets the filter value using the debounce value or operator for simple filters.
     * - If deferFilters is enabled, updates pending params instead of navigating immediately
     */
    // Skip initial mount ONLY if this filter was already in the URL on page load
    if (isInitialMount) {
      setIsInitialMount(false);
      if (wasInInitialUrl) {
        return;
      }
    }

    // Handle filters with options (faceted filters)
    if (selectedOption.options.length > 0) {
      const value = filterValues.length > 0 
        ? `${filterValues.join('|')}~${selectedOperator?.value}` 
        : null;
      applyFilterUpdate(value);
      return;
    }

    // Handle filters without options (input-based filters)
    const filterValue = buildFilterValue();
    applyFilterUpdate(filterValue);
  }, [
    selectedOption,
    debounceValue,
    debounceTimeValue,
    selectedOperator,
    debounceStartDate,
    debounceStartTime,
    debounceEndDate,
    debounceEndTime,
    debounceMinValue,
    debounceMaxValue,
    deferFilters,
    filterValues,
    isInitialMount,
    wasInInitialUrl,
    applyFilterUpdate,
    buildFilterValue,
  ]);

  // Render the filter value display
  const renderFilterValue = () => {
    if (selectedOption.options.length > 0) {
      if (selectedValues.size > 0) {
        return (
          <span className="text-muted-foreground">
            <span className="text-foreground">: </span>
            {selectedValues.size > 2
              ? `${selectedValues.size} selected`
              : selectedOption.options
                  .filter(item => selectedValues.has(item.value))
                  .map(item => item.label)
                  .join(', ')}
          </span>
        );
      }
      return null;
    }

    if (isSingleFilter) {
      return (
        <span className="text-muted-foreground">
          <span className="text-foreground">: </span>
          {selectedOperator?.label}
        </span>
      );
    }

    if (isRangeFilter) {
      if (isDateField && dateRange.startDate && dateRange.endDate) {
        return (
          <span className="text-muted-foreground">
            <span className="text-foreground">: </span>
            {`${formatDisplayDate(dateRange.startDate, dateRange.startTime)} - ${formatDisplayDate(dateRange.endDate, dateRange.endTime)}`}
          </span>
        );
      }

      if (isNumericField && numericRange.min && numericRange.max) {
        return (
          <span className="text-muted-foreground">
            <span className="text-foreground">: </span>
            {`${numericRange.min} - ${numericRange.max}`}
          </span>
        );
      }

      return null;
    }

    if (value.length > 0) {
      return (
        <span className="text-muted-foreground">
          <span className="text-foreground">: </span>
          {isDateField ? formatDisplayDate(value, timeValue) : value}
        </span>
      );
    }

    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-7 gap-0 truncate rounded-full',
            (selectedValues.size > 0 ||
              value.length > 0 ||
              (dateRange.startDate && dateRange.endDate) ||
              (numericRange.min && numericRange.max)) &&
              'bg-muted/50'
          )}>
          <span className="font-medium capitalize">{selectedOption.label}</span>
          {renderFilterValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] space-y-1.5 p-2" align="start">
        <div className="flex items-center space-x-1 pl-1 pr-0.5">
          <div className="flex flex-1 items-center space-x-1">
            <div className="text-xs capitalize text-muted-foreground">{selectedOption.label}</div>
            <Select
              value={selectedOperator?.value}
              onValueChange={value => {
                const selected = operators.find(c => c.value === value);
                if (selected) {
                  setSelectedOperator(selected);
                }
              }}>
              <SelectTrigger className="h-auto w-fit truncate border-none px-2 py-0.5 text-xs hover:bg-muted/50">
                <SelectValue placeholder={selectedOperator?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {operators.map((item: any) => (
                    <SelectItem key={item.value} value={item.value} className="py-1">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label="Remove filter"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => {
              setSelectedOptions(prev => prev.filter(item => item.value !== selectedOption.value));

              // Always remove the filter from URL immediately, regardless of deferred mode
              const newSearchParams = createQueryString({
                [String(selectedOption.value)]: null,
              });
              navigate(`${location.pathname}?${newSearchParams}`, { replace: true });

              if (deferFilters) {
                // In deferred mode, also update pending params to reflect this removal
                updatePendingFilter(String(selectedOption.value), null);
              }
            }}>
            <i className="fa-solid fa-trash size-4"></i>
          </Button>
        </div>
        {(() => {
          if (selectedOption.options.length > 0) {
            return (
              column && (
                <DataTableAdvancedFacetedFilter
                  key={String(selectedOption.value)}
                  column={column}
                  title={selectedOption.label}
                  options={selectedOption.options}
                  selectedValues={selectedValues}
                  setSelectedOptions={setSelectedOptions}
                  singleSelect={columnDef?.singleSelect}
                />
              )
            );
          }

          if (isSingleFilter) {
            return null;
          }

          if (isRangeFilter) {
            if (isDateField) {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-[40px] text-xs">From:</span>
                    <Input
                      type="date"
                      className="h-8"
                      value={dateRange.startDate}
                      onChange={event => setDateRange(prev => ({ ...prev, startDate: event.target.value }))}
                      autoFocus
                    />
                    <Input
                      type="time"
                      className="h-8 w-[120px]"
                      value={dateRange.startTime}
                      onChange={event => setDateRange(prev => ({ ...prev, startTime: event.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[40px] text-xs">To:</span>
                    <Input
                      type="date"
                      className="h-8"
                      value={dateRange.endDate}
                      onChange={event => setDateRange(prev => ({ ...prev, endDate: event.target.value }))}
                    />
                    <Input
                      type="time"
                      className="h-8 w-[120px]"
                      value={dateRange.endTime}
                      onChange={event => setDateRange(prev => ({ ...prev, endTime: event.target.value }))}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-[40px] text-xs">Min:</span>
                  <Input
                    type={isNumericField ? 'number' : 'text'}
                    className="h-8"
                    value={numericRange.min}
                    onChange={event => setNumericRange(prev => ({ ...prev, min: event.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[40px] text-xs">Max:</span>
                  <Input
                    type={isNumericField ? 'number' : 'text'}
                    className="h-8"
                    value={numericRange.max}
                    onChange={event => setNumericRange(prev => ({ ...prev, max: event.target.value }))}
                  />
                </div>
              </div>
            );
          }

          if (isDateField) {
            return (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="h-8"
                  value={value}
                  onChange={event => setValue(event.target.value)}
                  autoFocus
                />
                <Input
                  type="time"
                  className="h-8 w-[120px]"
                  value={timeValue}
                  onChange={event => setTimeValue(event.target.value)}
                />
              </div>
            );
          }

          return (
            <Input
              placeholder="Type here..."
              className="h-8"
              type={isNumericField ? 'number' : 'text'}
              value={value}
              onChange={event => setValue(event.target.value)}
              autoFocus
            />
          );
        })()}
      </PopoverContent>
    </Popover>
  );
};

export default DataTableFilterItem;
