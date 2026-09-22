import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { useToast, reducer } from './useToast';

describe('useToast', () => {
  afterEach(() => {
    // Reset memory state and listeners
    const globalWithListeners = globalThis as typeof globalThis & { listeners?: unknown[] };
    while (globalWithListeners.listeners && globalWithListeners.listeners.length > 0) {
      globalWithListeners.listeners.pop();
    }
  });

  it('should add a toast and dismiss it', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Test', description: 'Desc', open: true });
    });
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Test');
    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());
    let toastObj: any;
    act(() => {
      toastObj = result.current.toast({ title: 'Test', description: 'Desc', open: true });
    });
    act(() => {
      toastObj.update({ ...result.current.toasts[0], title: 'Updated' });
    });
    expect(result.current.toasts[0].title).toBe('Updated');
  });

  it('should remove a toast', () => {
    const { result } = renderHook(() => useToast());
    let toastObj: any;
    act(() => {
      toastObj = result.current.toast({ title: 'Test', description: 'Desc', open: true });
    });
    act(() => {
      result.current.dismiss(toastObj.id);
    });
    // Simulate remove
    act(() => {
      result.current.dismiss(toastObj.id);
    });
    // Remove should clear the toasts array
    expect(result.current.toasts.length).toBe(1); // Still present, but open: false
    // Simulate REMOVE_TOAST action
    const state = reducer({ toasts: result.current.toasts }, { type: 'REMOVE_TOAST', toastId: toastObj.id });
    expect(state.toasts.length).toBe(0);
  });

  it('should limit toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Toast1', open: true });
      result.current.toast({ title: 'Toast2', open: true });
    });
    expect(result.current.toasts.length).toBe(1); // TOAST_LIMIT is 1
    expect(result.current.toasts[0].title).toBe('Toast2');
  });
});
