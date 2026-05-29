import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import { useAuth } from '../src/useAuth.js';
import { createFakeUserManager, createWrapper } from './helpers.js';

describe('useAuth', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should warn when called outside an AuthProvider', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useAuth());

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(
      'AuthProvider context is undefined',
    );
    expect(result.current).toBeUndefined();
  });

  it('should provide the auth context within a provider', async () => {
    const wrapper = createWrapper({ userManager: createFakeUserManager() });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current).toBeDefined());
    expect(typeof result.current.signinRedirect).toBe('function');
  });
});
