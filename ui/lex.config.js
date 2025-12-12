/**
 * Project Echo Dashboard – Lex Configuration
 * ------------------------------------------
 *
 * Configuration for @nlabs/lex build tool.
 */

export default {
  useTypescript: true,
  entryJs: 'main.tsx',
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:4000',
      ws: true,
    },
  },
  jest: {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./src/setupTests.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  },
};

