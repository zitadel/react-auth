import mridang from '@mridang/eslint-defaults';

export default [
  {
    ignores: ['docs/**', 'dist/**', 'build/**', '.out/**', 'playground/**'],
  },
  ...mridang.configs.recommended,
];
