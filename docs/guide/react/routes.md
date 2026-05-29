# Routes

{@link zitadelRoutes} is a ready-made `react-router-dom` route bundle that
wires the [bundled components](./components.md) under the `/auth` prefix.
Import it from `@zitadel/react-auth/routes` and spread it into your router.

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { zitadelRoutes } from '@zitadel/react-auth/routes';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  ...zitadelRoutes,
]);
```

> This entry point requires `react-router-dom`, which is an optional peer
> dependency. Install it to use these routes.

## The /auth bundle

| Path | Component | Purpose |
| --- | --- | --- |
| `/auth/signin` | `SignIn` | Sign-in method picker. |
| `/auth/callback` | `SignInCallback` | Your `redirect_uri` — completes the code exchange. |
| `/auth/error` | `SignInError` | Shows the error when sign-in fails. |
| `/auth/logout/callback` | `SignOutCallback` | Your `post_logout_redirect_uri`. |
| `/auth/account` | `Account` (guarded) | Profile page, behind `withAuthenticationRequired`. |

## Matching ZITADEL configuration

Two of these paths are not arbitrary — they must match what you registered in
ZITADEL and what you pass to {@link AuthProvider}:

- `/auth/callback` must equal your `redirect_uri` and be listed under
  **Redirect URIs** in the ZITADEL Console.
- `/auth/logout/callback` must equal your `post_logout_redirect_uri` and be
  listed under **Post Logout Redirect URIs**.

For a local SPA on port 3000, that means:

```dotenv
VITE_ZITADEL_REDIRECT_URI="http://localhost:3000/auth/callback"
VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI="http://localhost:3000/auth/logout/callback"
```

Because these are client-side routes, your static host must fall back to
`index.html` for unknown paths so the router can resolve them — see
[Hosting](../advanced/hosting.md).
