import base from '@michelin/config-eslint/base';

export default [
  ...base,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    rules: {
      // Nest dependency injection needs decorated constructor types at runtime.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
