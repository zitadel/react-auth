# Quick Start

This walks through a complete, minimal integration: wrap the app in
`AuthProvider`, spread `zitadelRoutes` into a router, protect a
page, and add a sign-in button.

## 1. Wrap the app and build the router

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@zitadel/react-auth';
import { zitadelRoutes } from '@zitadel/react-auth/routes';

import { Home } from './Home';
import Profile from './Profile';

const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/profile', element: <Profile /> },
  ...zitadelRoutes,
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider
      authority={import.meta.env.VITE_ZITADEL_DOMAIN}
      client_id={import.meta.env.VITE_ZITADEL_CLIENT_ID}
      redirect_uri={import.meta.env.VITE_ZITADEL_REDIRECT_URI}
      post_logout_redirect_uri={
        import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI
      }
      scope="openid profile email"
      onSigninCallback={onSigninCallback}
    >
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
```

Spreading `zitadelRoutes` wires the entire `/auth/*` bundle: `/auth/signin`,
`/auth/callback`, `/auth/error`, `/auth/logout/callback`, and `/auth/account`.

## 2. Add a sign-in button on a public page

```tsx
// src/Home.tsx
import { useAuth } from '@zitadel/react-auth';

export function Home() {
  const auth = useAuth();

  if (auth.isLoading) return <p>Loading…</p>;

  return auth.isAuthenticated ? (
    <button onClick={() => void auth.signoutRedirect()}>Sign out</button>
  ) : (
    <button onClick={() => void auth.signinRedirect()}>Sign in</button>
  );
}
```

## 3. Protect a page

```tsx
// src/Profile.tsx
import { withAuthenticationRequired, useAuth } from '@zitadel/react-auth';

function ProfileView() {
  const auth = useAuth();
  return <pre>{JSON.stringify(auth.user?.profile, null, 2)}</pre>;
}

export default withAuthenticationRequired(ProfileView);
```

## 4. Configure ZITADEL

In your ZITADEL application, set the Redirect URI to
`http://localhost:3000/auth/callback` and the Post Logout Redirect URI to
`http://localhost:3000/auth/logout/callback` — these must match
`redirect_uri` and `post_logout_redirect_uri` exactly.

That's the whole flow. See [Routes](./routes.md) for the path bundle and
[Components](./components.md) for the bundled UI.
