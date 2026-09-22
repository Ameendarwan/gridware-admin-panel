import { describe, it, expect, vi, beforeEach } from 'vitest';
import { baseQuery } from './utils';
import { getToken } from '@app/lib/authClient';

// Mock the authClient
vi.mock('@app/lib/authClient', () => ({
  getToken: vi.fn(),
}));

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_REACT_APP_API_URL: 'https://api.example.com',
}));

describe('store utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('baseQuery', () => {
    it('should have correct baseUrl', () => {
      expect(baseQuery.baseUrl).toBe(import.meta.env.VITE_REACT_APP_API_URL);
    });
  });
});

// Helper to create mock headers
const createMockHeaders = () => ({
  set: vi.fn(),
});

// Helper to call prepareHeaders
const callPrepareHeaders = async (mockHeaders: any) => {
  return baseQuery.prepareHeaders!(mockHeaders, {} as any);
};

describe('baseQuery prepareHeaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add Authorization and X-Platform headers when token is available', async () => {
    const mockToken = 'mock-jwt-token';
    vi.mocked(getToken).mockResolvedValue(mockToken);

    const mockHeaders = createMockHeaders();
    const result = await callPrepareHeaders(mockHeaders);

    expect(vi.mocked(getToken)).toHaveBeenCalled();
    expect(mockHeaders.set).toHaveBeenCalledWith('Authorization', `Bearer ${mockToken}`);
    expect(mockHeaders.set).toHaveBeenCalledWith('X-Platform', 'web');
    expect(result).toBe(mockHeaders);
  });

  it('should not add Authorization header when token is null', async () => {
    vi.mocked(getToken).mockResolvedValue(null as any);

    const mockHeaders = createMockHeaders();
    const result = await callPrepareHeaders(mockHeaders);

    expect(vi.mocked(getToken)).toHaveBeenCalled();
    expect(mockHeaders.set).not.toHaveBeenCalledWith('Authorization', expect.any(String));
    expect(mockHeaders.set).not.toHaveBeenCalledWith('X-Platform', 'web');
    expect(result).toBe(mockHeaders);
  });

  it('should not add Authorization header when token is undefined', async () => {
    vi.mocked(getToken).mockResolvedValue(undefined as any);

    const mockHeaders = createMockHeaders();
    const result = await callPrepareHeaders(mockHeaders);

    expect(vi.mocked(getToken)).toHaveBeenCalled();
    expect(mockHeaders.set).not.toHaveBeenCalledWith('Authorization', expect.any(String));
    expect(mockHeaders.set).not.toHaveBeenCalledWith('X-Platform', 'web');
    expect(result).toBe(mockHeaders);
  });

  it('should handle token fetching errors gracefully', async () => {
    const mockError = new Error('Token fetch failed');
    vi.mocked(getToken).mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockHeaders = createMockHeaders();

    const result = await callPrepareHeaders(mockHeaders);

    expect(vi.mocked(getToken)).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to get token for RTK Query', mockError);
    expect(mockHeaders.set).not.toHaveBeenCalled();
    expect(result).toBe(mockHeaders);

    consoleSpy.mockRestore();
  });

  it('should handle empty string token', async () => {
    vi.mocked(getToken).mockResolvedValue('');

    const mockHeaders = createMockHeaders();
    const result = await callPrepareHeaders(mockHeaders);

    expect(vi.mocked(getToken)).toHaveBeenCalled();
    expect(mockHeaders.set).not.toHaveBeenCalledWith('Authorization', expect.any(String));
    expect(mockHeaders.set).not.toHaveBeenCalledWith('X-Platform', 'web');
    expect(result).toBe(mockHeaders);
  });
});
