import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import expoConfig from 'eslint-config-expo/flat.js';


export default tseslint.config([
    tseslint.configs.recommended,
    expoConfig,
    eslintPluginPrettierRecommended,
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '/.expo/**',
            '**/external/**',
            'app.config.ts',
            'babel.config.js',
            '**/constants/documentation.ts',
        ],
    },
    {
        rules: {
            // Ensures props and state inside functions are always up-to-date
            'react-hooks/exhaustive-deps': 'warn',
            'no-new': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react/no-unescaped-entities': 'off',
            'react/display-name': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    'args': 'all',
                    'argsIgnorePattern': '^_',
                    'caughtErrors': 'all',
                    'caughtErrorsIgnorePattern': '^_',
                    'destructuredArrayIgnorePattern': '^_',
                    'varsIgnorePattern': '^_',
                    'ignoreRestSiblings': true
                }
            ],
            'prettier/prettier': [
                'error',
                {
                    'endOfLine': 'auto'
                }
            ]
        }
    }
]);
