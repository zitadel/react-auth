import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';

import {
  RETURN_TO_KEY,
  SignInCallback,
} from '../../src/components/SignInCallback.js';
import { AuthContext, type AuthContextProps } from '../../src/AuthContext.js';
import type { ErrorContext } from '../../src/AuthState.js';

const LocationProbe = (): React.JSX.Element => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const Harness = ({
  auth,
}: {
  auth: Partial<AuthContextProps>;
}): React.JSX.Element => (
  <AuthContext.Provider value={auth as AuthContextProps}>
    <MemoryRouter initialEntries={['/auth/callback']}>
      <Routes>
        <Route path="/auth/callback" element={<SignInCallback />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>
);

const renderCallback = (
  auth: Partial<AuthContextProps>,
): { rerender: (auth: Partial<AuthContextProps>) => void } => {
  const view = render(<Harness auth={auth} />);
  return {
    rerender: (next: Partial<AuthContextProps>): void =>
      view.rerender(<Harness auth={next} />),
  };
};

describe('SignInCallback', () => {
  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('should navigate to the stored return path on success', async () => {
    window.sessionStorage.setItem(RETURN_TO_KEY, '/dashboard');
    renderCallback({ isLoading: false, isAuthenticated: true });

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/dashboard'),
    );
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBeNull();
  });

  it('should wait while still loading', async () => {
    const { rerender } = renderCallback({
      isLoading: true,
      isAuthenticated: false,
    });
    expect(screen.queryByTestId('location')).toBeNull();

    rerender({ isLoading: false, isAuthenticated: true });
    expect(await screen.findByTestId('location')).toBeDefined();
  });

  it('should stay put when settled but not authenticated', async () => {
    renderCallback({ isLoading: false, isAuthenticated: false });

    await waitFor(() => undefined);
    expect(screen.queryByTestId('location')).toBeNull();
  });

  it('should navigate to the auth error route on failure', async () => {
    renderCallback({
      isLoading: false,
      isAuthenticated: false,
      error: { name: 'Error', message: 'x' } as ErrorContext,
    });

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/auth/error'),
    );
  });
});
