import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import globals from 'globals';

import base from './base.js';

export default [
  ...base,
  ...nextVitals,
  ...nextTypeScript,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
