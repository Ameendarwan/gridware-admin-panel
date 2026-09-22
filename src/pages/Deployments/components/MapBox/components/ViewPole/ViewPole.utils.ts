import { ViewPoleProps } from './types';

export const getPoleLabel = (pole: ViewPoleProps['pole']): string => {
  if (pole?.disabled) return 'NON EXISTENT';
  if (pole?.is_archived) return 'DISABLED';
  if (pole?.is_miscellaneous) return 'MISCELLANEOUS';
  return 'NONE';
};
