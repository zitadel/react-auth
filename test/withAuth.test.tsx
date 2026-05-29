import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { withAuth } from '../src/withAuth.js';
import type { AuthContextProps } from '../src/AuthContext.js';
import { AuthProvider } from '../src/AuthProvider.js';
import { createFakeUserManager } from './helpers.js';

describe('withAuth', () => {
  it('should inject the auth context as an auth prop', async () => {
    const userManager = createFakeUserManager();
    const Probe = ({ auth }: { auth: AuthContextProps }): React.JSX.Element => (
      <div>{typeof auth.signinRedirect === 'function' ? 'has-auth' : 'no'}</div>
    );
    const Wrapped = withAuth(Probe);

    render(
      <AuthProvider userManager={userManager}>
        <Wrapped />
      </AuthProvider>,
    );

    expect(await screen.findByText('has-auth')).toBeDefined();
  });

  it('should set a withAuth display name', () => {
    const Named = (): React.JSX.Element => <div />;
    Named.displayName = 'Named';
    const Wrapped = withAuth(Named);

    expect(Wrapped.displayName).toBe('withAuth(Named)');
  });
});
