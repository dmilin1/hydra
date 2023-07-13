module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'module:metro-react-native-babel-preset'
    ],
    plugins: [
      require.resolve("expo-router/babel"),
      [
        'babel-plugin-show-source', // fix for this: https://github.com/facebook/hermes/issues/612
        {
          removeDirective: true,
          removeFunction: true,
          directive: 'do not compile',
        }
      ],
    ],
  };
};
