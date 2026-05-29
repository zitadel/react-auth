# Error Reference

When a sign-in, sign-out, or silent renewal fails, the failure is captured on
`auth.error` as an {@link ErrorContext}. This page explains its shape and the
underlying `oidc-client-ts` errors you are most likely to see.

## The ErrorContext shape

`ErrorContext` extends the standard `Error` (so it always has `name`,
`message`, and `stack`) and adds:

- **`innerError`** — the original thrown value, useful for inspecting the
  underlying `oidc-client-ts` error.
- **`source`** — a discriminant identifying which operation failed:
  `signinCallback`, `signoutCallback`, `renewSilent`, `signinRedirect`,
  `signinPopup`, `signinSilent`, `signinResourceOwnerCredentials`,
  `signoutRedirect`, `signoutPopup`, `signoutSilent`, or `unknown`.
- **`args`** — for the navigator sources (the `signin*`/`signout*` methods),
  the arguments that were passed to the call.

```tsx
import { useAuth } from '@zitadel/react-auth';

function ErrorBanner() {
  const { error } = useAuth();
  if (!error) return null;
  return (
    <pre>
      {error.source}: {error.message}
    </pre>
  );
}
```

## Common oidc-client-ts errors

These appear as `error.innerError` (and shape `error.message`):

| Symptom | Likely cause |
| --- | --- |
| `No matching state found in storage` | The browser lost the PKCE state between starting the flow and the callback — often a hard reload, a different tab, or cleared storage. |
| `State does not match` | The `state` returned by ZITADEL does not match what was stored; can indicate a stale or replayed callback. |
| `IFrame timed out without a response` | Silent renew failed — usually the ZITADEL session ended, or the `silent_redirect_uri` is misconfigured/blocked by a frame policy. |
| `login_required` / `interaction_required` | Silent renew or `prompt=none` could not proceed without user interaction; fall back to a full `signinRedirect()`. |
| `invalid_request` / `invalid_client` at the token endpoint | A misconfigured `client_id`, `redirect_uri`, or an app that is not set up as a PKCE public client. |
| Network/CORS failure to the issuer | Wrong `authority`, or the ZITADEL instance is unreachable from the browser. |

## Where errors surface

- A failed sign-in callback navigates to `/auth/error`, where the bundled
  `SignInError` component renders `error.source` and `error.message`.
- A failed silent renew sets `error.source === 'renewSilent'` but does not
  navigate — decide in your app whether to prompt a fresh sign-in.

For the full list of `oidc-client-ts` error types, see the
[oidc-client-ts ErrorResponse reference](https://authts.github.io/oidc-client-ts/classes/ErrorResponse.html).
