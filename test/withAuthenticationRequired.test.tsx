import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import { withAuthenticationRequired } from '../src/withAuthenticationRequired.js';
import { AuthProvider } from '../src/AuthProvider.js';
import { AuthContext, type AuthContextProps } from '../src/AuthContext.js';
import { RETURN_TO_KEY } from '../src/components/SignInCallback.js';
import {
  createFakeUserManager,
  neverResolvingRedirect,
  setLocation,
} from './helpers.js';

describe('withAuthenticationRequired', () => {
  it('should redirect to signin when the user is unauthenticated', async () => {
    const signinRedirect = neverResolvingRedirect();
    const userManager = createFakeUserManager({ signinRedirect });
    const Protected = withAuthenticationRequired(() => <div>secret</div>);

    render(
      <AuthProvider userManager={userManager}>
        <Protected />
      </AuthProvider>,
    );

    await waitFor(() => expect(signinRedirect).toHaveBeenCalled());
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('should render the component when the user is authenticated', async () => {
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => ({
        expired: false,
        profile: { sub: 'user-1' },
      })),
    });
    const Protected = withAuthenticationRequired(() => <div>secret</div>);

    render(
      <AuthProvider userManager={userManager}>
        <Protected />
      </AuthProvider>,
    );

    await screen.findByText('secret');
  });

  it('should render the OnRedirecting fallback while redirecting', async () => {
    const signinRedirect = neverResolvingRedirect();
    const userManager = createFakeUserManager({ signinRedirect });
    const Protected = withAuthenticationRequired(() => <div>secret</div>, {
      OnRedirecting: () => <div>redirecting</div>,
    });

    render(
      <AuthProvider userManager={userManager}>
        <Protected />
      </AuthProvider>,
    );

    await screen.findByText('redirecting');
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('should call onBeforeSignin before redirecting', async () => {
    const signinRedirect = neverResolvingRedirect();
    const userManager = createFakeUserManager({ signinRedirect });
    const onBeforeSignin = jest.fn(async () => undefined);
    const Protected = withAuthenticationRequired(() => <div>secret</div>, {
      onBeforeSignin,
    });

    render(
      <AuthProvider userManager={userManager}>
        <Protected />
      </AuthProvider>,
    );

    await waitFor(() => expect(onBeforeSignin).toHaveBeenCalled());
    await waitFor(() => expect(signinRedirect).toHaveBeenCalled());
  });

  it('should skip redirecting while loading or with auth params', async () => {
    const signinRedirect = jest.fn(async () => undefined);
    const auth = {
      isLoading: true,
      isAuthenticated: false,
      activeNavigator: undefined,
      signinRedirect,
    } as unknown as AuthContextProps;
    const Protected = withAuthenticationRequired(() => <div>secret</div>);

    render(
      <AuthContext.Provider value={auth}>
        <Protected />
      </AuthContext.Provider>,
    );

    await waitFor(() => undefined);
    expect(signinRedirect).not.toHaveBeenCalled();
  });

  it('should store the return path before redirecting', async () => {
    sessionStorage.clear();
    const restore = setLocation('?foo=bar');
    const signinRedirect = neverResolvingRedirect();
    const userManager = createFakeUserManager({ signinRedirect });
    const Protected = withAuthenticationRequired(() => <div>secret</div>);

    render(
      <AuthProvider userManager={userManager}>
        <Protected />
      </AuthProvider>,
    );

    await waitFor(() => expect(signinRedirect).toHaveBeenCalled());
    expect(sessionStorage.getItem(RETURN_TO_KEY)).toBe(
      window.location.pathname + '?foo=bar',
    );
    restore();
  });
});
