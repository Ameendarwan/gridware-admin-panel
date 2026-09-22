import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useSearchParamsChange from './useSearchParamsChange';
import { useLocation } from 'react-router-dom';

vi.mock('react-router-dom', () => ({ useLocation: vi.fn() }));

describe('useSearchParamsChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not increment counter if required params are missing on first render', () => {
    (useLocation as any).mockReturnValue({ search: '' });
    const { result } = renderHook(() => useSearchParamsChange());
    expect(result.current).toBe(0);
  });

  it('should increment counter if required params are present on first render', () => {
    (useLocation as any).mockReturnValue({ search: '?page=1&per_page=10' });
    const { result } = renderHook(() => useSearchParamsChange());
    expect(result.current).toBe(1);
  });

  it('should increment counter when search params change', () => {
    let search = '?page=1&per_page=10';
    (useLocation as any).mockImplementation(() => ({ search }));
    const { result, rerender } = renderHook(() => useSearchParamsChange());
    expect(result.current).toBe(1);
    // Change a param
    search = '?page=2&per_page=10';
    rerender();
    expect(result.current).toBe(2);
    // Add a param
    search = '?page=2&per_page=10&foo=bar';
    rerender();
    expect(result.current).toBe(3);
    // Remove a param
    search = '?page=2';
    rerender();
    expect(result.current).toBe(4);
  });

  it('should not increment counter if search params do not change', () => {
    let search = '?page=1&per_page=10';
    (useLocation as any).mockImplementation(() => ({ search }));
    const { result, rerender } = renderHook(() => useSearchParamsChange());
    expect(result.current).toBe(1);
    rerender();
    expect(result.current).toBe(1);
  });
});
