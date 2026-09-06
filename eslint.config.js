// ESLint flat config (ESLint 9+).
// Ported 1:1 from the previous .eslintrc.json.
//
// NOTE: the unified `angular-eslint` / `typescript-eslint` wrapper packages are not
// installed in this repo, only the scoped `@angular-eslint/*` and `@typescript-eslint/*`
// packages. Those still ship eslintrc-shaped config objects, so the shared rule sets are
// spread in manually below instead of using their (non-existent) `flat/*` exports.

const tsParser = require('@typescript-eslint/parser');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

/** Selector rules that were declared identically for *.ts and *.spec.ts in .eslintrc.json. */
const projectRules = {
  '@angular-eslint/directive-selector': [
    'error',
    {
      type: 'attribute',
      prefix: 'app',
      style: 'camelCase',
    },
  ],
  '@angular-eslint/component-selector': [
    'error',
    {
      type: 'element',
      prefix: 'app',
      style: 'kebab-case',
    },
  ],
  '@angular-eslint/no-empty-lifecycle-method': 'off',

  // The Console Ninja editor extension rewrites `console.log(a, b)` into
  // `console.log(...oo_oo('id', a, b))` and appends ~40 lines of obfuscated runtime to the file.
  // Two of those files had already been committed. Fail the lint instead of shipping them.
  'no-restricted-syntax': [
    'error',
    {
      selector: "Identifier[name=/^oo_(cm|oo|tr|tx|ts|te)$/]",
      message:
        'Console Ninja instrumentation. Remove the oo_* helpers and the `...oo_*()` wrappers before committing.',
    },
  ],
};

module.exports = [
  {
    // Was: "ignorePatterns": ["projects/**/*"]
    ignores: ['projects/**/*', 'dist/**', 'coverage/**', '.angular/**', 'node_modules/**', 'reports/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2019, // was parserOptions.ecmaVersion: 10
      sourceType: 'commonjs',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {
        // No type-aware rules are enabled below, so no `project` / `projectService` is set.
        // The old config only needed `project` + `createDefaultProgram` because eslintrc
        // required a parser project to resolve the `plugin:@angular-eslint/recommended`
        // extends chain; none of the rules it turns on consume type information.
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@angular-eslint': angular,
    },
    // Was: extends "plugin:@angular-eslint/recommended"
    rules: {
      ...angular.configs.recommended.rules,
      ...projectRules,
    },
  },
  {
    // Was: extends "plugin:@angular-eslint/template/process-inline-templates"
    // Extracts inline `template:` strings from @Component metadata so the *.html rules
    // below also apply to them.
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    processor: angularTemplate.processors['extract-inline-html'],
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    // Was: extends "plugin:@angular-eslint/template/recommended"
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
];
