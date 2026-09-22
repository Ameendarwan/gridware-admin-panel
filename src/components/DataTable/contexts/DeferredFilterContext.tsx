import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface DeferredFilterContextType {
  deferFilters: boolean;
  pendingParams: URLSearchParams | null;
  setPendingParams: (params: URLSearchParams | null) => void;
  hasPendingChanges: boolean;
  setHasPendingChanges: (value: boolean) => void;
  applyFilters: () => void;
  cancelFilters: () => void;
  updatePendingFilter: (key: string, value: string | null) => void;
}

const DeferredFilterContext = createContext<DeferredFilterContextType | undefined>(undefined);

interface DeferredFilterProviderProps {
  children: ReactNode;
  enabled: boolean;
  onApply?: (params: URLSearchParams) => void;
  onCancel?: () => void;
}

export const DeferredFilterProvider = ({ children, enabled, onApply, onCancel }: DeferredFilterProviderProps) => {
  const [pendingParams, setPendingParams] = useState<URLSearchParams | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Helper function to update a specific filter in pending params
  const updatePendingFilter = useCallback(
    (key: string, value: string | null) => {
      const currentUrlParams = new URLSearchParams(globalThis.location.search);

      // Create new params based on pending or current URL
      const newParams = pendingParams
        ? new URLSearchParams(pendingParams.toString())
        : new URLSearchParams(currentUrlParams.toString());

      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }

      // Check if the new params differ from current URL
      const hasChanges = newParams.toString() !== currentUrlParams.toString();

      setPendingParams(newParams);
      setHasPendingChanges(hasChanges);
    },
    [pendingParams]
  );

  const applyFilters = useCallback(() => {
    if (pendingParams && onApply) {
      onApply(pendingParams);
      setPendingParams(null);
      setHasPendingChanges(false);
    }
  }, [pendingParams, onApply]);

  const cancelFilters = useCallback(() => {
    setPendingParams(null);
    setHasPendingChanges(false);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      deferFilters: enabled,
      pendingParams,
      setPendingParams,
      hasPendingChanges,
      setHasPendingChanges,
      applyFilters,
      cancelFilters,
      updatePendingFilter,
    }),
    [enabled, pendingParams, hasPendingChanges, applyFilters, cancelFilters, updatePendingFilter]
  );

  return <DeferredFilterContext.Provider value={contextValue}>{children}</DeferredFilterContext.Provider>;
};

export const useDeferredFilter = () => {
  const context = useContext(DeferredFilterContext);
  if (!context) {
    // Return default values when not within provider
    return {
      deferFilters: false,
      pendingParams: null,
      setPendingParams: () => {},
      hasPendingChanges: false,
      setHasPendingChanges: () => {},
      applyFilters: () => {},
      cancelFilters: () => {},
      updatePendingFilter: () => {},
    };
  }
  return context;
};
