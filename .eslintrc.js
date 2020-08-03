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
    eqeqeq: 'off',
    'no-console': 'off',
    'no-use-before-define': 'off',
    'no-unused-vars': 'off',
    'no-return-await': 'off',
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-restricted-globals': 'off',
    'no-useless-escape': 'off',
    'no-await-in-loop': 'off',
  },
};
