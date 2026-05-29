# React SPA with ZITADEL

This is a [Vite](https://vite.dev/) + [React](https://react.dev/) single-page
application that authenticates users against ZITADEL entirely in the browser,
using the [`@zitadel/react-auth`](https://github.com/zitadel/react-auth)
library.

Authentication uses the **OpenID Connect (OIDC)** protocol with the
**Authorization Code Flow + PKCE** (Proof Key for Code Exchange). This is the
industry-best practice for public clients such as SPAs: the browser proves it
started the flow without ever holding a client secret. You can learn more in
the [guide to OAuth 2.0 recommended flows](https://zitadel.com/docs/guides/integrate/login/oidc/oauth-recommended-flows).

Unlike a server-rendered example, there is **no client secret, no session
secret, and no backend** — `@zitadel/react-auth` wraps
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts) and manages the
redirect lifecycle, token storage, and silent renewal client-side.

## What it demonstrates

- A public **Home** page (`/`) with a sign-in button and live auth status.
- A protected **Profile** page (`/profile`), guarded with
  `withAuthenticationRequired`, showing the user's ID-token profile claims.
- An **API Demo** page (`/api-demo`) that calls ZITADEL's `/oidc/v1/userinfo`
  endpoint with the access token as a `Bearer` credential.
- The bundled `/auth/*` routes (`/auth/signin`, `/auth/callback`,
  `/auth/error`, `/auth/logout/callback`, `/auth/account`), wired by spreading
  `zitadelRoutes` into the router.

## Prerequisites

### System Requirements

- Node.js v24 or later (managed via [Devbox](https://www.jetify.com/devbox);
  run commands with `devbox run -- ...`).
- npm.

### ZITADEL application setup

You need a ZITADEL instance and an application configured as a **User Agent**
(SPA) application using the **Authorization Code + PKCE** flow — a _public_
client with **no secret**. Follow the
[ZITADEL documentation on creating applications](https://zitadel.com/docs/guides/integrate/login/oidc/web-app)
and select the PKCE option.

> **Important:** Configure the following URLs in your ZITADEL application
> settings, and make sure they match your `.env` exactly:
>
> - **Redirect URIs:** `http://localhost:3000/auth/callback`
> - **Post Logout Redirect URIs:** `http://localhost:3000/auth/logout/callback`
>
> For production, add your production equivalents.

## Configuration

Copy the example file and fill in your ZITADEL values. Every variable is
prefixed `VITE_` because it ships to the browser — and that is fine, since a
PKCE public client has no secrets.

```bash
cp .env.example .env
```

```dotenv
# The full domain URL of your ZITADEL instance (the OIDC issuer).
VITE_ZITADEL_DOMAIN="https://your-zitadel-domain"

# The Client ID of your ZITADEL SPA (PKCE) application.
VITE_ZITADEL_CLIENT_ID="your-zitadel-application-client-id"

# Where ZITADEL redirects after authentication. Must match a Redirect URI.
VITE_ZITADEL_REDIRECT_URI="http://localhost:3000/auth/callback"

# Where ZITADEL redirects after logout. Must match a Post Logout Redirect URI.
VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI="http://localhost:3000/auth/logout/callback"

# Space-separated OIDC scopes requested at sign-in.
VITE_ZITADEL_SCOPE="openid profile email"
```

There is intentionally **no** `*_SECRET` of any kind.

## Installation and Running

```bash
# 1. Install dependencies (this resolves @zitadel/react-auth from "file:..")
devbox run -- npm install

# 2. Start the development server
devbox run -- npm run dev
# or
make start
```

The application will be running at `http://localhost:3000`.

## How it consumes the library

`package.json` pulls the library in from the parent directory:

```json
"@zitadel/react-auth": "file:.."
```

`src/main.tsx` wraps the app in `<AuthProvider>` with the `VITE_ZITADEL_*`
configuration and an `onSigninCallback` that strips the `code`/`state` query
parameters from the URL after login, then builds the router by spreading both
the app routes and `zitadelRoutes`:

```ts
const router = createBrowserRouter([...appRoutes, ...zitadelRoutes]);
```

## Hosting note

Because routes such as `/auth/callback` are resolved client-side, any static
host must fall back to `index.html` for unknown paths (SPA history fallback).
The Vite dev server does this automatically.

## Resources

- **@zitadel/react-auth:** <https://github.com/zitadel/react-auth>
- **oidc-client-ts:** <https://github.com/authts/oidc-client-ts>
- **Vite:** <https://vite.dev/>
- **ZITADEL Documentation:** <https://zitadel.com/docs>
