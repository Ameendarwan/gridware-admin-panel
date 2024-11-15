'use client';

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type TableState,
  type VisibilityState,
} from '@tanstack/react-table';
import { DataTableFilterField } from '@app/components/DataTable/data-table.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@app/hooks/useDebounce';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseDataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageCount: number;
  filterFields?: DataTableFilterField<TData>[];
  enableAdvancedFilter?: boolean;
  state?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: {
      id: Extract<keyof TData, string>;
      desc: boolean;
    }[];
  };
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  filterFields = [],
  enableAdvancedFilter = false,
  state,
}: UseDataTableProps<TData, TValue>) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const per_page = parseInt(searchParams.get('per_page') || '10', 10);
  const sort = searchParams.get('sort');
  const [column, order] = sort?.split('.') ?? [];

  const { searchableColumns, filterableColumns } = useMemo(() => {
    return {
      searchableColumns: filterFields.filter(field => !field.options),
      filterableColumns: filterFields.filter(field => field.options),
    };
  }, [filterFields]);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(location.search);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      return newSearchParams.toString();
    },
    [location.search]
  );

  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    return Array.from(searchParams.entries()).reduce<ColumnFiltersState>((filters, [key, value]) => {
      const filterableColumn = filterableColumns.find(column => column.value === key);
      const searchableColumn = searchableColumns.find(column => column.value === key);

      if (filterableColumn) {
        filters.push({ id: key, value: value.split('.') });
      } else if (searchableColumn) {
        filters.push({ id: key, value: [value] });
      }

      return filters;
    }, []);
  }, [filterableColumns, searchableColumns, searchParams]);

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    state?.pagination ?? { pageIndex: page - 1, pageSize: per_page }
  );

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const [sorting, setSorting] = useState<SortingState>(
    state?.sorting ?? [{ id: column ?? '', desc: order === 'desc' }]
  );

  useEffect(() => {
    navigate({
      pathname: location.pathname,
      search: createQueryString({
        page: pageIndex + 1,
        per_page: pageSize,
        sort: sorting[0]?.id ? `${sorting[0].id}.${sorting[0].desc ? 'desc' : 'asc'}` : null,
      }),
    });
  }, [pageIndex, pageSize, sorting, createQueryString, navigate, location.pathname]);

  const debouncedSearchableColumnFilters = JSON.parse(
    useDebounce(
      JSON.stringify(columnFilters.filter(filter => searchableColumns.find(column => column.value === filter.id))),
      500
    )
  ) as ColumnFiltersState;

  const filterableColumnFilters = columnFilters.filter(filter =>
    filterableColumns.find(column => column.value === filter.id)
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (enableAdvancedFilter) return;

    if (!mounted) {
      setMounted(true);
      return;
    }

    const newParamsObject: Record<string, string | number | null> = { page: 1 };

    debouncedSearchableColumnFilters.forEach(column => {
      if (typeof column.value === 'string') {
        newParamsObject[column.id] = column.value;
      }
    });

    filterableColumnFilters.forEach(column => {
      if (Array.isArray(column.value)) {
        newParamsObject[column.id] = column.value.join('.');
      }
    });

    searchParams.forEach((_, key) => {
      if (
        (searchableColumns.some(column => column.value === key) &&
          !debouncedSearchableColumnFilters.some(column => column.id === key)) ||
        (filterableColumns.some(column => column.value === key) &&
          !filterableColumnFilters.some(column => column.id === key))
      ) {
        newParamsObject[key] = null;
      }
    });

    navigate({
      pathname: location.pathname,
      search: createQueryString(newParamsObject),
    });

    table.setPageIndex(0);
  }, [
    JSON.stringify(debouncedSearchableColumnFilters),
    JSON.stringify(filterableColumnFilters),
    navigate,
    location.pathname,
    enableAdvancedFilter,
    createQueryString,
    searchableColumns,
    filterableColumns,
  ]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      ...state,
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table };
}
