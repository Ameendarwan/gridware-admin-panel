/**
 * Environment helpers for client-side behavior
 */

// Environment types
export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
}

// Environment detection patterns
const ENVIRONMENT_PATTERNS: Record<Environment, RegExp[]> = {
  [Environment.STAGING]: [/stage/i, /staging/i, /stg/i],
  [Environment.DEVELOPMENT]: [/dev/i, /develop/i, /localhost/i, /127\.0\.0\.1/i],
  [Environment.PRODUCTION]: [], // Default if no patterns match
};

// Title configuration
const TITLE_CONFIG = {
  base: 'DST Webmanager',
  suffixes: {
    [Environment.STAGING]: 'Stg',
    [Environment.DEVELOPMENT]: 'Dev',
    [Environment.PRODUCTION]: '',
  },
} as const;

/**
 * Detects the current environment based on multiple sources
 */
export const detectEnvironment = (): Environment => {
  // Check against environment patterns
  const sources = [
    import.meta.env.VITE_REACT_APP_API_URL?.toLowerCase(),
    globalThis.location.hostname.toLowerCase(),
  ].filter(Boolean);

  for (const [env, patterns] of Object.entries(ENVIRONMENT_PATTERNS)) {
    if (patterns.some(pattern => sources.some(source => pattern.test(source)))) {
      return env as Environment;
    }
  }

  return Environment.PRODUCTION;
};

/**
 * Gets the appropriate app title based on the current environment
 */
export const getAppTitle = (): string => {
  const environment = detectEnvironment();
  const suffix = TITLE_CONFIG.suffixes[environment];

  return suffix ? `${TITLE_CONFIG.base} - ${suffix}` : TITLE_CONFIG.base;
};

/**
 * Updates the document title based on the current environment
 */
export const updateDocumentTitle = (): void => {
  document.title = getAppTitle();
};

/**
 * Checks if the app is running in a specific environment
 */
export const isEnvironment = (env: Environment): boolean => {
  return detectEnvironment() === env;
};

// Convenience methods
export const isProduction = () => isEnvironment(Environment.PRODUCTION);
export const isStaging = () => isEnvironment(Environment.STAGING);
export const isDevelopment = () => isEnvironment(Environment.DEVELOPMENT);
