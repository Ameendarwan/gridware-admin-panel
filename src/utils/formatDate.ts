import { format } from 'date-fns';

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';

  try {
    // Always parse as UTC by appending 'Z' if not present
    let normalizedDateString = dateString;
    if (!/Z$|[+-]\d{2}:\d{2}$/.test(dateString)) {
      normalizedDateString += 'Z';
    }

    const date = new Date(normalizedDateString);
    if (Number.isNaN(date.getTime())) return dateString;

    // Format in local time
    return format(date, 'MM/dd/yyyy h:mm a');
  } catch (error) {
    console.log(error);
    return dateString;
  }
};
