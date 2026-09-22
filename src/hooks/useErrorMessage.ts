import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit'; // Correct import for SerializedError
import { useMemo } from 'react';

// Define the ApiError type which can be FetchBaseQueryError, SerializedError or undefined
type ApiError = FetchBaseQueryError | SerializedError | undefined;

const useErrorMessage = (error: ApiError) => {
  // useMemo hook to memoize the error message to avoid unnecessary recalculations
  return useMemo(() => {
    // If there is no error, return null
    if (!error) return null;

    if ('status' in error) {
      // Return the error message from the response data, checking both 'message' and 'detail' keys
      const errorData = error.data as { message?: string; detail?: string };
      const message = errorData?.message ?? errorData?.detail;
      return message ?? '';
    } else {
      // If it's a SerializedError, return its message or a default message
      return error.message && error.message !== '' ? error.message : 'An unexpected error occurred';
    }
  }, [error]);
};

export default useErrorMessage;
