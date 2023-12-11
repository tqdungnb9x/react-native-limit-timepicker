module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': 'error',
    'react/no-unstable-nested-components': [
      'off' | 'warn' | 'error',
      {allowAsProps: true | false},
    ],
    'no-useless-escape': 'OFF',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // <--- THIS IS THE NEW RULE
    'react-native/no-unused-styles': 1,
  },
};
