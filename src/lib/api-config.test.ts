import { vi, describe, it, expect, beforeEach } from 'vitest';
import { API, setAccessTokenInInterceptor } from './api-config';
import { getToken, redirectToLogin } from '@app/lib/authClient';
import { AUTH_ERRORS } from './authErrors';

vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  return {
    default: {
      create: vi.fn(() => ({ interceptors, defaults: {}, get: vi.fn(), post: vi.fn() })),
    },
  };
});

vi.mock('@app/lib/authClient', () => ({
  getToken: vi.fn(),
  redirectToLogin: vi.fn(),
}));

const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    get error() {
      return toastErrorMock;
    },
  },
}));

// Helper to get the last call to a mock
const lastCall = (mock: any) => mock.mock.calls.at(-1);

describe('api-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set up request interceptor and add token/headers', async () => {
    (getToken as any).mockResolvedValue('test-token');
    setAccessTokenInInterceptor();
    expect(API.interceptors.request.use).toHaveBeenCalled();
    // Simulate the interceptor function
    const interceptorFn = lastCall(API.interceptors.request.use)[0];
    const config: any = { headers: {} };
    const result = await interceptorFn(config);
    expect(result.headers.Authorization).toBe('Bearer test-token');
    expect(result.headers['X-Platform']).toBe('web');
  });

  it('should show toast on 413 error', async () => {
    setAccessTokenInInterceptor();
    expect(API.interceptors.response.use).toHaveBeenCalled();
    const [, errorInterceptor] = lastCall(API.interceptors.response.use);
    const error = { response: { status: 413 }, data: {} };
    const promise = errorInterceptor(error);
    await expect(promise).rejects.toBe(error);
    expect(toastErrorMock).toHaveBeenCalledWith('The payload is too large. Please reduce the size and try again.', {
      duration: 8000,
    });
  });

  it('should call redirectToLogin on 401/403 or auth error', async () => {
    setAccessTokenInInterceptor();
    const [, errorInterceptor] = lastCall(API.interceptors.response.use);
    (redirectToLogin as any).mockImplementation(() => new Promise(() => {}));
    // 401
    let error: any = { response: { status: 401 }, data: {} };
    errorInterceptor(error);
    await new Promise(res => setTimeout(res, 10));
    expect(redirectToLogin).toHaveBeenCalled();
    // 403
    (redirectToLogin as any).mockClear();
    error = { response: { status: 403 }, data: {} };
    errorInterceptor(error);
    await new Promise(res => setTimeout(res, 10));
    expect(redirectToLogin).toHaveBeenCalled();
    // AUTH_ERRORS
    (redirectToLogin as any).mockClear();
    error = { response: { status: 400, data: { error: Object.values(AUTH_ERRORS)[0] } } };
    errorInterceptor(error);
    await new Promise(res => setTimeout(res, 10));
    expect(redirectToLogin).toHaveBeenCalled();
  });

  it('should reject promise for other errors', async () => {
    setAccessTokenInInterceptor();
    const [, errorInterceptor] = lastCall(API.interceptors.response.use);
    const error = { response: { status: 500, data: { error: 'SOME_OTHER_ERROR' } } };
    await expect(errorInterceptor(error)).rejects.toBe(error);
  });
});
