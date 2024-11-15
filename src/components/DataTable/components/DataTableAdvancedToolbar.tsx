'use client';

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
import { HTMLAttributes, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@app/hooks/useDebounce';
import { createQueryString, ExtendedColumnDef } from '@app/components/DataTable/DataTable.utils';
import { useNavigate } from 'react-router-dom';

interface DataTableAdvancedToolbarProps<TData> extends HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

const DataTableAdvancedToolbar = <TData,>({
  table,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [filterFields, setFilterFields] = useState<DataTableFilterField<TData>[]>([]);
  const isFiltered = table.getState().columnFilters.length > 0;
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const navigate = useNavigate();

  useEffect(() => {
    const fields: SetStateAction<DataTableFilterField<any>[]> = [];
    const columns = table.getAllColumns();
    columns?.forEach(column => {
      const columnDef = column.columnDef as ExtendedColumnDef<any>;
      if (columnDef.accessorKey) {
        fields.push({
          label: columnDef.label ?? columnDef.accessorKey,
          value: columnDef.accessorKey,
        });
      }
    });
    setFilterFields(fields);
  }, [table]);

  useEffect(() => {
    const newSearchParams = createQueryString({ search: debouncedSearchValue });
    navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
  }, [debouncedSearchValue]);

  const { searchableColumns, filterableColumns } = useMemo(() => {
    return {
      searchableColumns: filterFields.filter(field => !field.options),
      filterableColumns: filterFields.filter(field => field.options),
    };
  }, [filterFields]);

  const options = useMemo<DataTableFilterOption<TData>[]>(() => {
    return filterFields.map(field => {
      return {
        id: crypto.randomUUID(),
        label: field.label,
        value: field.value,
        options: field.options ?? [],
      };
    });
  }, [filterFields]);

  const initialSelectedOptions = useMemo(() => {
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

  const [selectedOptions, setSelectedOptions] = useState<DataTableFilterOption<TData>[]>(initialSelectedOptions);
  const [openFilterBuilder, setOpenFilterBuilder] = useState(initialSelectedOptions.length > 0 || false);
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
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
