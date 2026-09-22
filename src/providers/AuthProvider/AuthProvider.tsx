import { AUTH_AUDIENCE, AUTH_SCOPE } from '@app/providers/AuthProvider/AuthConstants';
import React, { ReactNode } from 'react';

import { Auth0Client } from '@auth0/auth0-spa-js';
import { Auth0Provider } from '@auth0/auth0-react';

type Props = {
  children: ReactNode;
};

const domain = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;

export const auth0 = new Auth0Client({
  domain: domain,
  clientId: clientId,
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
  authorizationParams: {
    redirect_uri: globalThis.location.origin,
    audience: AUTH_AUDIENCE,
    scope: AUTH_SCOPE,
  },
});

const AuthProvider: React.FC<Props> = ({ children }) => {
  if (!(domain && clientId)) return null;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      useRefreshTokens={true}
      cacheLocation={'localstorage'}
      authorizationParams={{
        redirect_uri: globalThis.location.origin,
        audience: AUTH_AUDIENCE,
        scope: AUTH_SCOPE,
      }}>
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
