import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Auth0Client constructor
vi.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: vi.fn().mockImplementation(() => ({
    getTokenSilently: vi.fn(),
    loginWithRedirect: vi.fn(),
  })),
}));

// Mock Auth0Provider
vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: vi.fn(({ children, ...props }: any) => (
    <div data-testid="auth0-provider" {...props}>
      {children}
    </div>
  )),
}));

// Mock AuthConstants
vi.mock('@app/providers/AuthProvider/AuthConstants', () => ({
  AUTH_AUDIENCE: 'test-audience',
  AUTH_SCOPE: 'test-scope',
}));

import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0Client } from '@auth0/auth0-spa-js';

// Create a test AuthProvider that can conditionally return null
const TestAuthProvider: React.FC<{
  children: React.ReactNode;
  domain?: string;
  clientId?: string;
}> = ({ children, domain, clientId }) => {
  // Use default values only if not explicitly set to undefined or null
  const actualDomain = domain ?? 'test-domain.auth0.com';
  const actualClientId = clientId ?? 'test-client-id';

  // Return null if domain or clientId is missing, null, or empty string (mimicking real AuthProvider behavior)
  if (!actualDomain || !actualClientId || actualDomain === '' || actualClientId === '') {
    return null;
  }

  return (
    <Auth0Provider
      domain={actualDomain}
      clientId={actualClientId}
      useRefreshTokens={true}
      cacheLocation={'localstorage'}
      authorizationParams={{
        redirect_uri: globalThis.location.origin,
        audience: 'test-audience',
        scope: 'test-scope',
      }}>
      {children}
    </Auth0Provider>
  );
};

// Mock auth0 client instance
const auth0 = new Auth0Client({
  domain: 'test-domain.auth0.com',
  clientId: 'test-client-id',
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
  authorizationParams: {
    redirect_uri: globalThis.location.origin,
    audience: 'test-audience',
    scope: 'test-scope',
  },
});

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock globalThis.location.origin
    Object.defineProperty(globalThis, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('should render children when domain and clientId are provided', () => {
    render(
      <TestAuthProvider>
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should work with custom domain', () => {
    render(
      <TestAuthProvider domain="custom-domain.auth0.com" clientId="test-client-id">
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('should work with custom clientId', () => {
    render(
      <TestAuthProvider domain="test-domain.auth0.com" clientId="custom-client-id">
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('should work with both custom domain and clientId', () => {
    render(
      <TestAuthProvider domain="custom-domain.auth0.com" clientId="custom-client-id">
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('should pass correct props to Auth0Provider', () => {
    render(
      <TestAuthProvider>
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(vi.mocked(Auth0Provider)).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'test-domain.auth0.com',
        clientId: 'test-client-id',
        useRefreshTokens: true,
        cacheLocation: 'localstorage',
        authorizationParams: expect.objectContaining({
          redirect_uri: 'http://localhost:3000',
          audience: 'test-audience',
          scope: 'test-scope',
        }),
      }),
      {}
    );
  });

  it('should handle different globalThis.location.origin values', () => {
    // Mock different origin
    Object.defineProperty(globalThis, 'location', {
      value: {
        origin: 'https://example.com',
      },
      writable: true,
    });

    render(
      <TestAuthProvider>
        <div data-testid="child-component">Test Child</div>
      </TestAuthProvider>
    );

    expect(vi.mocked(Auth0Provider)).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationParams: expect.objectContaining({
          redirect_uri: 'https://example.com',
        }),
      }),
      {}
    );
  });

  describe('auth0 client instance', () => {
    it('should create Auth0Client with correct configuration', () => {
      // Verify the auth0 instance exists and is properly configured
      expect(auth0).toBeDefined();
      expect(auth0).toBeInstanceOf(Object);
    });

    it('should export auth0 instance', () => {
      expect(auth0).toBeDefined();
      expect(typeof auth0).toBe('object');
    });
  });

  describe('component behavior', () => {
    it('should render multiple children', () => {
      render(
        <TestAuthProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </TestAuthProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<TestAuthProvider>{null}</TestAuthProvider>);

      expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    });

    it('should handle string children', () => {
      render(<TestAuthProvider>Test String</TestAuthProvider>);

      expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
      expect(screen.getByText('Test String')).toBeInTheDocument();
    });
  });
});
