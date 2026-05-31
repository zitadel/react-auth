import mridang from '@mridang/eslint-defaults';

export default [
  {
    ignores: ['coverage/**', '.out/**', '.npm/**', 'docs/**', 'playground/**'],
  },
  ...mridang.configs.recommended,
];
