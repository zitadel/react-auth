import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../useAuth.js';

/**
 * Handles the post-logout redirect. Mount this at the route matching your
 * `post_logout_redirect_uri` (e.g. `/auth/logout/callback`). Once the auth
 * state has settled, it navigates back to the application root.
 *
 * @public
 */
export const SignOutCallback = (): React.JSX.Element => {
  const auth = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!auth.isLoading) {
      void navigate('/', { replace: true });
    }
  }, [auth.isLoading, navigate]);

  return <p>Signing you out&hellip;</p>;
};
