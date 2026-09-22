import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import auth from './auth';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('auth utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setTokenExpiry', () => {
    it('should set token expiry cookie with correct value', () => {
      const expiry = 1234567890;
      auth.setTokenExpiry(expiry);
      
      expect(Cookies.set).toHaveBeenCalledWith('token-expiry', '1234567890');
    });

    it('should handle zero expiry', () => {
      auth.setTokenExpiry(0);
      
      expect(Cookies.set).toHaveBeenCalledWith('token-expiry', '0');
    });

    it('should handle negative expiry', () => {
      auth.setTokenExpiry(-1);
      
      expect(Cookies.set).toHaveBeenCalledWith('token-expiry', '-1');
    });
  });

  describe('getTokenExpiry', () => {
    it('should return token expiry from cookie', () => {
      const mockExpiry = '1234567890';
      (vi.mocked(Cookies.get) as any).mockReturnValue(mockExpiry);
      
      const result = auth.getTokenExpiry();
      
      expect(Cookies.get).toHaveBeenCalledWith('token-expiry');
      expect(result).toBe(mockExpiry);
    });

    it('should return undefined when cookie does not exist', () => {
      (vi.mocked(Cookies.get) as any).mockReturnValue(undefined);
      
      const result = auth.getTokenExpiry();
      
      expect(Cookies.get).toHaveBeenCalledWith('token-expiry');
      expect(result).toBeUndefined();
    });
  });

  describe('clearTokenExpiry', () => {
    it('should remove token expiry cookie', () => {
      auth.clearTokenExpiry();
      
      expect(Cookies.remove).toHaveBeenCalledWith('token-expiry');
    });
  });
});
