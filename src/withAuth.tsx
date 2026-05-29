import React from 'react';

import type { AuthContextProps } from './AuthContext.js';
import { useAuth } from './useAuth.js';

/**
 * A higher-order component that injects the imperative auth API as an `auth`
 * prop, for use in class components that cannot call {@link useAuth}.
 *
 * @param Component - The component to wrap.
 * @returns The wrapped component, with `auth` supplied automatically.
 *
 * @example
 * ```tsx
 * import { withAuth } from '@zitadel/react-auth';
 *
 * class Profile extends React.Component<{ auth: AuthContextProps }> {
 *   render() {
 *     return <div>{this.props.auth.user?.profile.sub}</div>;
 *   }
 * }
 *
 * export default withAuth(Profile);
 * ```
 *
 * @public
 */
export function withAuth<P>(
  Component: React.ComponentType<P>,
): React.ComponentType<Omit<P, keyof AuthContextProps>> {
  const displayName = `withAuth(${Component.displayName || Component.name})`;
  const C: React.FC<Omit<P, keyof AuthContextProps>> = (props) => {
    const auth = useAuth();

    return <Component {...(props as P)} auth={auth} />;
  };

  C.displayName = displayName;

  return C;
}
