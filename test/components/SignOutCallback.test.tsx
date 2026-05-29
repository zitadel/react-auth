import { describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';

import { SignOutCallback } from '../../src/components/SignOutCallback.js';
import { AuthContext, type AuthContextProps } from '../../src/AuthContext.js';

const LocationProbe = (): React.JSX.Element => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const Harness = ({ isLoading }: { isLoading: boolean }): React.JSX.Element => (
  <AuthContext.Provider value={{ isLoading } as AuthContextProps}>
    <MemoryRouter initialEntries={['/auth/logout/callback']}>
      <Routes>
        <Route path="/auth/logout/callback" element={<SignOutCallback />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>
);

describe('SignOutCallback', () => {
  it('should navigate to the application root once settled', async () => {
    render(<Harness isLoading={false} />);

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/'),
    );
  });

  it('should wait while still loading then navigate once settled', async () => {
    const { rerender } = render(<Harness isLoading={true} />);
    expect(screen.queryByTestId('location')).toBeNull();

    rerender(<Harness isLoading={false} />);
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe('/'),
    );
  });
});
