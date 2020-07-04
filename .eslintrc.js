module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    camelcase: 'warn',
    eqeqeq: 'warn',
    'no-console': 'warn',
    'no-alert': 'warn',
    'no-use-before-define': 'warn',
    'no-unused-vars': 'warn',
    'no-return-await': 'warn',
    'no-param-reassign': 'warn',
    'no-shadow': 'warn',
    'no-undef': 'warn'
  },
};
