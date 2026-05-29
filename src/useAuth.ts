import React from 'react';

import { AuthContext, type AuthContextProps } from './AuthContext.js';

/**
 * Returns the current authentication state and the `UserManager`
 * navigation/lifecycle methods. Must be called from within an
 * {@link AuthProvider}.
 *
 * @returns The auth state merged with the auth methods.
 *
 * @example
 * ```tsx
 * import { useAuth } from '@zitadel/react-auth';
 *
 * function LoginButton() {
 *   const auth = useAuth();
 *   if (auth.isAuthenticated) {
 *     return <button onClick={() => void auth.signoutRedirect()}>Log out</button>;
 *   }
 *   return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
 * }
 * ```
 *
 * @public
 */
export const useAuth = (): AuthContextProps => {
  const context = React.useContext(AuthContext);

  if (!context) {
    console.warn(
      'AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.',
    );
  }

  return context as AuthContextProps;
};
