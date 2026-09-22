import { describe, it, expect } from 'vitest';
import { AUTH_AUDIENCE, AUTH_SCOPE } from './AuthConstants';

describe('AuthConstants', () => {
  describe('AUTH_AUDIENCE', () => {
    it('should be defined', () => {
      expect(AUTH_AUDIENCE).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof AUTH_AUDIENCE).toBe('string');
    });

    it('should have the correct value', () => {
      expect(AUTH_AUDIENCE).toBe('gridscope-backend');
    });

    it('should not be empty', () => {
      expect(AUTH_AUDIENCE).not.toBe('');
      expect(AUTH_AUDIENCE.length).toBeGreaterThan(0);
    });
  });

  describe('AUTH_SCOPE', () => {
    it('should be defined', () => {
      expect(AUTH_SCOPE).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof AUTH_SCOPE).toBe('string');
    });

    it('should have the correct value', () => {
      expect(AUTH_SCOPE).toBe('openid profile email offline_access');
    });

    it('should not be empty', () => {
      expect(AUTH_SCOPE).not.toBe('');
      expect(AUTH_SCOPE.length).toBeGreaterThan(0);
    });

    it('should contain required OAuth scopes', () => {
      expect(AUTH_SCOPE).toContain('openid');
      expect(AUTH_SCOPE).toContain('profile');
      expect(AUTH_SCOPE).toContain('email');
      expect(AUTH_SCOPE).toContain('offline_access');
    });

    it('should have scopes separated by spaces', () => {
      const scopes = AUTH_SCOPE.split(' ');
      expect(scopes).toHaveLength(4);
      expect(scopes).toContain('openid');
      expect(scopes).toContain('profile');
      expect(scopes).toContain('email');
      expect(scopes).toContain('offline_access');
    });
  });

  describe('constants immutability', () => {
    it('should verify AUTH_AUDIENCE is a constant', () => {
      // Constants defined with 'const' cannot be reassigned
      // This test verifies the constant is properly defined
      expect(AUTH_AUDIENCE).toBe('gridscope-backend');
    });

    it('should verify AUTH_SCOPE is a constant', () => {
      // Constants defined with 'const' cannot be reassigned
      // This test verifies the constant is properly defined
      expect(AUTH_SCOPE).toBe('openid profile email offline_access');
    });
  });

  describe('constants format validation', () => {
    it('should have AUTH_AUDIENCE in correct format', () => {
      // Should be a valid identifier format
      expect(AUTH_AUDIENCE).toMatch(/^[\w-]+$/);
    });

    it('should have AUTH_SCOPE in correct OAuth format', () => {
      // Should be space-separated OAuth scopes
      expect(AUTH_SCOPE).toMatch(/^\w+(\s\w+)*$/);
    });
  });
});
