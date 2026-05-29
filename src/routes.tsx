import type { RouteObject } from 'react-router-dom';

import { withAuthenticationRequired } from './withAuthenticationRequired.js';
import {
  Account,
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
} from './components/index.js';

const GuardedAccount = withAuthenticationRequired(Account);

/**
 * A ready-made `react-router-dom` route bundle wiring the bundled components
 * under the `/auth` prefix:
 *
 * - `/auth/signin` &rarr; {@link SignIn}
 * - `/auth/callback` &rarr; {@link SignInCallback} (your `redirect_uri`)
 * - `/auth/error` &rarr; {@link SignInError}
 * - `/auth/logout/callback` &rarr; {@link SignOutCallback}
 *   (your `post_logout_redirect_uri`)
 * - `/auth/account` &rarr; {@link Account}, guarded by
 *   {@link withAuthenticationRequired}
 *
 * Spread it into your router alongside your own routes.
 *
 * @example
 * ```tsx
 * import { createBrowserRouter } from 'react-router-dom';
 * import { zitadelRoutes } from '@zitadel/react-auth/routes';
 *
 * export const router = createBrowserRouter([
 *   { path: '/', element: <Home /> },
 *   ...zitadelRoutes,
 * ]);
 * ```
 *
 * @public
 */
export const zitadelRoutes: RouteObject[] = [
  { path: '/auth/signin', element: <SignIn /> },
  { path: '/auth/callback', element: <SignInCallback /> },
  { path: '/auth/error', element: <SignInError /> },
  { path: '/auth/logout/callback', element: <SignOutCallback /> },
  { path: '/auth/account', element: <GuardedAccount /> },
];
