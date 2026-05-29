import { describe, expect, it } from '@jest/globals';
import React from 'react';

import { zitadelRoutes } from '../src/routes.js';

const elementType = (index: number): React.ComponentType<unknown> => {
  const element = zitadelRoutes[index].element as React.ReactElement;
  return element.type as React.ComponentType<unknown>;
};

describe('routes', () => {
  it('should expose five auth routes', () => {
    expect(zitadelRoutes).toHaveLength(5);
    expect(zitadelRoutes.map((r) => r.path)).toEqual([
      '/auth/signin',
      '/auth/callback',
      '/auth/error',
      '/auth/logout/callback',
      '/auth/account',
    ]);
  });

  it('should map /auth/signin to the sign-in component', () => {
    const route = zitadelRoutes.find((r) => r.path === '/auth/signin');
    expect(
      (elementType(zitadelRoutes.indexOf(route!)) as { name: string }).name,
    ).toBe('SignIn');
  });

  it('should map /auth/callback to the sign-in callback component', () => {
    const index = zitadelRoutes.findIndex((r) => r.path === '/auth/callback');
    expect((elementType(index) as { name: string }).name).toBe(
      'SignInCallback',
    );
  });

  it('should map /auth/error to the sign-in error component', () => {
    const index = zitadelRoutes.findIndex((r) => r.path === '/auth/error');
    expect((elementType(index) as { name: string }).name).toBe('SignInError');
  });

  it('should map /auth/logout/callback to the sign-out callback component', () => {
    const index = zitadelRoutes.findIndex(
      (r) => r.path === '/auth/logout/callback',
    );
    expect((elementType(index) as { name: string }).name).toBe(
      'SignOutCallback',
    );
  });

  it('should guard the /auth/account route', () => {
    const index = zitadelRoutes.findIndex((r) => r.path === '/auth/account');
    const guarded = elementType(index) as {
      displayName?: string;
      name: string;
    };
    expect(guarded.displayName ?? guarded.name).toContain(
      'withAuthenticationRequired',
    );
  });
});
