import { FetchBaseQueryArgs } from '@reduxjs/toolkit/query';
import { getToken } from '@app/lib/authClient';

export const baseQuery: FetchBaseQueryArgs = {
  baseUrl: import.meta.env.VITE_REACT_APP_API_URL,
  timeout: 300000, // 5 minutes
  prepareHeaders: async headers => {
    try {
      const token = await getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('X-Platform', 'web');
      }
      return headers;
    } catch (error) {
      // Handle token fetching errors if needed
      console.error('Failed to get token for RTK Query', error);
      return headers;
    }
  },
};
