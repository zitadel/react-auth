# Hosting

A `@zitadel/react-auth` application is a plain single-page app: a bundle of
static files (`index.html`, JS, CSS, assets) with no server component. You can
host it on any static host — Netlify, Vercel, Cloudflare Pages, S3 +
CloudFront, GitHub Pages, nginx, and so on.

## History fallback is required

The library relies on client-side routes such as `/auth/callback` and
`/auth/logout/callback`. When ZITADEL redirects the browser straight to
`https://app.example.com/auth/callback`, the static host receives a request
for a file that does not exist on disk. Without configuration it returns a
404, and the router never gets a chance to run.

The fix is the standard SPA **history fallback**: serve `index.html` for any
path that does not match a real file, so the React Router can resolve the
route in the browser.

### Examples

**Netlify** (`_redirects` or `netlify.toml`):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**nginx**:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Redirect URIs in production

Register your production callback URLs in the ZITADEL Console and pass them to
{@link AuthProvider}:

- `https://app.example.com/auth/callback` as a **Redirect URI**.
- `https://app.example.com/auth/logout/callback` as a **Post Logout Redirect
  URI**.

Always serve over HTTPS in production — the authorization response and tokens
must not travel over plain HTTP.

## Security headers

Set sensible headers at the host level: a `Content-Security-Policy`, a
`Referrer-Policy`, and frame controls. If you use
[silent renew](./silent-renew.md), make sure your frame policy still allows
the app to frame its own silent-renew route.
