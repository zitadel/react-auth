import { describe, expect, it } from '@jest/globals';

import { applyOidcConfigDefaults, DEFAULT_OIDC_SCOPE } from '../src/config.js';

describe('applyOidcConfigDefaults', () => {
  const base = {
    authority: 'https://example.zitadel.cloud',
    client_id: 'client',
    redirect_uri: 'https://app.example.com/auth/callback',
  };

  it('should default scope, loadUserInfo and automaticSilentRenew', () => {
    const result = applyOidcConfigDefaults({ ...base });

    expect(result.scope).toBe(DEFAULT_OIDC_SCOPE);
    expect(result.loadUserInfo).toBe(true);
    expect(result.automaticSilentRenew).toBe(true);
  });

  it('should append the project resource id scopes', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      project_resource_id: '12345',
    });

    expect(result.scope).toContain('urn:zitadel:iam:org:project:id:12345:aud');
    expect(result.scope).toContain('urn:zitadel:iam:org:projects:roles');
  });

  it('should append the org id scope', () => {
    const result = applyOidcConfigDefaults({ ...base, org_id: '67890' });

    expect(result.scope).toContain('urn:zitadel:iam:org:id:67890');
  });

  it('should not override explicit settings', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      loadUserInfo: false,
      automaticSilentRenew: false,
    });

    expect(result.loadUserInfo).toBe(false);
    expect(result.automaticSilentRenew).toBe(false);
  });

  it('should not duplicate scopes', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      scope: 'openid openid profile',
    });

    expect(result.scope).toBe('openid profile');
  });
});
