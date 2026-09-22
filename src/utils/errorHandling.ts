import { AxiosError } from 'axios';

/**
 * Interface for API error response structure
 */
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

/**
 * Extracts error message from various error types
 * @param error - The error object caught in try-catch
 * @param fallbackMessage - Optional custom fallback message (defaults to 'Something went wrong')
 * @returns A user-friendly error message string
 */
export const getErrorMessage = (error: unknown, fallbackMessage: string = 'Something went wrong'): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.detail || data?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

/**
 * Handles API errors by logging and returning a user-friendly message
 * @param error - The error object caught in try-catch
 * @param context - Optional context for logging (e.g., 'Error saving deployment')
 * @param fallbackMessage - Optional custom fallback message
 * @returns A user-friendly error message string
 */
export const handleApiError = (
  error: unknown,
  context?: string,
  fallbackMessage: string = 'Something went wrong'
): string => {
  if (context) {
    console.error(`${context}: `, error);
  } else {
    console.error(error);
  }

  return getErrorMessage(error, fallbackMessage);
};
