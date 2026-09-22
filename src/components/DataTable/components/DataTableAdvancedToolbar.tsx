'use client';

import { DataTableFilterField, DataTableFilterOption } from '@app/components/DataTable/DataTable.types';
import { createQueryString, ExtendedColumnDef } from '@app/components/DataTable/DataTable.utils';
import { HTMLAttributes, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';

import { Button } from '@app/components/Button/Button';
import DataTableFacetedFilter from '@app/components/DataTable/components/DataTableFacetedFilter';
import DataTableFilterCombobox from '@app/components/DataTable/components/DataTableFilterCombobox';
import DataTableFilterItem from '@app/components/DataTable/components/DataTableFilterItem';
import { DataTableMultiFilter } from './DataTableMultiFilter';
import DataTableLogicalOperator, {
  LogicalOperator,
} from '@app/components/DataTable/components/DataTableLogicalOperator';
import DataTableToolbarActions from '@app/components/DataTable/components/DataTableToolbarActions';
import DataTableViewOptions from '@app/components/DataTable/components/DataTableViewOptions';
import { Input } from '@app/components/Input/Input';
import type { Table } from '@tanstack/react-table';
import { cn } from '@app/lib/utils';
import { useDebounce } from '@app/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { useDeferredFilter } from '@app/components/DataTable/contexts/DeferredFilterContext';

interface DataTableAdvancedToolbarProps<TData> extends HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  url?: string;
}

const DataTableAdvancedToolbar = <TData,>({
  table,
  children,
  className,
  url,
  ...props
}: DataTableAdvancedToolbarProps<TData>) => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(globalThis.location.search));
  const [filterFields, setFilterFields] = useState<DataTableFilterField<TData>[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 700);
  const navigate = useNavigate();

  // Get deferred filter context
  const { deferFilters, hasPendingChanges, applyFilters } = useDeferredFilter();

  // Get logical operator from URL or use default
  const initialLogicalOperator = (searchParams.get('logical_operator') as LogicalOperator) || 'and';
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>(initialLogicalOperator);

  // Initialize selectedOptions state
  const [selectedOptions, setSelectedOptions] = useState<DataTableFilterOption<TData>[]>([]);
  const [openFilterBuilder, setOpenFilterBuilder] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    /**
     * Effect hook to update the filter fields for the data table.
     * - It iterates through all columns of the table and extracts relevant fields
     *   (accessorKey and label) to populate the filter options.
     */
    const fields: SetStateAction<DataTableFilterField<any>[]> = [];
    const columns = table.getAllColumns();
    for (const column of columns ?? []) {
      const columnDef = column.columnDef as ExtendedColumnDef<any>;
      if (columnDef.accessorKey && !columnDef.excludeFilter) {
        fields.push({
          label: columnDef.label ?? columnDef.accessorKey,
          value: columnDef.accessorKey,
          options: columnDef.options,
          excludeQuickFilter: columnDef.excludeQuickFilter,
        });
      }
    }
    setFilterFields(fields);
  }, [table]);

  useEffect(() => {
    /**
     * Effect hook to update the URL search parameters based on the debounced search value.
     * - It creates a query string with the debounced search value and navigates to the new URL.
     */
    const newSearchParams = createQueryString({ where: debouncedSearchValue });
    navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
  }, [debouncedSearchValue]);

  const { searchableColumns, filterableColumns } = useMemo(() => {
    /**
     * Memoized function to separate columns into searchable and filterable columns.
     * - Filters the `filterFields` based on whether the field has options or not.
     */
    return {
      searchableColumns: filterFields.filter(field => !field.options),
      filterableColumns: filterFields.filter(field => field.options),
    };
  }, [filterFields]);

  const options = useMemo<DataTableFilterOption<TData>[]>(() => {
    /**
     * Memoized function to generate filter options for each field.
     * - Creates a list of filter options based on the `filterFields` state.
     */
    return filterFields.map(field => {
      return {
        id: crypto.randomUUID(),
        label: field.label,
        value: field.value,
        options: field.options ?? [],
      };
    });
  }, [filterFields]);

  // Update selectedOptions when options or searchParams change
  useEffect(() => {
    if (options.length > 0) {
      // Extract all filter parameters from URL
      const urlFilters = Array.from(searchParams.entries()).filter(
        ([key, value]) =>
          // Filter out non-filter params
          key !== 'where' && key !== 'logical_operator' && key !== 'skip' && key !== 'limit' && value.includes('~')
      );

      if (urlFilters.length > 0) {
        const newSelectedOptions = urlFilters
          .map(([key, value]) => {
            // Find matching option
            const matchingOption = options.find(option => String(option.value) === key);
            if (!matchingOption) return null;

            const [filterValue, filterOperator] = value.split('~').filter(Boolean);

            return {
              ...matchingOption,
              filterValues: filterValue?.split('|') ?? [],
              filterOperator,
            };
          })
          .filter(Boolean) as DataTableFilterOption<TData>[];

        setSelectedOptions(newSelectedOptions);
        setOpenFilterBuilder(newSelectedOptions.length > 0);
      }
    }
  }, [options, searchParams]);

  useEffect(() => {
    /**
     * Effect hook to listen for changes in the browser's history state.
     * - Updates the `searchParams` state when the user navigates through the browser history.
     */
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(globalThis.location.search));
    };

    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, []);

  const onFilterComboboxItemSelect = () => {
    /**
     * Callback function to handle the selection of a filter combobox item.
     * - It opens the filter builder and combobox.
     */
    setOpenFilterBuilder(true);
    setOpenCombobox(true);
  };

  return (
    <div className={cn('flex w-full flex-col space-y-2.5 overflow-auto p-2 pt-4', className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-nowrap">
        <div className="float-left flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}>
              <SelectTrigger className="h-8 w-[10rem]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100, 250, 500, 1000].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    Show {pageSize} Rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {searchableColumns.length > 0 && (
            <div className="relative">
              <i className="fas fa-search fa-sm absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"></i>
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={event => setSearchValue(event.target.value)}
                className="h-8 w-40 rounded-md border pl-10 lg:w-64"
              />
            </div>
          )}
          {filterableColumns.some(column => !column.excludeQuickFilter) &&
            filterableColumns
              .filter(column => !column.excludeQuickFilter)
              .map(
                column =>
                  table.getColumn(column.value ? String(column.value) : '') && (
                    <DataTableFacetedFilter
                      key={String(column.value)}
                      column={table.getColumn(column.value ? String(column.value) : '')}
                      title={column.label}
                      options={column.options ?? []}
                    />
                  )
              )}
        </div>
        <div className="float-right flex items-center gap-2">
          <DataTableToolbarActions table={table} url={url} />
          {(options.length > 0 && selectedOptions.length > 0) || openFilterBuilder ? (
            <Button
              variant="outline"
              size="sm"
              className={selectedOptions.length > 0 ? 'bg-muted/50' : ''}
              onClick={() => setOpenFilterBuilder(!openFilterBuilder)}>
              <i className="fa-solid fa-filter mr-2 flex size-4 shrink-0 items-center" /> Filter{' '}
              {selectedOptions.length > 0 ? `(${selectedOptions.length})` : ''}
            </Button>
          ) : (
            <DataTableFilterCombobox
              options={options.filter(
                option => !selectedOptions.some(selectedOption => selectedOption.value === option.value)
              )}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              onSelect={onFilterComboboxItemSelect}
            />
          )}
          <DataTableViewOptions table={table} />
          {children}
        </div>
      </div>
      <div className={cn('flex flex-wrap items-center gap-2', !openFilterBuilder && 'hidden')}>
        {/* Show logical operator selector when multiple filters are applied */}
        {selectedOptions.length > 1 && (
          <DataTableLogicalOperator value={logicalOperator} onChange={setLogicalOperator} />
        )}
        {selectedOptions
          .filter(option => !option.isMulti)
          .map(selectedOption => (
            <DataTableFilterItem
              key={String(selectedOption.value)}
              table={table}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              defaultOpen={openCombobox}
            />
          ))}
        {selectedOptions.some(option => option.isMulti) ? (
          <DataTableMultiFilter
            table={table}
            allOptions={options}
            options={selectedOptions.filter(option => option.isMulti)}
            setSelectedOptions={setSelectedOptions}
            defaultOpen={openCombobox}
          />
        ) : null}
        {options.length > 0 && options.length > selectedOptions.length ? (
          <DataTableFilterCombobox
            options={options.filter(
              option => !selectedOptions.some(selectedOption => selectedOption.value === option.value)
            )}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onSelect={onFilterComboboxItemSelect}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full"
              aria-expanded={openCombobox}
              aria-label="Add filter">
              <i className="fa-solid fa-plus size-3.5" />
            </Button>
          </DataTableFilterCombobox>
        ) : null}
        {deferFilters && hasPendingChanges && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center justify-center bg-[#3B3C4F] text-white"
            onClick={applyFilters}>
            <i className="fa-solid fa-check mr-1"></i> Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataTableAdvancedToolbar;
