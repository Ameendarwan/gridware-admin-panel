import { Table } from '@tanstack/react-table';
import { DataTableConfig, dataTableConfig, DataTableFilterOption } from '@app/components/DataTable/data-table.types';
import { useCallback, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { Button } from '@app/components/Button/Button';
import { Separator } from '@app/components/Separator/Separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/Select/Select';
import DataTableFacetedFilter from '@app/components/DataTable/data-table-faceted-filter';
import { Input } from '@app/components/Input/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/components/DropdownMenu/DropdownMenu';
import { useDebounce } from '@app/hooks/useDebounce';
import { useLocation, useNavigate } from 'react-router-dom';

interface DataTableMultiFilterProps<TData> {
  table: Table<TData>;
  allOptions: DataTableFilterOption<TData>[];
  options: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<DataTableFilterOption<TData>[]>>;
  defaultOpen: boolean;
}

const DataTableMultiFilter = <TData,>({
  table,
  allOptions,
  options,
  setSelectedOptions,
  defaultOpen,
}: DataTableMultiFilterProps<TData>) => {
  const [open, setOpen] = useState(defaultOpen);
  const [operator, setOperator] = useState(dataTableConfig.logicalOperators[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 truncate rounded-full">
          <i className="fa-solid fa-align-center mr-2 size-3" />
          {options.length} rule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 text-xs" align="start">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              key={option.id ?? i}
              i={i}
              option={option}
              table={table}
              allOptions={allOptions}
              options={options}
              setSelectedOptions={setSelectedOptions}
              operator={operator}
              setOperator={setOperator}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label="Delete filter"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setSelectedOptions(prev => prev.filter(item => !item.isMulti));
            }}>
            Delete filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface MultiFilterRowProps<TData> {
  i: number;
  table: Table<TData>;
  allOptions: DataTableFilterOption<TData>[];
  option: DataTableFilterOption<TData>;
  options: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<DataTableFilterOption<TData>[]>>;
  operator?: DataTableConfig['logicalOperators'][number];
  setOperator: any;
}

const MultiFilterRow = <TData,>({
  i,
  table,
  option,
  allOptions,
  options,
  setSelectedOptions,
  operator,
  setOperator,
}: MultiFilterRowProps<TData>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState('');
  const debounceValue = useDebounce(value, 500);
  const [selectedOption, setSelectedOption] = useState<DataTableFilterOption<TData> | undefined>(options[0]);
  const filterVarieties = selectedOption?.options.length
    ? ['is', 'is not']
    : ['contains', 'does not contain', 'is', 'is not'];
  const [filterVariety, setFilterVariety] = useState(filterVarieties[0]);

  // Update filter variety
  useEffect(() => {
    if (selectedOption?.options.length) {
      setFilterVariety('is');
    }
  }, [selectedOption?.options.length]);

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

  // Update query string based on debounceValue
  useEffect(() => {
    const newSearchParams = createQueryString({
      [selectedOption?.value ?? '']: debounceValue.length > 0 ? `${debounceValue}.${filterVariety}` : null,
    });
    navigate(`${location.pathname}?${newSearchParams}`, { replace: true, state: { scroll: false } });
  }, [debounceValue, filterVariety, selectedOption?.value, createQueryString, navigate, location.pathname]);

  // Update operator query string
  useEffect(() => {
    if (operator?.value) {
      const newSearchParams = createQueryString({ operator: operator.value });
      navigate(`${location.pathname}?${newSearchParams}`, { replace: true, state: { scroll: false } });
    }
  }, [operator?.value, createQueryString, navigate, location.pathname]);

  return (
    <div className="flex items-center space-x-2">
      {i === 0 ? (
        <div>Where</div>
      ) : i === 1 ? (
        <Select
          value={operator?.value}
          onValueChange={value => setOperator(dataTableConfig.logicalOperators.find(o => o.value === value))}>
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTableConfig.logicalOperators.map(operator => (
                <SelectItem key={operator.value} value={operator.value} className="text-xs">
                  {operator.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <div key={operator?.value}>{operator?.label}</div>
      )}
      <Select
        value={String(selectedOption?.value)}
        onValueChange={value => {
          const newSelectedOption = allOptions.find(option => option.value === value);
          setSelectedOption(newSelectedOption);
          setSelectedOptions(prev =>
            prev.map(item => (item.id === option.id ? { ...item, value: value as keyof TData } : item))
          );
        }}>
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map(option => (
              <SelectItem key={String(option.value)} value={String(option.value)} className="text-xs capitalize">
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select value={filterVariety} onValueChange={setFilterVariety}>
        <SelectTrigger className="h-8 w-full truncate px-2 py-0.5 hover:bg-muted/50">
          <SelectValue placeholder={filterVarieties[0]} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filterVarieties.map(variety => (
              <SelectItem key={variety} value={variety}>
                {variety}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedOption?.options.length ? (
        table.getColumn(selectedOption.value ? String(option.value) : '') && (
          <DataTableFacetedFilter
            key={selectedOption.id}
            column={table.getColumn(selectedOption.value ? String(selectedOption.value) : '')}
            title={selectedOption.label}
            options={selectedOption.options}
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <i className="fa-solid fa-ellipsis size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSelectedOptions(prev => prev.filter(item => item.id !== option.id))}>
            <i className="fa-solid fa-trash mr-2 size-4" />
            Remove
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!selectedOption) return;

              setSelectedOptions(prev => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  label: selectedOption.label,
                  value: selectedOption.value,
                  options: selectedOption.options ?? [],
                  isMulti: true,
                },
              ]);
            }}>
            <i className="fa-regular fa-copy mr-2 size-4" />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { MultiFilterRow, DataTableMultiFilter };
