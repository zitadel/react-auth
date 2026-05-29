import React from 'react';
import { useAuth } from '@zitadel/react-auth';

/**
 * Public landing page. Shows the current authentication status and a button
 * to start the PKCE redirect sign-in (or sign out when already authenticated).
 */
export const Home = (): React.JSX.Element => {
  const auth = useAuth();

  return (
    <section>
      <h1>@zitadel/react-auth playground</h1>
      <p>
        A single-page React app using the Authorization Code Flow with PKCE. No
        client secret, no server — everything runs in the browser against your
        ZITADEL instance.
      </p>

      {auth.isLoading ? (
        <p>Checking your session…</p>
      ) : auth.error ? (
        <p>Auth error: {auth.error.message}</p>
      ) : auth.isAuthenticated ? (
        <>
          <p>
            You are signed in as <strong>{auth.user?.profile.sub}</strong>.
          </p>
          <button onClick={() => void auth.signoutRedirect()}>Sign out</button>
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <button onClick={() => void auth.signinRedirect()}>Sign in</button>
        </>
      )}
    </section>
  );
};
