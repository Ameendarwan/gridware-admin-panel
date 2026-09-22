import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useExportDeployment from './useExportDeployment';
import * as deploymentsModule from '../store/apis/deployments/deployments';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../store/apis/deployments/deployments', () => ({
  useExportDeploymentQuery: vi.fn(),
}));
vi.mock('./useErrorMessage', () => ({ default: () => 'Test error message' }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

describe('useExportDeployment', () => {
  const mockUseExportDeploymentQuery = deploymentsModule.useExportDeploymentQuery as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockClear();
  });

  it('should call useExportDeploymentQuery with correct params', () => {
    mockUseExportDeploymentQuery.mockReturnValue({ refetch: mockRefetch });
    renderHook(() => useExportDeployment(123));
    expect(mockUseExportDeploymentQuery).toHaveBeenCalledWith(
      { deploymentId: 123, check_warnings: true },
      { skip: undefined }
    );
  });

  it('should skip query if deploymentId is undefined', () => {
    mockUseExportDeploymentQuery.mockReturnValue({ refetch: mockRefetch });
    renderHook(() => useExportDeployment(undefined));
    expect(mockUseExportDeploymentQuery).toHaveBeenCalledWith(
      { deploymentId: -1, check_warnings: true },
      { skip: true }
    );
  });

  it('should show error toast if isError and errorMessage', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      isError: true,
      error: {},
      data: undefined,
      refetch: mockRefetch,
    });
    renderHook(() => useExportDeployment(123));
    expect(toast.error).toHaveBeenCalledWith('Test error message');
  });

  it('should trigger download when data is available and not checking warnings', () => {
    const originalCreateElement = document.createElement;
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn();
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }
    const createObjectURLSpy = vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLSpy = vi.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    // Use a real anchor element and spy on its methods
    const anchor = document.createElement('a');
    const setAttributeSpy = vi.spyOn(anchor, 'setAttribute');
    const clickSpy = vi.spyOn(anchor, 'click');
    const removeSpy = vi.spyOn(anchor, 'remove').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      if (tag === 'a') return anchor;
      return originalCreateElement.call(document, tag);
    });

    mockUseExportDeploymentQuery.mockReturnValue({
      data: { data: [{ foo: 'bar' }], filename: 'test.json' },
      isError: false,
      error: undefined,
      refetch: mockRefetch,
    });
    // Test with checkWarnings set to false to trigger download
    renderHook(() => useExportDeployment(123, false, undefined, false));
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(anchor);
    expect(setAttributeSpy).toHaveBeenCalledWith('download', 'test.json');
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
  });

  it('should return correct values from hook', () => {
    // Prevent download effect from running
    const originalCreateElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      if (tag === 'a') return originalCreateElement.call(document, 'div');
      return originalCreateElement.call(document, tag);
    });
    mockUseExportDeploymentQuery.mockReturnValue({
      data: undefined, // No data initially, so shouldCheckWarnings remains true
      isError: false,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useExportDeployment(123));
    expect(result.current).toMatchObject({
      data: undefined,
      isError: false,
      isLoading: true,
      isFetching: false,
      error: undefined,
      isCheckingWarnings: true,
    });
    expect(typeof result.current.proceedWithDownload).toBe('function');
    expect(typeof result.current.resetWarningsCheck).toBe('function');
    expect(typeof result.current.handleProceedWithWarnings).toBe('function');
    expect(typeof result.current.handleCancelExport).toBe('function');
    expect(typeof result.current.setShowWarningsModal).toBe('function');
    expect(result.current.showWarningsModal).toBe(false);
  });

  it('should call refetch when proceedWithDownload is called', async () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result, rerender } = renderHook(() => useExportDeployment(123, false));

    // Initially should be checking warnings
    expect(result.current.isCheckingWarnings).toBe(true);

    // Call proceedWithDownload
    act(() => {
      result.current.proceedWithDownload();
    });

    // Rerender to trigger effects
    rerender();

    // Should change checking warnings state and trigger refetch
    expect(result.current.isCheckingWarnings).toBe(false);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should reset warnings check when resetWarningsCheck is called', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useExportDeployment(123, false, undefined, false));

    // Initially should not be checking warnings (checkWarnings=false)
    expect(result.current.isCheckingWarnings).toBe(false);

    // Call resetWarningsCheck
    act(() => {
      result.current.resetWarningsCheck();
    });

    // Should reset to checking warnings
    expect(result.current.isCheckingWarnings).toBe(true);
  });

  it('should handle disabled download correctly', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    renderHook(() => useExportDeployment(123, true)); // disabledDownload=true

    expect(mockUseExportDeploymentQuery).toHaveBeenCalledWith(
      { deploymentId: 123, check_warnings: true },
      { skip: true }
    );
  });

  it('should show warnings modal when data has warnings', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: {
        warnings: ['Warning 1', 'Warning 2'],
        warning_count: 2,
        has_warnings: true,
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useExportDeployment(123));

    expect(result.current.showWarningsModal).toBe(true);
    expect(result.current.isCheckingWarnings).toBe(true);
  });

  it('should handle proceed with warnings', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: {
        warnings: ['Warning 1'],
        warning_count: 1,
        has_warnings: true,
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useExportDeployment(123));

    // Initially should show warnings modal
    expect(result.current.showWarningsModal).toBe(true);

    // Handle proceed with warnings
    act(() => {
      result.current.handleProceedWithWarnings();
    });

    expect(result.current.showWarningsModal).toBe(false);
    expect(result.current.isCheckingWarnings).toBe(false);
  });

  it('should handle cancel export', () => {
    const resetCallback = vi.fn();
    mockUseExportDeploymentQuery.mockReturnValue({
      data: {
        warnings: ['Warning 1'],
        warning_count: 1,
        has_warnings: true,
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useExportDeployment(123));

    // Initially should show warnings modal
    expect(result.current.showWarningsModal).toBe(true);

    // Handle cancel export
    act(() => {
      result.current.handleCancelExport(resetCallback);
    });

    expect(result.current.showWarningsModal).toBe(false);
    expect(result.current.isCheckingWarnings).toBe(true);
    expect(resetCallback).toHaveBeenCalled();
  });

  it('should proceed automatically when no warnings are returned', () => {
    mockUseExportDeploymentQuery.mockReturnValue({
      data: {
        warnings: [],
        warning_count: 0,
        has_warnings: false,
      },
      isError: false,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useExportDeployment(123));

    // Should not show warnings modal when no warnings
    expect(result.current.showWarningsModal).toBe(false);
    // Should call refetch to proceed with download
    expect(mockRefetch).toHaveBeenCalled();
  });
});
