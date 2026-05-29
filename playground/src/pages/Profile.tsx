import React from 'react';
import { withAuthenticationRequired, useAuth } from '@zitadel/react-auth';

/**
 * Renders the authenticated user's ID-token profile claims.
 */
const ProfileView = (): React.JSX.Element => {
  const auth = useAuth();
  const profile = auth.user?.profile;

  return (
    <section>
      <h1>Profile</h1>
      <dl>
        <dt>Subject</dt>
        <dd>{profile?.sub}</dd>
        <dt>Name</dt>
        <dd>{profile?.name ?? '—'}</dd>
        <dt>Email</dt>
        <dd>{profile?.email ?? '—'}</dd>
      </dl>
      <pre>
        <code>{JSON.stringify(profile, null, 2)}</code>
      </pre>
    </section>
  );
};

/**
 * The profile page, guarded so anonymous visitors are redirected to sign in
 * and returned here afterwards.
 */
export default withAuthenticationRequired(ProfileView, {
  OnRedirecting: () => <p>Redirecting to sign in…</p>,
});
