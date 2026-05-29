import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useAutoSignin } from '../src/useAutoSignin.js';
import { AuthContext, type AuthContextProps } from '../src/AuthContext.js';
import { setLocation } from './helpers.js';

const makeAuth = (
  overrides: Partial<AuthContextProps> = {},
): AuthContextProps =>
  ({
    isLoading: false,
    isAuthenticated: false,
    activeNavigator: undefined,
    error: undefined,
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined),
    ...overrides,
  }) as unknown as AuthContextProps;

const wrapperFor = (auth: AuthContextProps) => {
  const Wrapper = ({
    children,
  }: React.PropsWithChildren): React.JSX.Element => (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
  return Wrapper;
};

describe('useAutoSignin', () => {
  let restoreLocation: () => void;

  beforeEach(() => {
    restoreLocation = setLocation('', '');
  });

  afterEach(() => {
    restoreLocation();
    jest.clearAllMocks();
  });

  it('should expose the current authentication status', () => {
    const auth = makeAuth({ isAuthenticated: true });
    const { result } = renderHook(() => useAutoSignin(), {
      wrapper: wrapperFor(auth),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should auto sign in using default signinRedirect', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    await waitFor(() => expect(auth.signinRedirect).toHaveBeenCalled());
  });

  it('should auto sign in using provided method signinRedirect', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin({ signinMethod: 'signinRedirect' }), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() => expect(auth.signinRedirect).toHaveBeenCalled());
    expect(auth.signinPopup).not.toHaveBeenCalled();
  });

  it('should auto sign in using provided method signinPopup', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin({ signinMethod: 'signinPopup' }), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() => expect(auth.signinPopup).toHaveBeenCalled());
  });

  it('should auto sign and not call signinRedirect if other method provided', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin({ signinMethod: 'signinPopup' }), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() => expect(auth.signinPopup).toHaveBeenCalled());
    expect(auth.signinRedirect).not.toHaveBeenCalled();
  });

  it('should pass signinArgs to signinRedirect when provided', async () => {
    const auth = makeAuth();
    const signinArgs = { redirect_uri: 'https://example.test/cb' };
    renderHook(
      () => useAutoSignin({ signinMethod: 'signinRedirect', signinArgs }),
      { wrapper: wrapperFor(auth) },
    );

    await waitFor(() =>
      expect(auth.signinRedirect).toHaveBeenCalledWith(signinArgs),
    );
  });

  it('should pass signinArgs to signinPopup when provided', async () => {
    const auth = makeAuth();
    const signinArgs = { popupWindowFeatures: { width: 100 } };
    renderHook(
      () => useAutoSignin({ signinMethod: 'signinPopup', signinArgs }),
      { wrapper: wrapperFor(auth) },
    );

    await waitFor(() =>
      expect(auth.signinPopup).toHaveBeenCalledWith(signinArgs),
    );
  });

  it('should pass signinArgs to signinRedirect when using default method', async () => {
    const auth = makeAuth();
    const signinArgs = { redirect_uri: 'https://example.test/cb' };
    renderHook(() => useAutoSignin({ signinArgs }), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() =>
      expect(auth.signinRedirect).toHaveBeenCalledWith(signinArgs),
    );
  });

  it('should call signinRedirect without signinArgs when no signinArgs provided', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    await waitFor(() => expect(auth.signinRedirect).toHaveBeenCalled());
    expect(auth.signinRedirect).toHaveBeenCalledWith(undefined);
  });

  it('should call signinPopup without signinArgs when no signinArgs provided', async () => {
    const auth = makeAuth();
    renderHook(() => useAutoSignin({ signinMethod: 'signinPopup' }), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() => expect(auth.signinPopup).toHaveBeenCalled());
    expect(auth.signinPopup).toHaveBeenCalledWith(undefined);
  });

  it('should not trigger a signin when already authenticated', () => {
    const auth = makeAuth({ isAuthenticated: true });
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    expect(auth.signinRedirect).not.toHaveBeenCalled();
    expect(auth.signinPopup).not.toHaveBeenCalled();
  });

  it('should not trigger a signin while loading', () => {
    const auth = makeAuth({ isLoading: true });
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    expect(auth.signinRedirect).not.toHaveBeenCalled();
  });

  it('should not trigger a signin when a navigator is active', () => {
    const auth = makeAuth({ activeNavigator: 'signinRedirect' });
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    expect(auth.signinRedirect).not.toHaveBeenCalled();
  });

  it('should not trigger a signin when the URL has auth params', () => {
    restoreLocation();
    restoreLocation = setLocation('?code=abc&state=xyz', '');
    const auth = makeAuth();
    renderHook(() => useAutoSignin(), { wrapper: wrapperFor(auth) });

    expect(auth.signinRedirect).not.toHaveBeenCalled();
  });

  it('should only trigger a signin once', async () => {
    const auth = makeAuth();
    const { rerender } = renderHook(() => useAutoSignin(), {
      wrapper: wrapperFor(auth),
    });

    await waitFor(() => expect(auth.signinRedirect).toHaveBeenCalledTimes(1));
    rerender();
    rerender();
    expect(auth.signinRedirect).toHaveBeenCalledTimes(1);
  });
});
