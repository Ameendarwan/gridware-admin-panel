import { Table } from '@tanstack/react-table';
import { dataTableConfig, DataTableFilterOption } from '@app/components/DataTable/data-table.types';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { Button } from '@app/components/Button/Button';
import { cn } from '@app/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/Select/Select';
import DataTableAdvancedFacetedFilter from '@app/components/DataTable/advanced/data-table-advanced-faceted-filter';
import { Input } from '@app/components/Input/Input';
import { useDebounce } from '@app/hooks/useDebounce';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

interface DataTableFilterItemProps<TData> {
  table: Table<TData>;
  selectedOption: DataTableFilterOption<TData>;
  selectedOptions: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<DataTableFilterOption<TData>[]>>;
  defaultOpen: boolean;
}

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

  const filterValues = Array.from(selectedValues);
  const filterOperator = selectedOptions.find(item => item.value === column?.id)?.filterOperator;
  const operators =
    selectedOption.options.length > 0 ? dataTableConfig.selectableOperators : dataTableConfig.comparisonOperators;

  const [value, setValue] = useState(filterValues[0] ?? '');
  const debounceValue = useDebounce(value, 500);
  const [open, setOpen] = useState(defaultOpen);
  const [selectedOperator, setSelectedOperator] = useState(
    operators.find(c => c.value === filterOperator) ?? operators[0]
  );

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(location.search);

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [location.search]
  );

  // Update query string
  useEffect(() => {
    if (selectedOption.options.length > 0) {
      const newSearchParams = createQueryString({
        [String(selectedOption.value)]:
          filterValues.length > 0 ? `${filterValues.join('.')}~${selectedOperator?.value}` : null,
      });
      navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
    } else {
      const newSearchParams = createQueryString({
        [String(selectedOption.value)]: debounceValue.length > 0 ? `${debounceValue}~${selectedOperator?.value}` : null,
      });
      navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
    }
  }, [selectedOption, debounceValue, selectedOperator, navigate, location.pathname, filterValues, createQueryString]);

  // @ts-ignore
  // @ts-ignore
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-7 gap-0 truncate rounded-full',
            (selectedValues.size > 0 || value.length > 0) && 'bg-muted/50'
          )}>
          <span className="font-medium capitalize">{selectedOption.label}</span>
          {selectedOption.options.length > 0
            ? selectedValues.size > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {selectedValues.size > 2
                    ? `${selectedValues.size} selected`
                    : selectedOption.options
                        .filter(item => selectedValues.has(item.value))
                        .map(item => item.label)
                        .join(', ')}
                </span>
              )
            : value.length > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {value}
                </span>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1.5 p-2" align="start">
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

              const newSearchParams = createQueryString({
                [String(selectedOption.value)]: null,
              });
              navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
            }}>
            <i className="fa-solid fa-trash size-4"></i>
          </Button>
        </div>
        {selectedOption.options.length > 0 ? (
          column && (
            <DataTableAdvancedFacetedFilter
              key={String(selectedOption.value)}
              column={column}
              title={selectedOption.label}
              options={selectedOption.options}
              selectedValues={selectedValues}
              setSelectedOptions={setSelectedOptions}
            />
          )
        ) : (
          <Input
            placeholder="Type here..."
            className="h-8"
            value={value}
            onChange={event => setValue(event.target.value)}
            autoFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DataTableFilterItem;
