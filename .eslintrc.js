module.exports = {
    root: true,
    extends: [
        'universe/native',
        'prettier',
    ],
    rules: {
        // Ensures props and state inside functions are always up-to-date
        'react-hooks/exhaustive-deps': 'warn',
        'no-new': 'off',
        'react-hooks/exhaustive-deps': 'off',
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
        "prettier/prettier": [
            "error",
            {
                "endOfLine": "auto"
            }
        ]
    },
};