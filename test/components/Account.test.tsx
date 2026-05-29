import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from 'oidc-client-ts';

import { Account } from '../../src/components/Account.js';
import { AuthContext, type AuthContextProps } from '../../src/AuthContext.js';

const renderAccount = (auth: Partial<AuthContextProps>): void => {
  render(
    <AuthContext.Provider value={auth as AuthContextProps}>
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe('Account', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the user profile when authenticated', () => {
    renderAccount({
      isAuthenticated: true,
      user: {
        profile: { sub: 'user-7', name: 'Ada', email: 'ada@example.test' },
      } as User,
    });

    expect(screen.getByRole('heading', { name: 'Account' })).toBeDefined();
    expect(screen.getByText('user-7')).toBeDefined();
    expect(screen.getByText('Ada')).toBeDefined();
    expect(screen.getByText('ada@example.test')).toBeDefined();
  });

  it('should fall back to a dash for missing name and email', () => {
    renderAccount({
      isAuthenticated: true,
      user: { profile: { sub: 'user-7' } } as User,
    });

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('should sign out when the sign-out action is used', () => {
    const signoutRedirect = jest.fn(async () => undefined);
    renderAccount({
      isAuthenticated: true,
      user: { profile: { sub: 'user-7' } } as User,
      signoutRedirect,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signoutRedirect).toHaveBeenCalled();
  });

  it('should prompt to sign in when unauthenticated', () => {
    renderAccount({ isAuthenticated: false });

    expect(screen.getByText(/You are not authenticated/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'sign in' })).toBeDefined();
  });
});
