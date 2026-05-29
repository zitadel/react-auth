import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import type { User } from 'oidc-client-ts';

import { SignIn } from '../../src/components/SignIn.js';
import { RETURN_TO_KEY } from '../../src/components/SignInCallback.js';
import { AuthContext, type AuthContextProps } from '../../src/AuthContext.js';

const makeAuth = (
  overrides: Partial<AuthContextProps> = {},
): AuthContextProps =>
  ({
    isAuthenticated: false,
    user: undefined,
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined),
    signinSilent: jest.fn(async () => undefined),
    signoutRedirect: jest.fn(async () => undefined),
    ...overrides,
  }) as unknown as AuthContextProps;

const renderSignIn = (auth: AuthContextProps, returnTo?: string): void => {
  render(
    <AuthContext.Provider value={auth}>
      <SignIn returnTo={returnTo} />
    </AuthContext.Provider>,
  );
};

describe('SignIn', () => {
  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('should render the sign-in options when unauthenticated', () => {
    const auth = makeAuth();
    renderSignIn(auth);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Sign in with redirect' }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Sign in with popup' }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Sign in silently' }),
    ).toBeDefined();
  });

  it('should trigger a redirect sign-in when the redirect button is used', () => {
    const auth = makeAuth();
    renderSignIn(auth, '/dashboard');

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in with redirect' }),
    );

    expect(auth.signinRedirect).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBe('/dashboard');
  });

  it('should trigger a popup sign-in when the popup button is used', () => {
    const auth = makeAuth();
    renderSignIn(auth, '/dashboard');

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with popup' }));

    expect(auth.signinPopup).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBe('/dashboard');
  });

  it('should trigger a silent sign-in when the silent button is used', () => {
    const auth = makeAuth();
    renderSignIn(auth);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in silently' }));

    expect(auth.signinSilent).toHaveBeenCalled();
  });

  it('should not store a return path when returnTo is omitted', () => {
    const auth = makeAuth();
    renderSignIn(auth);

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in with redirect' }),
    );

    expect(auth.signinRedirect).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBeNull();
  });

  it('should show the signed-in state when authenticated', () => {
    renderSignIn(
      makeAuth({
        isAuthenticated: true,
        user: { profile: { sub: 'user-42' } } as User,
      }),
    );

    expect(screen.getByText(/You are signed in as user-42/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeDefined();
  });

  it('should trigger a sign-out when the sign-out action is used', () => {
    const auth = makeAuth({
      isAuthenticated: true,
      user: { profile: { sub: 'user-42' } } as User,
    });
    renderSignIn(auth);

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(auth.signoutRedirect).toHaveBeenCalled();
  });
});
