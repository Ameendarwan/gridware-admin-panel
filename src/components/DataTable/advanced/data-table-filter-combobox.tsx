'use client';

import * as React from 'react';
import { DataTableFilterOption } from '@app/components/DataTable/data-table.types';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { Button } from '@app/components/Button/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@app/components/Command/Command';

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
  const [selectedOption, setSelectedOption] = React.useState<DataTableFilterOption<TData>>(
    options[0] ?? ({} as DataTableFilterOption<TData>)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm" role="combobox" className="bg-[#3B3C4F] capitalize text-white">
            <i className="fa-solid fa-filter size-4 shrink-0" />
            Filter
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="end">
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
                    className="capitalize"
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
                      <i className="fa-solid fa-chevron-down mr-2 size-4" />
                    ) : (
                      <i className="fa-solid fa-t mr-2 size-4" />
                    )}
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSelectedOptions([
                    ...selectedOptions,
                    {
                      id: crypto.randomUUID(),
                      label: selectedOption?.label ?? '',
                      value: selectedOption?.value ?? '',
                      options: selectedOption?.options ?? [],
                      isMulti: true,
                    },
                  ]);
                  onSelect();
                }}>
                <i className="fa-solid fa-plus mr-2 size-4" />
                Advanced filter
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DataTableFilterCombobox;
