export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'jsx',
    'mts',
    'json',
    'node',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/dist/',
    '/spec/',
    '/playground/',
  ],
  resetModules: false,
  collectCoverage: true,
  coverageDirectory: './build/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  coverageReporters: ['clover', 'cobertura', 'lcov'],
  coveragePathIgnorePatterns: ['/dist/', '/spec/', '/node_modules/'],
  testTimeout: 60000,
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './build/reports',
        outputName: 'junit.xml',
      },
    ],
  ],
};
