import React from 'react';
import { useAuth } from '@zitadel/react-auth';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: unknown }
  | { status: 'error'; message: string };

/**
 * Demonstrates calling a protected API with the access token. It sends
 * `user.access_token` as a Bearer token to ZITADEL's OIDC userinfo endpoint
 * and renders the JSON response.
 */
export const ApiDemo = (): React.JSX.Element => {
  const auth = useAuth();
  const [state, setState] = React.useState<State>({ status: 'idle' });

  const callUserinfo = async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(
        `${import.meta.env.VITE_ZITADEL_DOMAIN}/oidc/v1/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${auth.user?.access_token}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
      const data: unknown = await res.json();
      setState({ status: 'ok', data });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <section>
      <h1>API Demo</h1>
      <p>
        Calls the ZITADEL <code>/oidc/v1/userinfo</code> endpoint using your
        access token as a Bearer credential.
      </p>

      {!auth.isAuthenticated ? (
        <p>Sign in first to obtain an access token.</p>
      ) : (
        <button
          disabled={state.status === 'loading'}
          onClick={() => void callUserinfo()}
        >
          {state.status === 'loading' ? 'Calling…' : 'Call userinfo'}
        </button>
      )}

      {state.status === 'error' && <p>Error: {state.message}</p>}
      {state.status === 'ok' && (
        <pre>
          <code>{JSON.stringify(state.data, null, 2)}</code>
        </pre>
      )}
    </section>
  );
};
