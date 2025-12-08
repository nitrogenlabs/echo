import lexConfig from '@nlabs/lex/eslint.config.mjs';

export default [
  ...lexConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/prop-types': 'off'
    }
  }
];