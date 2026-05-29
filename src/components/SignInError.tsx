import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../useAuth.js';

/**
 * Displays the most recent authentication error. Mount this at a route such
 * as `/auth/error`; {@link SignInCallback} navigates here when the code
 * exchange fails.
 *
 * @public
 */
export const SignInError = (): React.JSX.Element => {
  const auth = useAuth();

  return (
    <section>
      <h1>Sign-in failed</h1>
      {auth.error ? (
        <pre>
          <code>
            {auth.error.source}: {auth.error.message}
          </code>
        </pre>
      ) : (
        <p>An unknown error occurred.</p>
      )}
      <p>
        <Link to="/auth/signin">Back to sign in</Link>
      </p>
    </section>
  );
};
