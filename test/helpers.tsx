import { jest } from '@jest/globals';
import React from 'react';
import type { User, UserManager } from 'oidc-client-ts';

import { AuthProvider, type AuthProviderProps } from '../src/AuthProvider.js';

/**
 * Builds a stub `UserManager` good enough to drive the provider in tests,
 * without contacting a real identity provider. Override any method via
 * `overrides`.
 *
 * The event emitter records the handlers registered by the provider so that
 * tests can fire `UserLoaded`/`UserUnloaded`/`UserSignedOut`/`SilentRenewError`
 * events synthetically via {@link emit}.
 */
export const createFakeUserManager = (
  overrides: Partial<Record<keyof UserManager, unknown>> = {},
): UserManager => {
  const handlers: Record<string, Array<(arg?: unknown) => void>> = {
    UserLoaded: [],
    UserUnloaded: [],
    UserSignedOut: [],
    SilentRenewError: [],
  };
  const add =
    (name: string) =>
    (cb: (arg?: unknown) => void): void => {
      handlers[name].push(cb);
    };
  const remove =
    (name: string) =>
    (cb: (arg?: unknown) => void): void => {
      handlers[name] = handlers[name].filter((h) => h !== cb);
    };
  const events = {
    addUserLoaded: jest.fn(add('UserLoaded')),
    removeUserLoaded: jest.fn(remove('UserLoaded')),
    addUserUnloaded: jest.fn(add('UserUnloaded')),
    removeUserUnloaded: jest.fn(remove('UserUnloaded')),
    addUserSignedOut: jest.fn(add('UserSignedOut')),
    removeUserSignedOut: jest.fn(remove('UserSignedOut')),
    addSilentRenewError: jest.fn(add('SilentRenewError')),
    removeSilentRenewError: jest.fn(remove('SilentRenewError')),
    /**
     * Fires every handler currently registered for the given event name.
     */
    emit: (name: keyof typeof handlers, arg?: unknown): void => {
      handlers[name].forEach((h) => h(arg));
    },
  };

  const manager = {
    settings: { authority: 'authority', client_id: 'client' },
    events,
    getUser: jest.fn(async () => null),
    signinCallback: jest.fn(async () => undefined),
    signoutCallback: jest.fn(async () => undefined),
    removeUser: jest.fn(async () => undefined),
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined as unknown as User),
    signinSilent: jest.fn(async () => null),
    signinResourceOwnerCredentials: jest.fn(async () => undefined),
    signoutRedirect: jest.fn(async () => undefined),
    signoutPopup: jest.fn(async () => undefined),
    signoutSilent: jest.fn(async () => undefined),
    clearStaleState: jest.fn(async () => undefined),
    querySessionStatus: jest.fn(async () => null),
    revokeTokens: jest.fn(async () => undefined),
    startSilentRenew: jest.fn(),
    stopSilentRenew: jest.fn(),
    ...overrides,
  };

  return manager as unknown as UserManager;
};

/**
 * A `signinRedirect` stub that never resolves, modeling a real browser
 * navigation that takes the page away before the promise settles. Use this in
 * redirect tests to avoid infinite re-trigger loops.
 */
export const neverResolvingRedirect = (): jest.Mock =>
  jest.fn(() => new Promise<void>(() => undefined));

/**
 * Temporarily sets `window.location.search`/`hash` and returns a restore
 * function. jsdom's `window.location` is a non-configurable, read-only object,
 * so we drive it through the History API rather than redefining properties.
 */
export const setLocation = (search: string, hash = ''): (() => void) => {
  const original = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${search}${hash}`,
  );

  return (): void => {
    window.history.replaceState({}, '', original);
  };
};

/**
 * Wraps children in an {@link AuthProvider} configured with the given props.
 */
export const createWrapper = (opts: AuthProviderProps) => {
  const Wrapper = ({
    children,
  }: React.PropsWithChildren): React.JSX.Element => (
    <AuthProvider {...opts}>{children}</AuthProvider>
  );
  return Wrapper;
};
