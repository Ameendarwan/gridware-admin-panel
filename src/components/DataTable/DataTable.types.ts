export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData;
  placeholder?: string;
  options?: Option[];
  excludeQuickFilter?: boolean;
}

export interface DataTableFilterOption<TData> {
  id: string;
  label: string;
  value: keyof TData;
  options: Option[];
  filterValues?: string[];
  filterOperator?: string;
  isMulti?: boolean;
}

export interface HideColumns {
  hideEdit?: boolean;
  hideView?: boolean;
  hideMarkComplete?: boolean;
  hideMap?: boolean;
  hideDelete?: boolean;
  hideExport?: boolean;
  hideMultiSelect?: boolean;
  hideRetry?: boolean;
}

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  stringOperators: [
    { label: 'Contains', value: 'contains' as const },
    { label: 'Equals', value: 'eq' as const },
    { label: 'Not', value: 'neq' as const },
    { label: 'Starts With', value: 'startswith' as const },
    { label: 'Ends With', value: 'endswith' as const },
    { label: 'Empty', value: 'is_null' as const },
    { label: 'Not Empty', value: 'is_not_null' as const },
  ],
  arrayOperators: [
    { label: 'Empty or None', value: 'is_array_empty' as const },
    { label: 'Not Empty', value: 'is_array_not_empty' as const },
  ],
  dateOperators: [
    { label: 'Before', value: 'lt' as const },
    { label: 'After', value: 'gt' as const },
    { label: 'Between', value: 'between' as const },
    { label: 'Not Between', value: 'not_between' as const },
    { label: 'Not', value: 'neq' as const },
    { label: 'Empty', value: 'is_null' as const },
    { label: 'Not Empty', value: 'is_not_null' as const },
  ],
  booleanOperators: [
    { label: 'False', value: 'is_false' as const },
    { label: 'True', value: 'is_true' as const },
  ],
  integerOperators: [
    { label: 'Equals', value: 'eq' as const },
    { label: 'Not', value: 'neq' as const },
    { label: 'Less Than', value: 'lt' as const },
    { label: 'Less Than equal to', value: 'lte' as const },
    { label: 'Greater Than equal to', value: 'gte' as const },
    { label: 'Greater Than', value: 'gt' as const },
    { label: 'Between', value: 'between' as const },
    { label: 'Not Between', value: 'not_between' as const },
    { label: 'Empty', value: 'is_null' as const },
    { label: 'Not Empty', value: 'is_not_null' as const },
    { label: 'Contains', value: 'contains' as const },
  ],
  selectableOperators: [
    { label: 'Is', value: 'eq' as const },
    { label: 'Is not', value: 'neq' as const },
    { label: 'Is empty', value: 'is_null' as const },
    { label: 'Is not empty', value: 'is_not_null' as const },
  ],
  logicalOperators: [
    {
      label: 'And',
      value: 'and' as const,
      description: 'All conditions must be met',
    },
    {
      label: 'Or',
      value: 'or' as const,
      description: 'At least one condition must be met',
    },
  ],
};
