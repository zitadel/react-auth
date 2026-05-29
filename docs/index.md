---
layout: home

hero:
  name: '@zitadel/react-auth'
  text: 'PKCE OIDC for React SPAs'
  tagline: Authorization Code Flow with PKCE for single-page React applications, built on oidc-client-ts.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started/introduction
    - theme: alt
      text: Quick Start
      link: /guide/react/quick-start

features:
  - title: PKCE, no client secret
    details: Public-client Authorization Code Flow with Proof Key for Code Exchange. Nothing secret ever ships to the browser.
  - title: Reactive auth state
    details: A useAuth() hook surfaces isAuthenticated, isLoading, user, and error as plain reactive values.
  - title: Route protection
    details: withAuthenticationRequired guards components; unauthenticated users are redirected to sign in and returned afterwards.
  - title: Drop-in routes
    details: Spread zitadelRoutes into your react-router-dom router to wire /auth/signin, /auth/callback, /auth/error, /auth/logout/callback, and /auth/account.
  - title: Silent renewal
    details: Tokens are renewed in a hidden iframe via the oidc-client-ts UserManager, with renewed tokens flowing straight into auth state.
  - title: TypeScript first
    details: Fully typed API surface, compatible in shape with react-oidc-context.
---
