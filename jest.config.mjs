import { defaults } from 'jest-config';

export default {
  transform: {
    '^.+\\.mjs$': 'babel-jest',  // Use Babel for .mjs files
  },
  extensionsToTreatAsEsm: ['.mjs'], // Treat .mjs files as ESM
  transformIgnorePatterns: [
    'node_modules/(?!@babel|core-js|regenerator-runtime)', // Add dependencies to be transformed
  ],
  testMatch: ['**/tests/jest/**/*.test.[jt]s?(x)'], // Run Jest tests only in specific directories
  preset: 'jest-preset-angular',
};