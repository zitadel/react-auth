import type { ErrorContext } from './AuthState.js';

/**
 * Detects whether the current URL contains an OIDC authorization response,
 * i.e. a `code`/`error` together with a `state` parameter, in either the
 * query string (`response_mode: query`) or the fragment
 * (`response_mode: fragment`).
 *
 * @param location - The location to inspect. Defaults to `window.location`.
 * @returns `true` when the URL looks like an authorization response.
 *
 * @example
 * ```ts
 * import { hasAuthParams } from '@zitadel/react-auth';
 *
 * if (!hasAuthParams() && !auth.isAuthenticated) {
 *   void auth.signinRedirect();
 * }
 * ```
 *
 * @public
 */
export const hasAuthParams = (location = window.location): boolean => {
  const isAuthResponse = (params: URLSearchParams): boolean =>
    Boolean((params.get('code') || params.get('error')) && params.get('state'));

  // response_mode: query
  const queryParams = new URLSearchParams(location.search);
  // response_mode: fragment
  const fragmentParams = new URLSearchParams(location.hash.replace('#', '?'));

  return isAuthResponse(queryParams) || isAuthResponse(fragmentParams);
};

/**
 * Normalizes an unknown thrown value into the common fields of an
 * {@link ErrorContext}.
 */
export function normalizeError(
  error: unknown,
  fallbackMessage: string,
): Pick<ErrorContext, 'name' | 'message' | 'innerError' | 'stack'> {
  return {
    name: stringFieldOf(error, 'name') ?? 'Error',
    message: stringFieldOf(error, 'message') ?? fallbackMessage,
    stack: stringFieldOf(error, 'stack') ?? new Error().stack,
    innerError: error,
  };
}

function normalizeErrorFn(
  source: 'signoutCallback' | 'signinCallback' | 'renewSilent',
  fallbackMessage: string,
) {
  return (error: unknown): ErrorContext => {
    return {
      ...normalizeError(error, fallbackMessage),
      source: source,
    };
  };
}

export const signinError = normalizeErrorFn('signinCallback', 'Sign-in failed');
export const signoutError = normalizeErrorFn(
  'signoutCallback',
  'Sign-out failed',
);
export const renewSilentError = normalizeErrorFn(
  'renewSilent',
  'Renew silent failed',
);

function stringFieldOf(
  element: unknown,
  fieldName: string,
): string | undefined {
  if (element && typeof element === 'object') {
    const value = (element as Record<string, unknown>)[fieldName];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}
