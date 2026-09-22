import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { ToastService } from './toastService';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('ToastService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default toast
    ToastService.setToast(toast);
  });

  describe('static toast property', () => {
    it('should have toast property set to sonner toast by default', () => {
      expect(ToastService.toast).toBe(toast);
    });
  });

  describe('setToast', () => {
    it('should update the toast property', () => {
      const mockToast = {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
      } as any;

      ToastService.setToast(mockToast);

      expect(ToastService.toast).toBe(mockToast);
    });

    it('should allow calling methods on the new toast instance', () => {
      const mockToast = {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
      } as any;

      ToastService.setToast(mockToast);
      ToastService.toast.success('Test message');

      expect(mockToast.success).toHaveBeenCalledWith('Test message');
    });
  });

  describe('toast functionality', () => {
    it('should call success method on toast', () => {
      ToastService.toast.success('Success message');
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });

    it('should call error method on toast', () => {
      ToastService.toast.error('Error message');
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });

    it('should call info method on toast', () => {
      ToastService.toast.info('Info message');
      expect(toast.info).toHaveBeenCalledWith('Info message');
    });

    it('should call warning method on toast', () => {
      ToastService.toast.warning('Warning message');
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
    });
  });
});
