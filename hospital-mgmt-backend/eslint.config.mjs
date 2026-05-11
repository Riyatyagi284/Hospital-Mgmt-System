import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  eslint.configs.recommended,
  {
    ignores: ['jest.config.js', 'winston.config.js', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest, // add node and jest both in eslint
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    // 
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts', '.jsx', '.tsx'], // resolve these
        },
      },
    },
    rules: {
      // TypeScript Recommended
      ...tseslint.configs.recommended.rules,

      // Import Rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/export': 'error',

      // Prettier Rules
      ...prettierConfig.rules,
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          printWidth: 100,
          tabWidth: 2,
        },
      ],

      // Code Quality
      'no-console': 'warn',
      'dot-notation': 'error',
      'no-use-before-define': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Style Rules
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
    },

  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
