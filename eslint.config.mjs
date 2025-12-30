import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import vueParser from 'vue-eslint-parser';

const defaultRules = {
	// No console statements in production
	'no-console': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
	// No debugger statements in production
	'no-debugger': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
	// Enforce prettier formatting
	'prettier/prettier': 'error',
	'padding-line-between-statements': [
		'error',
		{
			blankLine: 'always',
			prev: [
				'block',
				'block-like',
				'cjs-export',
				'class',
				'export',
				'import',
				'multiline-block-like',
				'multiline-const',
				'multiline-expression',
				'multiline-let',
				'multiline-var',
			],
			next: '*',
		},
		{
			blankLine: 'always',
			prev: ['const', 'let'],
			next: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'],
		},
		{
			blankLine: 'always',
			prev: '*',
			next: ['multiline-block-like', 'multiline-const', 'multiline-expression', 'multiline-let', 'multiline-var'],
		},
		{ blankLine: 'any', prev: ['export', 'import'], next: ['export', 'import'] },
	],
	'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
	'no-nested-ternary': 'error',
	curly: ['error', 'multi-line'],
};

export default [
	{
		ignores: ['node_modules', 'dist', '.output', '.nuxt', '**/.git/**', 'public/**'],
	},

	// Base JS
	js.configs.recommended,

	// Vue Recommended
	...pluginVue.configs['flat/recommended'],

	// Global Config for JS files
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			sourceType: 'module',
			ecmaVersion: 2022,
		},
		plugins: {
			prettier: prettier,
		},
		rules: {
			...configPrettier.rules,
			...defaultRules,
		},
	},

	// TypeScript files
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2022,
				project: './tsconfig.json',
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettier,
		},
		rules: {
			...configPrettier.rules,
			...defaultRules,
			...tsPlugin.configs.recommended.rules,

			// TS Custom Rules
			'no-undef': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},

	// Vue files
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,
				sourceType: 'module',
				ecmaVersion: 2022,
				extraFileExtensions: ['.vue'],
				project: './tsconfig.json',
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettier,
		},
		rules: {
			...configPrettier.rules,
			...defaultRules,
			...tsPlugin.configs.recommended.rules,

			// Vue overrides
			'vue/multi-word-component-names': 'off',
			'vue/require-default-prop': 'off',

			// TS Custom Rules
			'no-undef': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},
];
