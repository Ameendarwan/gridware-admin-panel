import { FC, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, redirectToLogin } from '@app/lib/authClient';

import { AUTH_ERRORS } from '@app/lib/authErrors';
import Layout from '@app/components/Layout';
import { setAccessTokenInInterceptor } from '@app/lib/api-config';
import { urls } from '@app/routes/urls';
import { useAuth0 } from '@auth0/auth0-react';

const ProtectedRoute: FC = () => {
  const { user, isAuthenticated } = useAuth0();
  const [isTokenSetup, setIsTokenSetup] = useState(false);
  const location = useLocation();

  /**
   * Constructs an object representing the current location (URL path, search parameters, and hash).
   * - `pathname`: The current URL path (e.g., `/dashboard`).
   * - `search`: The query string part of the URL (e.g., `?page=1`).
   * - `hash`: The hash fragment of the URL (e.g., `#section`).
   */
  const currentLocation = {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  };

  /**
   * Sets up the interceptor with the access token.
   * Retrieves the access token silently and configures the API interceptor with it.
   * Saves the token to local storage for subsequent use.
   */
  const setupInterceptor = async () => {
    try {
      // Just verify auth + setup interceptor
      await getToken();
      setAccessTokenInInterceptor(); // Configures axios to use getToken()
      setIsTokenSetup(true);
    } catch (err: any) {
      const errorCode = err?.error;

      // Logout only if session or token is invalid/expired
      if (Object.values(AUTH_ERRORS).includes(errorCode)) {
        await redirectToLogin();
      } else {
        console.error('Unexpected Auth0 error', err);
      }
    }
  };

  useEffect(() => {
    // Trigger setupInterceptor whenever `getAccessTokenSilently` or `location` changes.
    void setupInterceptor();
  }, [location]);

  /**
   * If the user is not authenticated or does not exist, redirects them to the login page.
   * - `Navigate` component is used to perform the redirect.
   * - `state` is passed with the current location so the user can be redirected back after login.
   * - `replace` ensures the login route replaces the current entry in the history stack, not adding a new one.
   */
  if (!user || !isAuthenticated) {
    return (
      <Navigate
        to={urls.login}
        state={{
          from: currentLocation,
        }}
        replace
      />
    );
  }

  return <Layout>{isTokenSetup && <Outlet />}</Layout>;
};

export default ProtectedRoute;
