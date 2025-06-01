import type { UserConfig } from '@commitlint/types';

const commitConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, // Level: 2 = error
      'always', // Applicable: always enforce this rule
      [
        'feat', // Feature addition or change
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style (formatting, missing semi-colons, etc.)
        'refactor', // Code refactoring without functional changes
        'perf', // Performance improvements
        'test', // Adding or modifying tests
        'build', // Changes affecting build tools or dependencies
        'ci', // Changes to CI/CD configuration
        'chore', // Minor tasks or updates
        'revert', // Reverting a previous commit
        'hotfix', // Emergency fixes
        'wip', // Work in Progress
        'custom', // Your custom type
        'breaking', // Breaking changes
      ],
    ],
  },
};

module.exports = commitConfig;
