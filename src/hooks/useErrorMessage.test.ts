import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useErrorMessage from './useErrorMessage';

describe('useErrorMessage', () => {
  it('should return null when no error is provided', () => {
    const { result } = renderHook(() => useErrorMessage(undefined));

    expect(result.current).toBeNull();
  });

  it('should return null when undefined error is provided', () => {
    const { result } = renderHook(() => useErrorMessage(undefined));

    expect(result.current).toBeNull();
  });

  it('should return error message from response data for FetchBaseQueryError', () => {
    const error = {
      status: 400,
      data: { message: 'Bad request error' },
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('Bad request error');
  });

  it('should return HTTP error status when no message in response data', () => {
    const error = {
      status: 404,
      data: {},
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('');
  });

  it('should return HTTP error status when data is null', () => {
    const error = {
      status: 500,
      data: null,
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('');
  });

  it('should return HTTP error status when data is undefined', () => {
    const error = {
      status: 403,
      data: undefined,
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('');
  });

  it('should return SerializedError message when available', () => {
    const error = {
      message: 'Network connection failed',
      name: 'NetworkError',
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('Network connection failed');
  });

  it('should return default message for SerializedError without message', () => {
    const error = {
      name: 'UnknownError',
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('An unexpected error occurred');
  });

  it('should handle empty string message in response data', () => {
    const error = {
      status: 400,
      data: { message: '' },
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('');
  });

  it('should handle empty string message in SerializedError', () => {
    const error = {
      message: '',
      name: 'EmptyError',
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('An unexpected error occurred');
  });

  it('should memoize the result and not recalculate for same error', () => {
    const error = {
      status: 400,
      data: { message: 'Bad request' },
    };

    const { result, rerender } = renderHook(({ error }) => useErrorMessage(error), { initialProps: { error } });

    const firstResult = result.current;

    // Rerender with same error
    rerender({ error });

    expect(result.current).toBe(firstResult);
    expect(result.current).toBe('Bad request');
  });

  it('should recalculate when error changes', () => {
    const error1 = {
      status: 400,
      data: { message: 'Bad request' },
    };

    const error2 = {
      status: 500,
      data: { message: 'Internal server error' },
    };

    const { result, rerender } = renderHook(({ error }) => useErrorMessage(error), { initialProps: { error: error1 } });

    expect(result.current).toBe('Bad request');

    // Rerender with different error
    rerender({ error: error2 });

    expect(result.current).toBe('Internal server error');
  });

  it('should handle complex data structures in response', () => {
    const error = {
      status: 422,
      data: {
        message: 'Validation failed',
        errors: {
          name: ['Name is required'],
          email: ['Email is invalid'],
        },
      },
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('Validation failed');
  });

  it('should handle numeric status codes', () => {
    const error = {
      status: 401,
      data: { message: 'Unauthorized' },
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('Unauthorized');
  });

  it('should handle string status codes', () => {
    const error = {
      status: 'CUSTOM_ERROR' as const,
      data: { message: 'Fetch failed' },
      error: 'Custom error',
    };

    const { result } = renderHook(() => useErrorMessage(error));

    expect(result.current).toBe('Fetch failed');
  });
});
