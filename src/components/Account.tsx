import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../useAuth.js';

/**
 * Displays the authenticated user's profile and a sign-out action. Intended
 * to be mounted behind `withAuthenticationRequired` at a route such as
 * `/auth/account`.
 *
 * @public
 */
export const Account = (): React.JSX.Element => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return (
      <p>
        You are not authenticated. Please <Link to="/auth/signin">sign in</Link>
        .
      </p>
    );
  }

  return (
    <section>
      <h1>Account</h1>
      <dl>
        <dt>Subject</dt>
        <dd>{auth.user?.profile.sub}</dd>
        <dt>Name</dt>
        <dd>{auth.user?.profile.name ?? '—'}</dd>
        <dt>Email</dt>
        <dd>{auth.user?.profile.email ?? '—'}</dd>
      </dl>
      <pre>
        <code>{JSON.stringify(auth.user?.profile, null, 2)}</code>
      </pre>
      <button onClick={() => void auth.signoutRedirect()}>Sign out</button>
    </section>
  );
};
