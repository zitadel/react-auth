import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../useAuth.js';

/**
 * Session-storage key under which the post-login return path is stored before
 * a signin redirect, and read back here after the callback completes.
 *
 * @public
 */
export const RETURN_TO_KEY = 'zitadel:react-auth:returnTo';

/**
 * Handles the OIDC signin callback. Mount this at the route matching your
 * `redirect_uri` (e.g. `/auth/callback`). The `AuthProvider` performs
 * the code exchange automatically; this component waits for it to resolve,
 * then navigates to the stored return path (or `/`), or to `/auth/error` on
 * failure.
 *
 * @public
 */
export const SignInCallback = (): React.JSX.Element => {
  const auth = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (auth.isLoading) {
      return;
    }
    if (auth.error) {
      void navigate('/auth/error', { replace: true });
      return;
    }
    if (auth.isAuthenticated) {
      const returnTo = window.sessionStorage.getItem(RETURN_TO_KEY) ?? '/';
      window.sessionStorage.removeItem(RETURN_TO_KEY);
      void navigate(returnTo, { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, navigate]);

  return <p>Signing you in&hellip;</p>;
};
