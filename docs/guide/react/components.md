# Components

The library ships five small, unstyled components under
`@zitadel/react-auth/components`. They are wired together by
{@link zitadelRoutes}, but you can also mount them individually.

```tsx
import {
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
  Account,
} from '@zitadel/react-auth/components';
```

## SignIn

A sign-in method picker offering redirect, popup, and silent flows, plus a
sign-out action when already authenticated. Mount at `/auth/signin`. Accepts
an optional `returnTo` prop, persisted to session storage and read back by
`SignInCallback` after login.

## SignInCallback

Handles the OIDC sign-in callback. Mount at the route matching your
`redirect_uri` (e.g. `/auth/callback`). The provider performs the code
exchange; this component waits for it to resolve, then navigates to the stored
return path (or `/`), or to `/auth/error` on failure.

## SignInError

Displays the most recent authentication error. Mount at `/auth/error`;
`SignInCallback` navigates here when the code exchange fails.

## SignOutCallback

Handles the post-logout redirect. Mount at the route matching your
`post_logout_redirect_uri` (e.g. `/auth/logout/callback`). Once the auth state
settles, it navigates back to the application root.

## Account

Displays the authenticated user's profile claims and a sign-out action.
Intended to be mounted behind {@link withAuthenticationRequired} at a route
such as `/auth/account` — which is exactly how `zitadelRoutes` wires it.

> These components depend on `react-router-dom` for navigation. If you do not
> use it, build your own equivalents around {@link useAuth}.
