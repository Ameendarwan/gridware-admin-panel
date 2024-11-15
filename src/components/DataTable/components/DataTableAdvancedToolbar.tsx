'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { DataTableMultiFilter } from './DataTableMultiFilter';
import { DataTableFilterField, DataTableFilterOption } from '@app/components/DataTable/DataTable.types';
import { cn } from '@app/lib/utils';
import { Button } from '@app/components/Button/Button';
import DataTableViewOptions from '@app/components/DataTable/components/DataTableViewOptions';
import DataTableFilterCombobox from '@app/components/DataTable/components/DataTableFilterCombobox';
import DataTableFilterItem from '@app/components/DataTable/components/DataTableFilterItem';
import TasksTableToolbarActions from '@app/pages/Tasks/TasksTableToolbarActions';
import { Input } from '@app/components/Input/Input';
import DataTableFacetedFilter from '@app/components/DataTable/components/DataTableFacetedFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/Select/Select';

interface DataTableAdvancedToolbarProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
}

const DataTableAdvancedToolbar = <TData,>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) => {
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams(window.location.search));
  const isFiltered = table.getState().columnFilters.length > 0;

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter(field => !field.options),
      filterableColumns: filterFields.filter(field => field.options),
    };
  }, [filterFields]);

  const options = React.useMemo<DataTableFilterOption<TData>[]>(() => {
    return filterFields.map(field => {
      return {
        id: crypto.randomUUID(),
        label: field.label,
        value: field.value,
        options: field.options ?? [],
      };
    });
  }, [filterFields]);

  const initialSelectedOptions = React.useMemo(() => {
    return options
      .filter(option => searchParams.has(option.value as string))
      .map(option => {
        const value = searchParams.get(String(option.value)) as string;
        const [filterValue, filterOperator] = value?.split('~').filter(Boolean) ?? [];

        return {
          ...option,
          filterValues: filterValue?.split('.') ?? [],
          filterOperator,
        };
      });
  }, [options, searchParams]);

  const [selectedOptions, setSelectedOptions] = React.useState<DataTableFilterOption<TData>[]>(initialSelectedOptions);
  const [openFilterBuilder, setOpenFilterBuilder] = React.useState(initialSelectedOptions.length > 0 || false);
  const [openCombobox, setOpenCombobox] = React.useState(false);

  React.useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function onFilterComboboxItemSelect() {
    setOpenFilterBuilder(true);
    setOpenCombobox(true);
  }

  return (
    <div className={cn('flex w-full flex-col space-y-2.5 overflow-auto pl-3 pr-3 pt-3', className)} {...props}>
      <div className="items-center">
        <div className="float-left flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}>
              <SelectTrigger className="h-8 w-[8rem]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    Show {pageSize} Rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {searchableColumns.length > 0 &&
            searchableColumns.map(
              column =>
                table.getColumn(column.value ? String(column.value) : '') && (
                  <Input
                    key={String(column.value)}
                    placeholder={column.placeholder}
                    value={(table.getColumn(String(column.value))?.getFilterValue() as string) ?? ''}
                    onChange={event => table.getColumn(String(column.value))?.setFilterValue(event.target.value)}
                    className="h-8 w-40 lg:w-64"
                  />
                )
            )}
          {filterableColumns.length > 0 &&
            filterableColumns.map(
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
          {isFiltered && (
            <Button
              aria-label="Reset filters"
              variant="ghost"
              className="h-8 px-2 lg:px-3"
              onClick={() => table.resetColumnFilters()}>
              Reset
              <i className="fa-solid fa-x ml-2 size-4"></i>
            </Button>
          )}
        </div>
        <div className="float-right flex items-center gap-2">
          <TasksTableToolbarActions table={table} />
          {(options.length > 0 && selectedOptions.length > 0) || openFilterBuilder ? (
            <Button variant="outline" size="sm" onClick={() => setOpenFilterBuilder(!openFilterBuilder)}>
              <i className="fa-solid fa-filter mr-2 size-4 shrink-0" />
              Filter
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
      <div className={cn('flex items-center gap-2', !openFilterBuilder && 'hidden')}>
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
            options={options}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onSelect={onFilterComboboxItemSelect}>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              className="h-7 rounded-full"
              onClick={() => setOpenCombobox(true)}>
              <i className="fa-solid fa-plus mr-2 size-4 opacity-50" />
              Add filter
            </Button>
          </DataTableFilterCombobox>
        ) : null}
      </div>
    </div>
  );
};

export default DataTableAdvancedToolbar;
