# React Auth

A [React](https://react.dev/) integration that provides seamless
authentication for single-page applications using OpenID Connect with the
Authorization Code flow and PKCE, session management, and idiomatic React
context and hooks.

This integration brings the power and flexibility of OIDC to React
applications with full TypeScript support, built on top of
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts), and an API
surface compatible with `react-oidc-context`.

### Why?

Modern single-page applications require robust, secure, and flexible
authentication systems. Integrating OIDC and session management with a React
application requires careful consideration of the browser redirect lifecycle,
silent token renewal, and TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **Browser Redirect Lifecycle:** OIDC sign-in operates through full browser
  navigations to the identity provider and back. A proper integration should
  detect the authorization response on return, complete the code exchange, and
  clean the authorization parameters from the URL automatically.
- **Reactive Auth State:** React components need to react to authentication
  state without boilerplate. The `useAuth()` hook exposes `isAuthenticated`,
  `isLoading`, `user`, and `error` as plain values that drive re-renders.
- **Route Protection:** Many applications need to gate routes behind
  authentication. `withAuthenticationRequired()` wraps a component so that
  unauthenticated users are redirected to sign in before it renders.
- **Token Renewal:** Long-lived sessions require silent renewal in a hidden
  iframe. This integration wires the `oidc-client-ts` `UserManager` events so
  renewed tokens flow into auth state with zero manual subscription.

This integration, `@zitadel/react-auth`, aims to provide the flexibility to
handle such scenarios. It allows you to leverage the OIDC ecosystem while
maintaining React best practices, ultimately leading to a more effective and
less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/react-auth oidc-client-ts
```

## Usage

To use this integration, wrap your application in `<AuthProvider>` with your
OIDC configuration. Configuration field names follow the `oidc-client-ts`
`UserManagerSettings` shape.

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@zitadel/react-auth';
import App from './App';

const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider
      authority={import.meta.env.VITE_ZITADEL_DOMAIN}
      client_id={import.meta.env.VITE_ZITADEL_CLIENT_ID}
      redirect_uri={import.meta.env.VITE_ZITADEL_CALLBACK_URL}
      post_logout_redirect_uri={import.meta.env.VITE_ZITADEL_POST_LOGOUT_URL}
      scope="openid profile email offline_access"
      onSigninCallback={onSigninCallback}
    >
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

#### Using the Authentication System

The integration provides several hooks, components, and helpers for handling
authentication:

**Hooks and Components:**

- `AuthProvider`: Provides auth state and the configured `UserManager` to the
  React tree
- `useAuth()`: Returns the current auth state and navigation methods
- `useAutoSignin()`: Triggers sign-in automatically on first load
- `withAuthenticationRequired(Component)`: Guards a component behind sign-in
- `withAuth(Component)`: Injects auth state as a prop into class components
- `hasAuthParams()`: Detects an OIDC authorization response in the current URL

**Bundled UI Components:**

- `SignIn`, `SignInCallback`, `SignInError`, `SignOutCallback`, `Account`

**Bundled Routes (optional, requires `react-router-dom`):**

- `zitadelRoutes`: A ready-made route bundle under `/auth` wiring the bundled
  components (`/auth/signin`, `/auth/callback`, `/auth/error`,
  `/auth/logout/callback`, `/auth/account`)

**Basic Usage in a Component:**

```tsx
import { useAuth } from '@zitadel/react-auth';

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {auth.user?.profile.sub}{' '}
        <button onClick={() => void auth.signoutRedirect()}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}
```

**Protecting a Route:**

```tsx
import { withAuthenticationRequired } from '@zitadel/react-auth';
import ProfileView from './ProfileView';

export default withAuthenticationRequired(ProfileView);
```

##### Example: Advanced Configuration with Multiple Providers

This example shows how to wire the bundled `/auth` route bundle into
`react-router-dom`, while keeping your own application routes:

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { zitadelRoutes } from '@zitadel/react-auth';
import IndexView from './IndexView';

export const router = createBrowserRouter([
  { path: '/', element: <IndexView /> },
  ...zitadelRoutes,
]);
```

With the bundle mounted, configure your Zitadel application's redirect URIs to
`[origin]/auth/callback` and post-logout redirect to
`[origin]/auth/logout/callback`.

## Known Issues

- **Client-Side Only:** This integration runs entirely in the browser and
  performs the Authorization Code flow with PKCE. It does not require, and does
  not provide, a server-side session store.
- **Callback URLs:** Your Zitadel application must be configured with the
  correct redirect URI matching `redirect_uri` (e.g. `[origin]/auth/callback`)
  and post-logout redirect URI matching `post_logout_redirect_uri`.
- **URL Cleanup:** Provide an `onSigninCallback` handler that removes the
  authorization `code` and `state` parameters from the URL after the redirect,
  otherwise silent renewal may misbehave.
- **No Client Secret:** PKCE public clients must never be configured with a
  client secret; do not ship one in browser-exposed environment variables.

## Useful links

- **[oidc-client-ts](https://github.com/authts/oidc-client-ts):** The
  underlying OIDC client this integration builds on.
- **[React](https://react.dev/):** The framework this integration targets.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
