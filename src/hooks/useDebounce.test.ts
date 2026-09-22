import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes with default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: 'initial' } });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time by 499ms (less than default 500ms)
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time by 1ms more (total 500ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated'); // Should now be updated
  });

  it('should debounce value changes with custom delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    // Fast forward time by 999ms (less than 1000ms)
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe('initial');

    // Fast forward time by 1ms more (total 1000ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // First change
    rerender({ value: 'first' });
    expect(result.current).toBe('initial');

    // Fast forward 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Second change before first timer completes
    rerender({ value: 'second' });
    expect(result.current).toBe('initial');

    // Fast forward another 300ms (total 600ms from first change, 300ms from second)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward 200ms more (total 500ms from second change)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second'); // Should now be second
  });

  it('should work with different data types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 0 },
    });

    numberRerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(numberResult.current).toBe(42);

    // Test with boolean
    const { result: boolResult, rerender: boolRerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: false },
    });

    boolRerender({ value: true });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(boolResult.current).toBe(true);

    // Test with object
    const initialObj = { id: 1, name: 'initial' };
    const updatedObj = { id: 2, name: 'updated' };
    const { result: objResult, rerender: objRerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: initialObj },
    });

    objRerender({ value: updatedObj });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(objResult.current).toBe(updatedObj);

    // Test with array
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];
    const { result: arrayResult, rerender: arrayRerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: initialArray },
    });

    arrayRerender({ value: updatedArray });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(arrayResult.current).toBe(updatedArray);
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    try {
      const { unmount } = renderHook(() => useDebounce('test', 500));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    } finally {
      clearTimeoutSpy.mockRestore();
    }
  });
});
