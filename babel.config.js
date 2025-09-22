// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // v-- ДОБАВИТЬ ЭТУ СТРОКУ В КОНЕЦ СПИСКА --v
      'react-native-reanimated/plugin',
      // ^-- ДОБАВИТЬ ЭТУ СТРОКУ В КОНЕЦ СПИСКА --^
    ],
  };
};