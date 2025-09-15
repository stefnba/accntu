// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import noCrossFeatureQueryImports from './eslint-rules/no-cross-feature-query-imports';
import noEndpointQueryImports from './eslint-rules/no-endpoint-query-imports';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules/', '.next/', 'out/', 'public/'],
    languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            project: './tsconfig.json',
        },
    },
    plugins: {
        custom: {
            rules: {
                'no-cross-feature-query-imports': noCrossFeatureQueryImports,
                'no-endpoint-query-imports': noEndpointQueryImports,
            },
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        'custom/no-cross-feature-query-imports': 'error',
        'custom/no-endpoint-query-imports': 'error',
    },
});
