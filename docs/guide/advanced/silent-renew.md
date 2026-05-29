# Silent Renew

Access tokens are deliberately short-lived. To keep a session alive without
forcing the user through another redirect, `oidc-client-ts` can renew tokens
silently in a hidden iframe. The library wires the resulting events straight
into auth state, so renewed tokens reach your components with no manual
subscription.

## Enabling it

Silent renewal is a `UserManagerSettings` concern, so you enable it through
the same inline props on `AuthProvider`:

```tsx
<AuthProvider
  authority={import.meta.env.VITE_ZITADEL_DOMAIN}
  client_id={import.meta.env.VITE_ZITADEL_CLIENT_ID}
  redirect_uri={import.meta.env.VITE_ZITADEL_REDIRECT_URI}
  post_logout_redirect_uri={
    import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI
  }
  scope="openid profile email"
  automaticSilentRenew={true}
  silent_redirect_uri={`${window.location.origin}/auth/silent-renew`}
>
  <App />
</AuthProvider>
```

- **`automaticSilentRenew`** — when `true`, the `UserManager` schedules a
  silent renewal shortly before the access token expires.
- **`silent_redirect_uri`** — the URL loaded inside the hidden iframe. It must
  be registered as a Redirect URI in ZITADEL, just like `redirect_uri`.

## How it works

1. Before expiry, the `UserManager` opens a hidden iframe pointing at the
   authorization endpoint with `prompt=none`.
2. ZITADEL, seeing an active session, returns a fresh code without any UI.
3. The iframe lands on `silent_redirect_uri`, the code is exchanged, and a
   `UserLoaded` event fires.
4. The provider dispatches that event into auth state; `auth.user` now carries
   the new `access_token`.

If renewal fails — for example because the ZITADEL session has ended — a
`renewSilent` error is surfaced on `auth.error` (see the
[Error Reference](../../resources/error-reference.md)).

> Because the renewal happens in an iframe, your hosting must allow the app to
> be framed by itself. If you send `X-Frame-Options: DENY`, scope it so the
> silent-renew route is still frameable from the same origin.
