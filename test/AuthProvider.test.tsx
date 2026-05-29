import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import type { User } from 'oidc-client-ts';

import { AuthProvider } from '../src/AuthProvider.js';
import { useAuth } from '../src/useAuth.js';
import {
  createFakeUserManager,
  createWrapper,
  setLocation,
} from './helpers.js';

type FakeEvents = { emit: (name: string, arg?: unknown) => void };

const emitter = (userManager: ReturnType<typeof createFakeUserManager>) =>
  userManager.events as unknown as FakeEvents;

describe('AuthProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should finish loading and report unauthenticated with no user', async () => {
    const userManager = createFakeUserManager();
    let observed: ReturnType<typeof useAuth> | undefined;
    const Probe = (): null => {
      observed = useAuth();
      return null;
    };
    // A changing callback prop re-runs the init effect, exercising the
    // already-initialised guard so a second getUser() call is avoided.
    const { rerender } = render(
      <AuthProvider userManager={userManager} onSigninCallback={() => {}}>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(observed?.isLoading).toBe(false));
    expect(observed?.isAuthenticated).toBe(false);
    expect(observed?.user).toBeNull();

    rerender(
      <AuthProvider userManager={userManager} onSigninCallback={() => {}}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(userManager.getUser).toHaveBeenCalledTimes(1));
  });

  it('should expose hasRole through the auth context', async () => {
    const user = {
      expired: false,
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:roles': { admin: { orgId: 'org-1' } },
      },
    } as unknown as User;
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => user),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('editor')).toBe(false);
  });

  it('should construct a UserManager from inline settings', async () => {
    // No `userManager` prop: exercises the real construction path that most
    // consumers use (authority/client_id/redirect_uri passed inline).
    const wrapper = createWrapper({
      authority: 'https://example.zitadel.cloud',
      client_id: 'inline-client',
      redirect_uri: 'https://app.example.com/auth/callback',
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.settings.client_id).toBe('inline-client');
  });

  it('should report authenticated when a valid user is restored', async () => {
    const user = { expired: false, profile: { sub: 'user-1' } } as User;
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => user),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toBe(user);
  });

  it('should report unauthenticated when the restored user is expired', async () => {
    const user = { expired: true, profile: { sub: 'user-1' } } as User;
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => user),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(user);
  });

  it('should run the signin callback when the URL has auth params', async () => {
    const restore = setLocation('?code=abc&state=xyz');
    const user = { expired: false, profile: { sub: 'cb' } } as User;

    try {
      // Without an onSigninCallback hook, the callback still runs and
      // authenticates (covers the `if (onSigninCallback)` false branch).
      const bare = createFakeUserManager({
        signinCallback: jest.fn(async () => user),
      });
      const bareResult = renderHook(() => useAuth(), {
        wrapper: createWrapper({ userManager: bare }),
      }).result;
      await waitFor(() =>
        expect(bareResult.current.isAuthenticated).toBe(true),
      );
      expect(bare.signinCallback).toHaveBeenCalled();
      expect(bareResult.current.user).toBe(user);

      // With an onSigninCallback hook, it is invoked with the restored user
      // (covers the `if (onSigninCallback)` true branch).
      const signinCallback = jest.fn(async () => user);
      const onSigninCallback = jest.fn(async () => undefined);
      const userManager = createFakeUserManager({ signinCallback });
      const wrapper = createWrapper({ userManager, onSigninCallback });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
      expect(signinCallback).toHaveBeenCalled();
      expect(onSigninCallback).toHaveBeenCalledWith(user);
      expect(result.current.user).toBe(user);
    } finally {
      restore();
    }
  });

  it('should run the signout callback when matchSignoutCallback matches', async () => {
    // Without an onSignoutCallback hook, the callback still runs (covers the
    // `if (onSignoutCallback)` false branch).
    const bare = createFakeUserManager({
      signoutCallback: jest.fn(async () => undefined),
    });
    renderHook(() => useAuth(), {
      wrapper: createWrapper({
        userManager: bare,
        matchSignoutCallback: () => true,
      }),
    });
    await waitFor(() => expect(bare.signoutCallback).toHaveBeenCalled());

    // With an onSignoutCallback hook, it is invoked (true branch).
    const signoutCallback = jest.fn(async () => undefined);
    const matchSignoutCallback = jest.fn(() => true);
    const onSignoutCallback = jest.fn(async () => undefined);
    const userManager = createFakeUserManager({ signoutCallback });
    const wrapper = createWrapper({
      userManager,
      matchSignoutCallback,
      onSignoutCallback,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(signoutCallback).toHaveBeenCalled());
    expect(matchSignoutCallback).toHaveBeenCalledWith(userManager.settings);
    expect(onSignoutCallback).toHaveBeenCalled();
  });

  it('should surface a signin error when getUser rejects', async () => {
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => {
        throw new Error('boom');
      }),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.source).toBe('signinCallback');
  });

  it('should set error.source to signinCallback when the signin callback fails', async () => {
    const restore = setLocation('?code=abc&state=xyz');
    const userManager = createFakeUserManager({
      signinCallback: jest.fn(async () => {
        throw new Error('callback boom');
      }),
    });
    const wrapper = createWrapper({ userManager });

    try {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.error).toBeDefined());
      expect(result.current.error?.source).toBe('signinCallback');
      expect(result.current.error?.message).toBe('callback boom');
    } finally {
      restore();
    }
  });

  it('should set error.source to signoutCallback when the signout callback fails', async () => {
    const userManager = createFakeUserManager({
      signoutCallback: jest.fn(async () => {
        throw new Error('signout boom');
      }),
    });
    const wrapper = createWrapper({
      userManager,
      matchSignoutCallback: () => true,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.source).toBe('signoutCallback');
    expect(result.current.error?.message).toBe('signout boom');
  });

  it('should dispatch USER_LOADED on the UserLoaded event', async () => {
    const userManager = createFakeUserManager();
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const user = { expired: false, profile: { sub: 'loaded' } } as User;
    act(() => emitter(userManager).emit('UserLoaded', user));

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toBe(user);
  });

  it('should dispatch USER_UNLOADED on the UserUnloaded event', async () => {
    const user = { expired: false, profile: { sub: 'u' } } as User;
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => user),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    act(() => emitter(userManager).emit('UserUnloaded'));

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(result.current.user).toBeUndefined();
  });

  it('should clear the user on the UserSignedOut event', async () => {
    const user = { expired: false, profile: { sub: 'u' } } as User;
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => user),
    });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    act(() => emitter(userManager).emit('UserSignedOut'));

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(result.current.user).toBeUndefined();
  });

  it('should surface a renewSilent error on the SilentRenewError event', async () => {
    const userManager = createFakeUserManager();
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      emitter(userManager).emit('SilentRenewError', new Error('renew boom')),
    );

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.source).toBe('renewSilent');
    expect(result.current.error?.message).toBe('renew boom');
  });

  it('should call onRemoveUser after removeUser resolves', async () => {
    const removeUser = jest.fn(async () => undefined);
    const onRemoveUser = jest.fn(async () => undefined);
    const userManager = createFakeUserManager({ removeUser });
    const wrapper = createWrapper({ userManager, onRemoveUser });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.removeUser();
    });

    expect(removeUser).toHaveBeenCalled();
    expect(onRemoveUser).toHaveBeenCalled();
  });

  it('should resolve removeUser even without an onRemoveUser hook', async () => {
    const removeUser = jest.fn(async () => undefined);
    const userManager = createFakeUserManager({ removeUser });
    const wrapper = createWrapper({ userManager });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.removeUser();
    });

    expect(removeUser).toHaveBeenCalled();
  });

  it('should remove the registered event handlers on unmount', async () => {
    const userManager = createFakeUserManager();
    const { unmount } = render(
      <AuthProvider userManager={userManager}>
        <div />
      </AuthProvider>,
    );

    await waitFor(() => expect(userManager.getUser).toHaveBeenCalled());
    unmount();
    expect(userManager.events.removeUserLoaded).toHaveBeenCalled();
    expect(userManager.events.removeUserUnloaded).toHaveBeenCalled();
    expect(userManager.events.removeUserSignedOut).toHaveBeenCalled();
    expect(userManager.events.removeSilentRenewError).toHaveBeenCalled();
  });

  describe('navigator methods', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set activeNavigator and clear it when signinRedirect resolves', async () => {
      const userManager = createFakeUserManager();
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signinRedirect();
      });

      expect(userManager.signinRedirect).toHaveBeenCalled();
      expect(result.current.activeNavigator).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set activeNavigator and clear it when signinPopup resolves', async () => {
      const userManager = createFakeUserManager();
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signinPopup();
      });

      expect(userManager.signinPopup).toHaveBeenCalled();
      expect(result.current.activeNavigator).toBeUndefined();
    });

    it('should set activeNavigator and clear it when signinSilent resolves', async () => {
      const userManager = createFakeUserManager();
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signinSilent();
      });

      expect(userManager.signinSilent).toHaveBeenCalled();
      expect(result.current.activeNavigator).toBeUndefined();
    });

    it('should set activeNavigator and clear it when signoutRedirect resolves', async () => {
      const userManager = createFakeUserManager();
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signoutRedirect();
      });

      expect(userManager.signoutRedirect).toHaveBeenCalled();
      expect(result.current.activeNavigator).toBeUndefined();
    });

    it('should set activeNavigator and clear it when signoutPopup resolves', async () => {
      const userManager = createFakeUserManager();
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signoutPopup();
      });

      expect(userManager.signoutPopup).toHaveBeenCalled();
      expect(result.current.activeNavigator).toBeUndefined();
    });

    it('should report an error with the matching source when a navigator throws', async () => {
      // Throw a non-Error primitive so the error normaliser must fall back to
      // its default name/message/stack rather than reading them off the value.
      const userManager = createFakeUserManager({
        signinPopup: jest.fn(async () => {
          throw 'popup boom';
        }),
      });
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => {
        await result.current.signinPopup();
      });

      expect(result.current.error?.source).toBe('signinPopup');
      expect(result.current.error?.name).toBe('Error');
      expect(result.current.error?.message).toBe(
        'Unknown error while executing signinPopup(...).',
      );
      expect(result.current.activeNavigator).toBeUndefined();
    });
  });

  describe('unsupported environment', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw when a navigator method is missing from the UserManager', async () => {
      // A UserManager that lacks signinSilent (e.g. a server-rendered stub)
      // gets an unsupportedEnvironment shim that throws when invoked.
      const userManager = createFakeUserManager({ signinSilent: undefined });
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(() => result.current.signinSilent()).toThrow(
        /unsupported context/,
      );
    });

    it('should throw when a context method is missing from the UserManager', async () => {
      const userManager = createFakeUserManager({ revokeTokens: undefined });
      const wrapper = createWrapper({ userManager });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(() => result.current.revokeTokens()).toThrow(
        /unsupported context/,
      );
    });
  });
});
