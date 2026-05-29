import React from 'react';
import type { SigninPopupArgs, SigninRedirectArgs } from 'oidc-client-ts';

import { useAuth } from './useAuth.js';
import { hasAuthParams } from './utils.js';
import type { AuthState } from './AuthState.js';

/**
 * Options for {@link useAutoSignin}.
 *
 * @public
 */
export interface UseAutoSigninOptions {
  /**
   * Which sign-in flow to use. Defaults to `'signinRedirect'`. The
   * `signinResourceOwnerCredentials` method is not supported.
   */
  signinMethod?: 'signinRedirect' | 'signinPopup';

  /**
   * Additional arguments forwarded to the chosen sign-in method.
   */
  signinArgs?: SigninRedirectArgs | SigninPopupArgs;
}

/**
 * Automatically attempts to sign in a user, once, when the app loads
 * unauthenticated. Uses the redirect flow by default.
 *
 * Does not support the `signinResourceOwnerCredentials` method.
 *
 * @param options - Optional configuration. Defaults to
 *   `{ signinMethod: 'signinRedirect' }`.
 * @returns The current status of the authentication process.
 *
 * @example
 * ```tsx
 * import { useAutoSignin } from '@zitadel/react-auth';
 *
 * function App() {
 *   const { isLoading, isAuthenticated } = useAutoSignin();
 *   if (isLoading) return <div>Signing in...</div>;
 *   return isAuthenticated ? <Home /> : <div>Unable to sign in</div>;
 * }
 * ```
 *
 * @public
 */
export function useAutoSignin(
  options: UseAutoSigninOptions = {},
): Pick<AuthState, 'isAuthenticated' | 'isLoading' | 'error'> {
  const { signinMethod = 'signinRedirect', signinArgs } = options;
  const auth = useAuth();
  const hasTriedSignin = React.useRef(false);

  React.useEffect(() => {
    if (
      hasAuthParams() ||
      auth.isAuthenticated ||
      auth.activeNavigator ||
      auth.isLoading ||
      hasTriedSignin.current
    ) {
      return;
    }

    hasTriedSignin.current = true;
    switch (signinMethod) {
      case 'signinPopup':
        void auth.signinPopup(signinArgs);
        break;
      case 'signinRedirect':
      default:
        void auth.signinRedirect(signinArgs);
        break;
    }
  }, [auth, signinMethod, signinArgs]);

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
  };
}
