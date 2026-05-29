import { defineConfig } from 'tsup';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    routes: 'src/routes.tsx',
  },
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: false,
  },
  external: ['react', 'react-dom', 'react-router-dom', 'oidc-client-ts'],
});
