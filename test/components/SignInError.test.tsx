import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SignInError } from '../../src/components/SignInError.js';
import { AuthContext, type AuthContextProps } from '../../src/AuthContext.js';
import type { ErrorContext } from '../../src/AuthState.js';

const renderError = (error?: ErrorContext): void => {
  render(
    <AuthContext.Provider value={{ error } as AuthContextProps}>
      <MemoryRouter>
        <SignInError />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe('SignInError', () => {
  it('should render the most recent error when present', () => {
    renderError({
      name: 'Error',
      message: 'something failed',
      source: 'signinCallback',
    } as ErrorContext);

    expect(screen.getByText(/signinCallback/)).toBeDefined();
    expect(screen.getByText(/something failed/)).toBeDefined();
  });

  it('should render a fallback message when no error is present', () => {
    renderError(undefined);

    expect(screen.getByText('An unknown error occurred.')).toBeDefined();
  });
});
