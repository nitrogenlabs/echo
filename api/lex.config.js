/**
 * Project Echo API – Lex Configuration
 * -----------------------------------
 *
 * Configuration for @nlabs/lex build tool.
 * This is a Node.js API server, not a web application.
 */

export default {
  useTypescript: true,
  sourcePath: './src',
  outputPath: './lib',
  targetEnvironment: 'node',
  preset: 'node',
  entryJs: 'state/server.ts',
  packageManager: 'npm',
  webpack: {
    externals: [
      // Externalize all node_modules for Node.js (don't bundle dependencies)
      function ({ request }, callback) {
        // Don't externalize relative or absolute paths (local files)
        if (request.startsWith('.') || request.startsWith('/')) {
          return callback();
        }
        // Externalize all node_modules packages
        callback(null, request);
      },
    ],
  },
  swc: {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false,
      },
      target: 'es2022',
    },
    module: {
      type: 'es6',
    },
    minify: false,
    sourceMaps: true,
  },
  jest: {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
  },
};

