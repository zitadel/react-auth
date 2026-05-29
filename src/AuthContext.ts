import React from 'react';
import type {
  QuerySessionStatusArgs,
  RevokeTokensTypes,
  SessionStatus,
  SigninPopupArgs,
  SigninRedirectArgs,
  SigninResourceOwnerCredentialsArgs,
  SigninSilentArgs,
  SignoutPopupArgs,
  SignoutRedirectArgs,
  SignoutSilentArgs,
  User,
  UserManagerEvents,
  UserManagerSettings,
} from 'oidc-client-ts';

import type { AuthState } from './AuthState.js';

/**
 * The value provided by {@link AuthProvider} and returned by
 * {@link useAuth}: the reactive {@link AuthState} merged with the
 * `UserManager` navigation and lifecycle methods.
 *
 * @public
 */
export interface AuthContextProps extends AuthState {
  /**
   * The resolved `UserManager` settings. See
   * {@link https://github.com/authts/oidc-client-ts | oidc-client-ts}.
   */
  readonly settings: UserManagerSettings;
  /**
   * The `UserManager` event emitter, for subscribing to token lifecycle
   * events such as access-token-expiring.
   */
  readonly events: UserManagerEvents;
  clearStaleState(): Promise<void>;
  removeUser(): Promise<void>;
  signinPopup(args?: SigninPopupArgs): Promise<User>;
  signinSilent(args?: SigninSilentArgs): Promise<User | null>;
  signinRedirect(args?: SigninRedirectArgs): Promise<void>;
  signinResourceOwnerCredentials(
    args: SigninResourceOwnerCredentialsArgs,
  ): Promise<User>;
  signoutRedirect(args?: SignoutRedirectArgs): Promise<void>;
  signoutPopup(args?: SignoutPopupArgs): Promise<void>;
  signoutSilent(args?: SignoutSilentArgs): Promise<void>;
  querySessionStatus(
    args?: QuerySessionStatusArgs,
  ): Promise<SessionStatus | null>;
  revokeTokens(types?: RevokeTokensTypes): Promise<void>;
  startSilentRenew(): void;
  stopSilentRenew(): void;
  /**
   * Returns whether the authenticated user holds the given Zitadel project
   * role, derived from the `urn:zitadel:iam:org:project*:roles` claims.
   */
  hasRole(role: string): boolean;
}

/**
 * The React context carrying the authentication state and methods. Prefer
 * the {@link useAuth} hook over consuming this directly.
 *
 * @public
 */
export const AuthContext = React.createContext<AuthContextProps | undefined>(
  undefined,
);
AuthContext.displayName = 'AuthContext';
