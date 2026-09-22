import { AUTH_ERRORS, LOGIN_ERROR_MESSAGES } from './authErrors';
import { getToken, redirectToLogin } from '@app/lib/authClient';

import axios from 'axios';
import { toast } from 'sonner';

export const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL ?? 'https://gridware.disrupts.pro/admin/dashboard/api/v1/',
  withCredentials: false,
});

export const setAccessTokenInInterceptor = () => {
  API.interceptors.request.use(async config => {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Platform'] = 'web';
    return config;
  });

  API.interceptors.response.use(
    response => response,
    async error => {
      const errorCode = error.response?.data?.error;
      const errorMessage = LOGIN_ERROR_MESSAGES[errorCode] ?? '';

      // Handle payload too large error
      if (error.response?.status === 413) {
        toast.error('The payload is too large. Please reduce the size and try again.', { duration: 8000 });
        throw error;
      }

      // Conditions that should trigger logout
      const shouldLogout =
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        Object.values(AUTH_ERRORS).includes(errorCode);

      if (shouldLogout) {
        console.warn('Authentication error detected, redirecting to login:', error);
        await redirectToLogin(errorMessage);
        return new Promise(() => {});
      }

      throw error;
    }
  );
};
