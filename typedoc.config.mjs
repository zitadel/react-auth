// noinspection JSUnusedGlobalSymbols
/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: ['src/index.ts', 'src/components/index.ts', 'src/routes.tsx'],
  out: '.out/docs',
  tsconfig: './tsconfig.json',
  readme: 'README.md',
  projectDocuments: [
    'docs/guide/getting-started/introduction.md',
    'docs/guide/getting-started/installation.md',
    'docs/guide/react/quick-start.md',
    'docs/guide/react/components.md',
    'docs/guide/react/api-calls.md',
    'docs/guide/react/routes.md',
    'docs/guide/application-side/configuration.md',
    'docs/guide/application-side/protecting-pages.md',
    'docs/guide/application-side/session-access.md',
    'docs/guide/advanced/silent-renew.md',
    'docs/guide/advanced/hosting.md',
  ],
  excludeInternal: true,
  excludePrivate: true,
  highlightLanguages: [
    'typescript',
    'javascript',
    'json',
    'jsx',
    'tsx',
    'bash',
    'sh',
    'html',
    'dotenv',
    'toml',
    'nginx',
  ],
  externalSymbolLinkMappings: {
    'oidc-client-ts': {
      User: 'https://authts.github.io/oidc-client-ts/classes/User.html',
      UserManager:
        'https://authts.github.io/oidc-client-ts/classes/UserManager.html',
      UserManagerSettings:
        'https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html',
      ErrorResponse:
        'https://authts.github.io/oidc-client-ts/classes/ErrorResponse.html',
    },
    typescript: {
      URLSearchParams:
        'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
    },
  },
  cleanOutputDir: true,
  treatWarningsAsErrors: false,
  validation: {
    invalidLink: true,
    notExported: true,
    notDocumented: false,
  },
};
