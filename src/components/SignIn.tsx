import React from 'react';

import { useAuth } from '../useAuth.js';
import { RETURN_TO_KEY } from './SignInCallback.js';

/**
 * Props for {@link SignIn}.
 *
 * @public
 */
export interface SignInProps {
  /**
   * Where to navigate after a successful sign-in. Persisted to session
   * storage and read back by {@link SignInCallback}. Defaults to `/`.
   */
  returnTo?: string;
}

/**
 * A sign-in method picker offering redirect, popup, and silent flows, plus a
 * sign-out action when already authenticated. Mount this at a route such as
 * `/auth/signin`.
 *
 * @public
 */
export const SignIn = ({ returnTo }: SignInProps = {}): React.JSX.Element => {
  const auth = useAuth();

  const rememberReturn = (): void => {
    if (returnTo) {
      window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    }
  };

  if (auth.isAuthenticated) {
    return (
      <section>
        <p>You are signed in as {auth.user?.profile.sub}.</p>
        <button onClick={() => void auth.signoutRedirect()}>Sign out</button>
      </section>
    );
  }

  return (
    <section>
      <h1>Sign in</h1>
      <button
        onClick={() => {
          rememberReturn();
          void auth.signinRedirect();
        }}
      >
        Sign in with redirect
      </button>
      <button
        onClick={() => {
          rememberReturn();
          void auth.signinPopup();
        }}
      >
        Sign in with popup
      </button>
      <button onClick={() => void auth.signinSilent()}>Sign in silently</button>
    </section>
  );
};
