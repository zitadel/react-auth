module.exports = {
  ignoreDependencies: [
    '@commitlint/config-conventional',
    '@zitadel/react-auth',
  ],
  rules: {
    unresolved: 'off',
  },
  entry: ['src/main.tsx'],
  ignore: ['commitlint.config.js'],
};
