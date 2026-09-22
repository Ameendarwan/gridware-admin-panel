import { Column } from '@tanstack/react-table';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { Button } from '@app/components/Button/Button';
import { Separator } from '@app/components/Separator/Separator';
import { Badge } from '@app/components/Badge/Badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@app/components/Command/Command';
import { Option } from '@app/components/DataTable/DataTable.types';
import { useDeferredFilter } from '@app/components/DataTable/contexts/DeferredFilterContext';
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createQueryString } from '@app/components/DataTable/DataTable.utils';
import { renderFilterIcon, getFilterIconContainerClasses } from './filterUtils';

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
  singleSelect?: boolean;
}

const DataTableFacetedFilter = <TData, TValue>({
  column,
  title,
  options,
  singleSelect = false,
}: DataTableFacetedFilterProps<TData, TValue>) => {
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const { deferFilters, updatePendingFilter } = useDeferredFilter();
  const navigate = useNavigate();
  const location = useLocation();

  // Track if user has interacted with this filter to avoid triggering on page load
  const hasInteractedRef = useRef(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <i className="fa-solid fa-circle-plus mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.has(option.value))
                    .map(option => (
                      <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.has(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      // Mark that user has interacted with this filter
                      hasInteractedRef.current = true;

                      let newFilterValues: string[];

                      if (singleSelect) {
                        // For single select, clear all and set only this value
                        newFilterValues = isSelected ? [] : [option.value];
                        column?.setFilterValue(newFilterValues.length ? newFilterValues : undefined);
                      } else {
                        // For multi-select, toggle the value
                        if (isSelected) {
                          selectedValues.delete(option.value);
                        } else {
                          selectedValues.add(option.value);
                        }
                        newFilterValues = Array.from(selectedValues);
                        column?.setFilterValue(newFilterValues.length ? newFilterValues : undefined);
                      }

                      // Update pending params in deferred mode (only if user interacted)
                      if (deferFilters && hasInteractedRef.current && column?.id) {
                        const filterValue = newFilterValues.length > 0 ? `${newFilterValues.join('|')}~in` : null;
                        updatePendingFilter(column.id, filterValue);
                      }
                    }}>
                    <div className={getFilterIconContainerClasses(singleSelect, isSelected)}>
                      {renderFilterIcon(singleSelect, isSelected)}
                    </div>
                    {option.icon && <option.icon className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />}
                    <span>{option.label}</span>
                    {option.withCount && column?.getFacetedUniqueValues()?.get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {column?.getFacetedUniqueValues().get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      // Mark that user has interacted with this filter
                      hasInteractedRef.current = true;

                      // Clear the column filter
                      column?.setFilterValue(undefined);

                      // Always remove the filter from URL immediately
                      if (column?.id) {
                        const newSearchParams = createQueryString({
                          [column.id]: null,
                        });
                        navigate(`${location.pathname}?${newSearchParams}`, { replace: true });

                        if (deferFilters) {
                          // In deferred mode, also update pending params to reflect this removal
                          updatePendingFilter(column.id, null);
                        }
                      }
                    }}
                    className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
export default DataTableFacetedFilter;
