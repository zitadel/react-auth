import React from 'react';
import type { SigninRedirectArgs } from 'oidc-client-ts';

import { RETURN_TO_KEY } from './components/SignInCallback.js';
import { useAuth } from './useAuth.js';
import { hasAuthParams } from './utils.js';

/**
 * Options for {@link withAuthenticationRequired}.
 *
 * @public
 */
export interface WithAuthenticationRequiredProps {
  /**
   * Rendered while the user is being redirected to the signin page.
   */
  OnRedirecting?: () => React.JSX.Element;

  /**
   * Runs immediately before the signin redirect is triggered.
   */
  onBeforeSignin?: () => Promise<void> | void;

  /**
   * Additional arguments passed to `signinRedirect()`.
   */
  signinRedirectArgs?: SigninRedirectArgs;
}

/**
 * A higher-order component that guards content behind authentication. When an
 * anonymous user visits the wrapped component, they are redirected to the
 * signin page and returned afterwards.
 *
 * @param Component - The component to protect.
 * @param options - Optional redirect behavior.
 * @returns The guarded component.
 *
 * @example
 * ```tsx
 * import { withAuthenticationRequired } from '@zitadel/react-auth';
 *
 * export default withAuthenticationRequired(ProfileView, {
 *   OnRedirecting: () => <div>Redirecting to login...</div>,
 * });
 * ```
 *
 * @public
 */
export const withAuthenticationRequired = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthenticationRequiredProps = {},
): React.FC<P> => {
  const {
    OnRedirecting = (): React.JSX.Element => <></>,
    onBeforeSignin,
    signinRedirectArgs,
  } = options;
  const displayName = `withAuthenticationRequired(${
    Component.displayName || Component.name
  })`;
  const C: React.FC<P> = (props) => {
    const auth = useAuth();

    React.useEffect(() => {
      if (
        hasAuthParams() ||
        auth.isLoading ||
        auth.activeNavigator ||
        auth.isAuthenticated
      ) {
        return;
      }
      void (async (): Promise<void> => {
        if (onBeforeSignin) {
          await onBeforeSignin();
        }
        sessionStorage.setItem(
          RETURN_TO_KEY,
          window.location.pathname + window.location.search,
        );
        await auth.signinRedirect(signinRedirectArgs);
      })();
    }, [auth.isLoading, auth.isAuthenticated, auth]);

    return auth.isAuthenticated ? <Component {...props} /> : OnRedirecting();
  };

  C.displayName = displayName;

  return C;
};
