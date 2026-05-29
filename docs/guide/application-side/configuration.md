# Configuration

Authentication is configured by wrapping your application in
`AuthProvider` and passing
[`UserManagerSettings`](https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html)
inline alongside the provider's own props.

## AuthProvider props

In its default form, `AuthProvider` accepts every `UserManagerSettings` field
directly, plus a small set of lifecycle hooks:

| Prop | Description |
| --- | --- |
| `authority` | Your ZITADEL instance URL (the OIDC issuer). |
| `client_id` | The application's Client ID from the ZITADEL Console. |
| `redirect_uri` | Where ZITADEL returns after login. Must match a configured Redirect URI. |
| `post_logout_redirect_uri` | Where ZITADEL returns after logout. Must match a Post Logout Redirect URI. |
| `scope` | Space-separated scopes, e.g. `openid profile email`. |
| `onSigninCallback` | Hook to clean `code`/`state` from the URL after the callback. |
| `skipSigninCallback` | Skip the automatic callback when the params belong to another SDK. |
| `matchSignoutCallback` | Predicate detecting a return from the logout redirect. |
| `onSignoutCallback` | Hook invoked after a successful signout callback. |
| `onRemoveUser` | Hook invoked after `removeUser()`. |

Alternatively, pass a pre-constructed `UserManager` instance via the
`userManager` prop instead of inline settings.

## Example

```tsx
import { AuthProvider } from '@zitadel/react-auth';

const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      authority={import.meta.env.VITE_ZITADEL_DOMAIN}
      client_id={import.meta.env.VITE_ZITADEL_CLIENT_ID}
      redirect_uri={import.meta.env.VITE_ZITADEL_REDIRECT_URI}
      post_logout_redirect_uri={
        import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI
      }
      scope={import.meta.env.VITE_ZITADEL_SCOPE ?? 'openid profile email'}
      onSigninCallback={onSigninCallback}
    >
      {children}
    </AuthProvider>
  );
}
```

## Environment variables

In a Vite SPA, configuration is read from `import.meta.env`. Only variables
prefixed with `VITE_` are exposed to client code, which is exactly what you
want here — there are no secrets to hide.

```dotenv
VITE_ZITADEL_DOMAIN="https://your-instance.zitadel.cloud"
VITE_ZITADEL_CLIENT_ID="your-client-id"
VITE_ZITADEL_REDIRECT_URI="http://localhost:3000/auth/callback"
VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI="http://localhost:3000/auth/logout/callback"
VITE_ZITADEL_SCOPE="openid profile email"
```

There is no client secret and no session secret: a PKCE public client needs
neither.
