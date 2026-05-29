# Making API Calls

Once a user is signed in, the access token issued by ZITADEL lives on
`auth.user.access_token`. Attach it as a `Bearer` token to authorize requests
to your own API or to ZITADEL's endpoints.

## Basic fetch

```tsx
import { useAuth } from '@zitadel/react-auth';

function useApi() {
  const auth = useAuth();

  return async function call(path: string) {
    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${auth.user?.access_token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
  };
}
```

## Calling the ZITADEL userinfo endpoint

The OIDC userinfo endpoint returns the claims for the current token. It is a
convenient way to confirm the access token works end-to-end:

```tsx
const auth = useAuth();

const res = await fetch(
  `${import.meta.env.VITE_ZITADEL_DOMAIN}/oidc/v1/userinfo`,
  { headers: { Authorization: `Bearer ${auth.user?.access_token}` } },
);
const claims = await res.json();
```

## Token expiry

Access tokens are short-lived. With silent renewal enabled (see
[Silent Renew](../advanced/silent-renew.md)), the `UserManager` refreshes the
token in the background and the new value flows into `auth.user` automatically
— so always read `auth.user?.access_token` at call time rather than caching it
in a variable.
