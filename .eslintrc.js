module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'block-spacing': ['error', 'always'],
    camelcase: 2,
    eqeqeq: 2,
    'no-empty': 2,
    'no-empty-function': 2,
    'no-extra-semi': 2,
    'no-shadow': 2,
    'no-useless-return': 2,
    'no-console': 0,
    'max-classes-per-file': 0,
    'no-trailing-spaces': 2,
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};
