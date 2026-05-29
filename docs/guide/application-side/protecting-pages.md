# Protecting Pages

There are three ways to gate content behind authentication, depending on how
your component is written and whether you want a redirect or an automatic
sign-in.

## withAuthenticationRequired

The most common approach. This higher-order component wraps a page so that an
anonymous visitor is redirected to ZITADEL to sign in, then returned to the
page afterwards.

```tsx
import { withAuthenticationRequired } from '@zitadel/react-auth';

function ProfileView() {
  return <h1>Members only</h1>;
}

export default withAuthenticationRequired(ProfileView, {
  OnRedirecting: () => <div>Redirecting to login…</div>,
});
```

It will not trigger a redirect while a sign-in is already loading, while a
navigator request is in flight, or when the URL already carries an
authorization response.

## withAuth

For class components that cannot call hooks, {@link withAuth} injects the
imperative auth API as an `auth` prop:

```tsx
import { withAuth } from '@zitadel/react-auth';
import type { AuthContextProps } from '@zitadel/react-auth';

class Profile extends React.Component<{ auth: AuthContextProps }> {
  render() {
    return <div>{this.props.auth.user?.profile.sub}</div>;
  }
}

export default withAuth(Profile);
```

## useAutoSignin

To sign the user in automatically the moment the app loads unauthenticated —
useful for apps that have no public surface at all — use
{@link useAutoSignin}:

```tsx
import { useAutoSignin } from '@zitadel/react-auth';

function App() {
  const { isLoading, isAuthenticated } = useAutoSignin();
  if (isLoading) return <div>Signing in…</div>;
  return isAuthenticated ? <Home /> : <div>Unable to sign in</div>;
}
```

It attempts the sign-in once, using the redirect flow by default (the popup
flow is also supported; resource-owner credentials are not).
