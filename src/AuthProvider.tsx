import {
  User,
  UserManager,
  type ProcessResourceOwnerPasswordCredentialsArgs,
  type SignoutResponse,
  type UserManagerSettings,
} from 'oidc-client-ts';
import React from 'react';

import { AuthContext } from './AuthContext.js';
import { type ErrorContext, initialAuthState } from './AuthState.js';
import { applyOidcConfigDefaults, type ZitadelScopeConfig } from './config.js';
import { hasRole } from './hasRole.js';
import { reducer } from './reducer.js';
import {
  hasAuthParams,
  normalizeError,
  renewSilentError,
  signinError,
  signoutError,
} from './utils.js';

/**
 * Properties common to every {@link AuthProvider} configuration.
 *
 * @public
 */
export interface AuthProviderBaseProps {
  /**
   * The child nodes the provider wraps.
   */
  children?: React.ReactNode;

  /**
   * Hook invoked after a successful signin callback. Use it to remove the
   * `code` and `state` parameters from the URL after returning from the
   * authorize endpoint.
   *
   * @example
   * ```tsx
   * const onSigninCallback = (): void => {
   *   window.history.replaceState({}, document.title, window.location.pathname);
   * };
   * ```
   */
  onSigninCallback?: (user: User | undefined) => Promise<void> | void;

  /**
   * By default, when the URL carries `code`/`state` params this provider
   * calls `userManager.signinCallback()` automatically. Set this to `true`
   * when those params belong to a different OAuth SDK.
   */
  skipSigninCallback?: boolean;

  /**
   * Predicate matched against the `UserManager` settings to detect a return
   * from the logout redirect (e.g. comparing against
   * `post_logout_redirect_uri`). When it matches, the provider calls
   * `userManager.signoutCallback()` automatically.
   */
  matchSignoutCallback?: (args: UserManagerSettings) => boolean;

  /**
   * Hook invoked after a successful signout callback. Requires
   * {@link AuthProviderBaseProps.matchSignoutCallback} to be set.
   */
  onSignoutCallback?: (
    resp: SignoutResponse | undefined,
  ) => Promise<void> | void;

  /**
   * Hook invoked after the user is removed via `removeUser()`.
   */
  onRemoveUser?: () => Promise<void> | void;
}

/**
 * The default configuration: pass `UserManagerSettings` (authority,
 * client_id, redirect_uri, ...) inline alongside the provider props.
 *
 * @public
 */
export interface AuthProviderNoUserManagerProps
  extends AuthProviderBaseProps,
    UserManagerSettings,
    ZitadelScopeConfig {
  /**
   * Disallowed in this form — pass settings inline instead.
   */
  userManager?: never;
}

/**
 * An alternative configuration that accepts a pre-constructed `UserManager`
 * instance instead of inline settings.
 *
 * @public
 */
export interface AuthProviderUserManagerProps extends AuthProviderBaseProps {
  /**
   * A custom `UserManager` instance.
   */
  userManager?: UserManager;
}

/**
 * @public
 */
export type AuthProviderProps =
  | AuthProviderNoUserManagerProps
  | AuthProviderUserManagerProps;

const userManagerContextKeys = [
  'clearStaleState',
  'querySessionStatus',
  'revokeTokens',
  'startSilentRenew',
  'stopSilentRenew',
] as const;
const navigatorKeys = [
  'signinPopup',
  'signinSilent',
  'signinRedirect',
  'signinResourceOwnerCredentials',
  'signoutPopup',
  'signoutRedirect',
  'signoutSilent',
] as const;
const unsupportedEnvironment = (fnName: string) => () => {
  throw new Error(
    `UserManager#${fnName} was called from an unsupported context. If this is a server-rendered page, defer this call with useEffect() or pass a custom UserManager implementation.`,
  );
};
const UserManagerImpl = typeof window === 'undefined' ? null : UserManager;

/**
 * Provides the authentication context to its child components.
 *
 * @example
 * ```tsx
 * import { AuthProvider } from '@zitadel/react-auth';
 *
 * <AuthProvider
 *   authority={import.meta.env.VITE_ZITADEL_DOMAIN}
 *   client_id={import.meta.env.VITE_ZITADEL_CLIENT_ID}
 *   redirect_uri={import.meta.env.VITE_ZITADEL_CALLBACK_URL}
 *   onSigninCallback={() =>
 *     window.history.replaceState({}, document.title, window.location.pathname)
 *   }
 * >
 *   <App />
 * </AuthProvider>;
 * ```
 *
 * @public
 */
export const AuthProvider = (props: AuthProviderProps): React.JSX.Element => {
  const {
    children,

    onSigninCallback,
    skipSigninCallback,

    matchSignoutCallback,
    onSignoutCallback,

    onRemoveUser,

    userManager: userManagerProp = null,
    ...userManagerSettings
  } = props;

  const [userManager] = React.useState(() => {
    if (userManagerProp) {
      return userManagerProp;
    }
    const resolvedSettings = applyOidcConfigDefaults(
      userManagerSettings as UserManagerSettings & ZitadelScopeConfig,
    );
    return UserManagerImpl
      ? new UserManagerImpl(resolvedSettings)
      : ({ settings: resolvedSettings } as UserManager);
  });

  const [state, dispatch] = React.useReducer(reducer, initialAuthState);
  const userManagerContext = React.useMemo(
    () =>
      Object.assign(
        {
          settings: userManager.settings,
          events: userManager.events,
        },
        Object.fromEntries(
          userManagerContextKeys.map((key) => [
            key,
            userManager[key]?.bind(userManager) ?? unsupportedEnvironment(key),
          ]),
        ) as Pick<UserManager, (typeof userManagerContextKeys)[number]>,
        Object.fromEntries(
          navigatorKeys.map((key) => [
            key,
            userManager[key]
              ? async (
                  args: ProcessResourceOwnerPasswordCredentialsArgs & never[],
                ) => {
                  dispatch({
                    type: 'NAVIGATOR_INIT',
                    method: key,
                  });
                  try {
                    return await userManager[key](args);
                  } catch (error) {
                    dispatch({
                      type: 'ERROR',
                      error: {
                        ...normalizeError(
                          error,
                          `Unknown error while executing ${key}(...).`,
                        ),
                        source: key,
                        args,
                      } as ErrorContext,
                    });
                    return null;
                  } finally {
                    dispatch({ type: 'NAVIGATOR_CLOSE' });
                  }
                }
              : unsupportedEnvironment(key),
          ]),
        ) as Pick<UserManager, (typeof navigatorKeys)[number]>,
      ),
    [userManager],
  );
  const didInitialize = React.useRef(false);

  React.useEffect(() => {
    if (didInitialize.current) {
      return;
    }
    didInitialize.current = true;

    void (async (): Promise<void> => {
      // sign-in
      try {
        let user: User | undefined | null = null;

        // check if returning back from authority server
        if (hasAuthParams() && !skipSigninCallback) {
          user = await userManager.signinCallback();
          if (onSigninCallback) {
            await onSigninCallback(user);
          }
        }
        user = !user ? await userManager.getUser() : user;
        dispatch({ type: 'INITIALISED', user });
      } catch (error) {
        dispatch({
          type: 'ERROR',
          error: signinError(error),
        });
      }

      // sign-out
      try {
        if (
          matchSignoutCallback &&
          matchSignoutCallback(userManager.settings)
        ) {
          const resp = await userManager.signoutCallback();
          if (onSignoutCallback) {
            await onSignoutCallback(resp);
          }
        }
      } catch (error) {
        dispatch({
          type: 'ERROR',
          error: signoutError(error),
        });
      }
    })();
  }, [
    userManager,
    skipSigninCallback,
    onSigninCallback,
    onSignoutCallback,
    matchSignoutCallback,
  ]);

  // register to userManager events
  React.useEffect(() => {
    // event UserLoaded (e.g. initial load, silent renew success)
    const handleUserLoaded = (user: User) => {
      dispatch({ type: 'USER_LOADED', user });
    };
    userManager.events.addUserLoaded(handleUserLoaded);

    // event UserUnloaded (e.g. userManager.removeUser)
    const handleUserUnloaded = () => {
      dispatch({ type: 'USER_UNLOADED' });
    };
    userManager.events.addUserUnloaded(handleUserUnloaded);

    // event UserSignedOut (e.g. user was signed out in background)
    const handleUserSignedOut = () => {
      dispatch({ type: 'USER_SIGNED_OUT' });
    };
    userManager.events.addUserSignedOut(handleUserSignedOut);

    // event SilentRenewError (silent renew error)
    const handleSilentRenewError = (error: Error) => {
      dispatch({
        type: 'ERROR',
        error: renewSilentError(error),
      });
    };
    userManager.events.addSilentRenewError(handleSilentRenewError);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeUserSignedOut(handleUserSignedOut);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, [userManager]);

  const removeUser = React.useCallback(async () => {
    await userManager.removeUser();
    if (onRemoveUser) {
      await onRemoveUser();
    }
  }, [userManager, onRemoveUser]);

  const contextValue = React.useMemo(() => {
    return {
      ...state,
      ...userManagerContext,
      removeUser,
      hasRole: (role: string): boolean => hasRole(state.user, role),
    };
  }, [state, userManagerContext, removeUser]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
