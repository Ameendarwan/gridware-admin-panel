export const AUTH_ERRORS = {
  // Auth0 Standard Errors
  INVALID_GRANT: 'invalid_grant',
  LOGIN_REQUIRED: 'login_required',
  CONSENT_REQUIRED: 'consent_required',
  INVALID_TOKEN: 'invalid_token',
  EXPIRED_TOKEN: 'expired_token',

  // Custom Errors
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  MISSING_REFRESH_TOKEN: 'MISSING_REFRESH_TOKEN',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',

  // Other Auth Errors
  ACCESS_DENIED: 'access_denied',
  INVALID_USER_PASSWORD: 'invalid_user_password',
  MFA_INVALID_CODE: 'mfa_invalid_code',
  MFA_REGISTRATION_REQUIRED: 'mfa_registration_required',
  MFA_REQUIRED: 'mfa_required',
  PASSWORD_LEAKED: 'password_leaked',
  PASSWORD_HISTORY_ERROR: 'PasswordHistoryError',
  PASSWORD_STRENGTH_ERROR: 'PasswordStrengthError',
  TOO_MANY_ATTEMPTS: 'too_many_attempts', // Fixed typo in original
  UNAUTHORIZED: 'unauthorized',
} as const;

export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERRORS.ACCESS_DENIED]: 'Access denied by resource server',
  [AUTH_ERRORS.INVALID_USER_PASSWORD]: 'Invalid username or password',
  [AUTH_ERRORS.MFA_INVALID_CODE]: 'Invalid or expired MFA code',
  [AUTH_ERRORS.MFA_REGISTRATION_REQUIRED]: 'MFA registration required',
  [AUTH_ERRORS.MFA_REQUIRED]: 'MFA code required',
  [AUTH_ERRORS.PASSWORD_LEAKED]: 'Password has been leaked - please choose a different one',
  [AUTH_ERRORS.PASSWORD_HISTORY_ERROR]: 'Password has been used before',
  [AUTH_ERRORS.PASSWORD_STRENGTH_ERROR]: 'Password does not meet strength requirements',
  [AUTH_ERRORS.TOO_MANY_ATTEMPTS]: 'Too many attempts - account temporarily blocked',
  [AUTH_ERRORS.UNAUTHORIZED]: 'Account is blocked',
};
