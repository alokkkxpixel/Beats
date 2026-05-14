const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const {
    resolver: { sourceExts, assetExts },
  } = config;

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...config.resolver,
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
  };

  return withNativeWind(config, { input: './global.css' });
})();