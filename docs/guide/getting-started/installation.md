# Installation

Install the library together with its peer dependencies:

```bash
npm i @zitadel/react-auth oidc-client-ts react-router-dom
```

- **`@zitadel/react-auth`** — this library.
- **`oidc-client-ts`** — the underlying OIDC client. It is a peer dependency,
  so you install it directly and the library reuses your copy.
- **`react-router-dom`** — required only if you use the bundled
  {@link zitadelRoutes} or the routing-aware components. It is an *optional*
  peer dependency; omit it if you wire navigation yourself.

`react` and `react-dom` (18 or 19) are also peer dependencies and are
expected to already be present in any React application.

## Requirements

- Node.js 24 or later for the toolchain.
- A ZITADEL instance with a public client configured for the Authorization
  Code Flow with PKCE.

## Next steps

- [Configuration](../application-side/configuration.md)
- [Quick Start](../react/quick-start.md)
