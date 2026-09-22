/**
 * Shared utilities for DataTable filter components
 * Reduces duplication between DataTableFacetedFilter and DataTableAdvancedFacetedFilter
 */

import { cn } from '@app/lib/utils';

/**
 * Renders the checkbox/radio icon for filter options
 * @param singleSelect - Whether this is a single-select filter
 * @param isSelected - Whether the option is currently selected
 */
export const renderFilterIcon = (singleSelect: boolean, isSelected: boolean) => {
  if (singleSelect) {
    return <div className={cn('size-2 rounded-full bg-primary-foreground', !isSelected && 'invisible')} />;
  }
  return <i className={cn('fa-solid fa-check size-4', !isSelected && 'invisible')} />;
};

/**
 * Gets the container class names for filter icon
 * @param singleSelect - Whether this is a single-select filter
 * @param isSelected - Whether the option is currently selected
 */
export const getFilterIconContainerClasses = (singleSelect: boolean, isSelected: boolean) => {
  return cn(
    'mr-2 flex size-4 items-center justify-center border border-primary',
    singleSelect ? 'rounded-full' : 'rounded-sm',
    isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50'
  );
};
