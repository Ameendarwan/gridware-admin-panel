/**
 * Utility functions for form components
 */

/**
 * Generates the title for a detail page based on mode
 * @param mode - The mode of the page (view, edit, or create)
 * @param id - The ID of the entity
 * @param entityName - The name of the entity (e.g., 'Customer', 'Device')
 * @returns The appropriate title string
 */
export const getDetailPageTitle = (mode: string | undefined, id: string | undefined, entityName: string): string => {
  if (mode === 'view') return `#${id}`;
  if (mode === 'edit') return `Edit ${entityName}`;
  return `New ${entityName}`;
};
