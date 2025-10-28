// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules', 'dist', 'build', 'android', 'ios', '.expo'],
  },
  prettier,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        'babel-module': {},
      },
    },
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'no-console': ['error', { allow: ['error'] }],
      'no-duplicate-imports': 'error',
    },
  },
]);
