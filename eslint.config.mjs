// @ts-check

import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/**', 'types/**', 'migrations/**'],
    extraPathsAllowingDevDependencies: ['**/test/**/*.js', '.allowed-scripts.mjs'],
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // 'no-param-reassign': 'off',
      // '@typescript-eslint/no-shadow': 'off',
      // 'import/no-cycle': 'off',
      'import/prefer-default-export': 'off',
      'max-classes-per-file': 'off',

      // temporary change to reduce scale of changes
      'arrow-parens': 'error',
      'comma-dangle': ['error', 'only-multiline'],
      'prettier/prettier': 'off',
    },
  },
]
