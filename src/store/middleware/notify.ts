import { AUTH_ERRORS, LOGIN_ERROR_MESSAGES } from '@app/lib/authErrors';
import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit';

import { ToastService } from '@app/services/toastService';
import { redirectToLogin } from '@app/lib/authClient';

const notify: Middleware = () => next => async action => {
  const toast = ToastService.toast;
  if (!toast) return next(action);

  if (isRejectedWithValue(action)) {
    const payload = action.payload as any;
    const status = payload?.status ?? payload?.originalStatus;
    const errorData = payload?.data ?? {};
    const errorCode = errorData?.error;
    const errorMessage = LOGIN_ERROR_MESSAGES[errorCode] ?? '';

    const shouldLogout = status === 401 || status === 403 || Object.values(AUTH_ERRORS).includes(errorCode);

    if (shouldLogout) {
      await redirectToLogin(errorMessage);
      return;
    }

    if (status === 413) {
      toast.error('The payload is too large. Please reduce the size and try again.', { duration: 8000 });
    }
  }

  return next(action);
};

export default notify;
