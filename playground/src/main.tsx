import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { AuthProvider } from '@zitadel/react-auth';
import { zitadelRoutes } from '@zitadel/react-auth/routes';

import { Layout } from './Layout';
import { Home } from './pages/Home';
import Profile from './pages/Profile';
import { ApiDemo } from './pages/ApiDemo';

/**
 * Removes the `code`/`state` query parameters from the URL after the OIDC
 * authorization response has been processed, leaving a clean address bar.
 */
const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const appRoutes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      { path: '/api-demo', element: <ApiDemo /> },
    ],
  },
];

const router = createBrowserRouter([...appRoutes, ...zitadelRoutes]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
