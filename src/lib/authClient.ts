import { AUTH_AUDIENCE, AUTH_SCOPE } from '@app/providers/AuthProvider/AuthConstants';

import { AUTH_ERRORS } from './authErrors';
import auth from '@app/utils/auth';
import { auth0 } from '@app/providers/AuthProvider/AuthProvider';
import { toast } from 'sonner';

export interface AuthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
}

export const getToken = async (): Promise<string> => {
  try {
    const tokenExpiry = auth.getTokenExpiry();
    const isTokenNearExpiry = tokenExpiry && Number(tokenExpiry) - Date.now() <= 10 * 60 * 1000; // (10 minutes).

    const cacheMode = isTokenNearExpiry ? 'off' : 'on';

    const token = (await auth0.getTokenSilently({
      cacheMode,
      detailedResponse: true,
      authorizationParams: { scope: AUTH_SCOPE, audience: AUTH_AUDIENCE },
    })) as AuthToken;

    if (isTokenNearExpiry || !tokenExpiry) auth.setTokenExpiry(Date.now() + token.expires_in * 1000);
    return token.access_token;
  } catch (err: any) {
    console.warn('Failed to get token silently:', err);
    const errorCode = err?.error;

    const isTokenRefreshFailure = Object.values(AUTH_ERRORS).includes(errorCode);

    if (isTokenRefreshFailure) {
      await redirectToLogin();
      // Throw after redirect to ensure the function always returns or throws
      throw new Error('AUTH_REQUIRED');
    }
    // For non-auth errors, still throw but with different code
    console.error('Unexpected Auth0 error', err);
    throw new Error('TOKEN_FETCH_FAILED');
  }
};

export const redirectToLogin = async (errorMsg?: string, skipToast?: boolean) => {
  if (!skipToast) {
    toast.dismiss();
    toast.error(errorMsg || 'Your session has expired. Redirecting to login...');
  }

  try {
    // Generate a unique timestamp to prevent caching
    const cacheBuster = `?nocache=${Date.now()}`;

    // Use Auth0 logout first
    await auth0.logout({
      logoutParams: {
        returnTo: globalThis.location.origin + cacheBuster,
      },
    });
  } catch (error) {
    console.error('Auth0 logout failed:', error);
    // Only clear data if Auth0 logout fails to ensure we don't leave data in a broken state
    localStorage.clear();
    auth.clearTokenExpiry();

    // Fallback to regular login if logout fails (with cache buster)
    globalThis.location.href = `${globalThis.location.origin}?nocache=${Date.now()}`;
  } finally {
    // Clean up regardless of success/failure
    localStorage.clear();
    auth.clearTokenExpiry();
  }
};
