/**
 * Utility functions for detail pages (create/edit/view forms)
 * Reduces code duplication across entity detail components
 */

import { API } from '@app/lib/api-config';
import { toast } from 'sonner';

/**
 * Computes the loading state for detail pages
 * @param isInitialLoading - Whether the initial data is loading
 * @param isSaving - Whether the form is being saved
 * @returns Combined loading state
 */
export const computeLoadingState = (isInitialLoading: boolean, isSaving: boolean): boolean => {
  return isInitialLoading || isSaving;
};

/**
 * Generic fetch handler for detail pages
 * @param endpoint - The API endpoint to fetch from (e.g., '/device/123')
 * @param onSuccess - Callback to handle successful data fetch
 * @param onError - Optional callback to handle errors
 * @param onFinally - Optional callback to run after fetch (success or error)
 */
export const fetchDetailData = async (
  endpoint: string,
  onSuccess: (data: any) => void,
  onError?: (error: any) => void,
  onFinally?: () => void
): Promise<void> => {
  try {
    const response = await API.get(endpoint);
    const { data } = response.data;
    onSuccess(data);
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    if (onError) {
      onError(error);
    }
  } finally {
    if (onFinally) {
      onFinally();
    }
  }
};

/**
 * Options for submitting a detail form
 */
interface SubmitDetailFormOptions {
  mode: string | undefined;
  endpoint: string;
  id: string | undefined;
  data: any;
  entityName: string;
  onSuccess: () => void;
  onError?: (error: any) => void;
  headers?: Record<string, string>;
}

/**
 * Generic submit handler for create/edit operations
 * @param options - Configuration options for the submit operation
 * @returns Promise<void>
 */
export const submitDetailForm = async (options: SubmitDetailFormOptions): Promise<void> => {
  const { mode, endpoint, id, data, entityName, onSuccess, onError, headers } = options;

  try {
    if (mode === 'edit') {
      if (headers) {
        await API.patch(`${endpoint}/${id}`, data, { headers });
      } else {
        await API.patch(`${endpoint}/${id}`, data);
      }
      toast.success(`${entityName} updated successfully`);
    } else {
      if (headers) {
        await API.post(endpoint, data, { headers });
      } else {
        await API.post(endpoint, data);
      }
      toast.success(`${entityName} created successfully`);
    }

    onSuccess();
  } catch (error) {
    console.error(`Error saving ${entityName.toLowerCase()}:`, error);
    toast.error('Something went wrong');
    if (onError) {
      onError(error);
    }
  }
};

/**
 * Creates a standard detail page data fetcher using useCallback pattern
 * @param id - The entity ID
 * @param endpoint - The API endpoint base (e.g., '/device')
 * @param resetForm - Function to reset the form with fetched data
 * @param setLoading - Function to update loading state
 * @param additionalProcessing - Optional additional processing after data fetch
 * @returns A memoized fetch function
 */
export const createDetailFetcher = (
  id: string | undefined,
  endpoint: string,
  resetForm: (data: any) => void,
  setLoading: (loading: boolean) => void,
  additionalProcessing?: (data: any) => void
) => {
  return async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    await fetchDetailData(
      `${endpoint}/${id}`,
      data => {
        resetForm(data);
        if (additionalProcessing) {
          additionalProcessing(data);
        }
      },
      undefined,
      () => setLoading(false)
    );
  };
};
