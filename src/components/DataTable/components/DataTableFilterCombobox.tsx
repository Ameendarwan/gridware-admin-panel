'use client';

import * as React from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@app/components/Command/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';

import { Button } from '@app/components/Button/Button';
import { DataTableFilterOption } from '@app/components/DataTable/DataTable.types';

interface DataTableFilterComboboxProps<TData> {
  options: DataTableFilterOption<TData>[];
  selectedOptions: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<DataTableFilterOption<TData>[]>>;
  onSelect: () => void;
  children?: React.ReactNode;
}

const DataTableFilterCombobox = <TData,>({
  options,
  selectedOptions,
  setSelectedOptions,
  onSelect,
  children,
}: DataTableFilterComboboxProps<TData>) => {
  const [value, setValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [, setSelectedOption] = React.useState<DataTableFilterOption<TData>>(
    options[0] ?? ({} as DataTableFilterOption<TData>)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm" role="combobox" className="bg-[#3B3C4F] capitalize text-white">
            <i className="fa-solid fa-filter flex size-4 shrink-0 items-center" aria-hidden="true" />
            <span>Filter</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[15rem] p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter by..." />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter(option => !selectedOptions.some(selectedOption => selectedOption.value === option.value))
                .map(option => (
                  <CommandItem
                    key={String(option.value)}
                    value={String(option.value)}
                    onSelect={currentValue => {
                      setValue(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      setSelectedOption(option);
                      setSelectedOptions(prev => {
                        return [...prev, { ...option }];
                      });
                      onSelect();
                    }}>
                    {option.options.length > 0 ? (
                      <i className="fa-solid fa-chevron-down mr-2 size-4" aria-hidden="true" />
                    ) : (
                      <i className="fa-solid fa-notes-medical mr-2 size-4" aria-hidden="true" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DataTableFilterCombobox;
