/**
 * Project Echo Dashboard – Lex Configuration
 * ------------------------------------------
 *
 * Configuration for @nlabs/lex build tool.
 */

export default {
  useTypescript: true,
  sourcePath: './src',
  outputPath: './dist',
  entryHTML: 'index.html',
  entryJs: 'main.tsx',
  packageManager: 'npm',
  webpack: {
    staticPath: './src/static',
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  },
  swc: {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      target: 'es2020',
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
    module: {
      type: 'es6',
    },
  },
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

