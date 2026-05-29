# Introduction

`@zitadel/react-auth` is a thin, idiomatic React wrapper around
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts). It brings
OpenID Connect to single-page React applications using the **Authorization
Code Flow with PKCE** (Proof Key for Code Exchange).

## Why PKCE for SPAs

A single-page application runs entirely in the browser. It has no trusted
server-side place to keep a client secret, so the classic confidential-client
flow does not apply. PKCE solves this: the browser generates a random
`code_verifier`, derives a `code_challenge` from it, and sends only the
challenge to the authorization endpoint. The verifier never leaves the
browser until the code-for-token exchange, which proves the same client that
started the flow is finishing it.

The result is a secure login flow that needs **no client secret** in the
browser. You configure ZITADEL with a public client of type *User Agent* (or
*Web* with PKCE), and this library handles the redirect lifecycle for you.

## What this library does

- **Detects the authorization response** on return from ZITADEL and completes
  the code exchange automatically (see `hasAuthParams`).
- **Exposes reactive auth state** through the `useAuth` hook:
  `isAuthenticated`, `isLoading`, `user`, and `error`.
- **Guards routes** with `withAuthenticationRequired`.
- **Renews tokens silently** in a hidden iframe via the underlying
  `UserManager`.

It does **not** introduce a server, a session cookie, or a shared secret.
Everything happens client-side against your ZITADEL instance.

## Next steps

- [Installation](./installation.md)
- [Quick Start](../react/quick-start.md)
- [Configuration](../application-side/configuration.md)
