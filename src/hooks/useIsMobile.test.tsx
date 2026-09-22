import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
  let originalMatchMedia: typeof globalThis.matchMedia;
  let originalInnerWidth: number;

  beforeAll(() => {
    originalMatchMedia = globalThis.matchMedia;
    originalInnerWidth = globalThis.innerWidth;
  });

  afterAll(() => {
    globalThis.matchMedia = originalMatchMedia;
    globalThis.innerWidth = originalInnerWidth;
  });

  function setupMatchMedia(matches: boolean) {
    const listeners: Array<() => void> = [];
    globalThis.matchMedia = vi.fn().mockImplementation(() => ({
      matches,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: () => void) => {
        const idx = listeners.indexOf(cb);
        if (idx > -1) listeners.splice(idx, 1);
      },
    }));
    return listeners;
  }

  it('should return true if globalThis.innerWidth < 768', () => {
    globalThis.innerWidth = 500;
    setupMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false if globalThis.innerWidth >= 768', () => {
    globalThis.innerWidth = 900;
    setupMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update when the viewport size changes', () => {
    globalThis.innerWidth = 900;
    const listeners = setupMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    globalThis.innerWidth = 500;
    act(() => {
      for (const cb of listeners) {
        cb();
      }
    });
    expect(result.current).toBe(true);

    // Simulate resize to desktop
    globalThis.innerWidth = 900;
    act(() => {
      for (const cb of listeners) {
        cb();
      }
    });
    expect(result.current).toBe(false);
  });
});
