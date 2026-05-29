# Session Access

The {@link useAuth} hook is the single entry point for reading authentication
state and driving sign-in/sign-out. It must be called from within an
{@link AuthProvider}.

## Reading state

```tsx
import { useAuth } from '@zitadel/react-auth';

function Status() {
  const auth = useAuth();

  if (auth.isLoading) return <p>Loading…</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  return auth.isAuthenticated ? (
    <p>Signed in as {auth.user?.profile.sub}</p>
  ) : (
    <button onClick={() => void auth.signinRedirect()}>Sign in</button>
  );
}
```

The most useful fields:

| Field | Description |
| --- | --- |
| `isAuthenticated` | `true` while the user has a valid access token. |
| `isLoading` | `true` until the provider has initialized and no navigator request is in flight. |
| `user` | The current `User`, or `null`/`undefined` when not authenticated. |
| `error` | The most recent signin, signout, or silent-renew error, if any. |
| `signinRedirect()` | Start the redirect sign-in flow. |
| `signoutRedirect()` | Start the redirect sign-out flow. |

The methods of the underlying `UserManager` — `signinPopup`, `signinSilent`,
`querySessionStatus`, `revokeTokens`, `startSilentRenew`, and so on — are also
surfaced on the same object.

## Reading the access token

The `user` object carries the tokens issued by ZITADEL. To call a protected
API, read `user.access_token` and send it as a Bearer token:

```tsx
const auth = useAuth();

const res = await fetch('https://api.example.com/me', {
  headers: { Authorization: `Bearer ${auth.user?.access_token}` },
});
```

See [Making API Calls](../react/api-calls.md) for the full pattern.

## hasAuthParams

{@link hasAuthParams} reports whether the current URL is an OIDC authorization
response (a `code`/`error` together with `state`, in either the query string
or the fragment). It is what the provider uses internally to decide whether to
run the callback, and it is handy when wiring your own auto-sign-in logic:

```tsx
import { hasAuthParams, useAuth } from '@zitadel/react-auth';

const auth = useAuth();
if (!hasAuthParams() && !auth.isAuthenticated && !auth.isLoading) {
  void auth.signinRedirect();
}
```
