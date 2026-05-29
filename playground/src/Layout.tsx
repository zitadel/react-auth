import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@zitadel/react-auth';

/**
 * Shared chrome for the playground: a navigation bar reflecting auth state
 * plus the routed page content via {@link Outlet}.
 */
export const Layout = (): React.JSX.Element => {
  const auth = useAuth();

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        margin: '2rem auto',
        maxWidth: 720,
      }}
    >
      <header
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
          paddingBottom: '1rem',
        }}
      >
        <nav style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/api-demo">API Demo</Link>
        </nav>
        {auth.isLoading ? (
          <span>Loading…</span>
        ) : auth.isAuthenticated ? (
          <button onClick={() => void auth.signoutRedirect()}>Sign out</button>
        ) : (
          <button onClick={() => void auth.signinRedirect()}>Sign in</button>
        )}
      </header>
      <main style={{ paddingTop: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
