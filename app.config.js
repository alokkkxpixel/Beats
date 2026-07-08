const { withProjectBuildGradle } = require('@expo/config-plugins');

const withKotlinGradlePluginVersion = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let content = config.modResults.contents;
      const targetPattern = /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\)/g;
      if (content.match(targetPattern)) {
        content = content.replace(
          targetPattern,
          `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.findProperty('android.kotlinVersion') ?: '2.0.21'}")`
        );
      }
      config.modResults.contents = content;
    }
    return config;
  });
};

module.exports = {
  expo: {
    ...require('./app.json').expo,
    extra: {
      ...require('./app.json').expo.extra,
      // Real values from .env.local (overrides the placeholders in app.json)
      EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID || "687773363103-gjsvkm204km76sql206fi7lbat2nkqtl.apps.googleusercontent.com",
      EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID || "687773363103-l0v40el2g2lr6023026e7jfl5gn75dnn.apps.googleusercontent.com",
    },
    plugins: [
      ...(require('./app.json').expo.plugins || []).filter(
        (p) => p !== '@clerk/expo' && !(Array.isArray(p) && p[0] === '@clerk/expo')
      ),
      [
        '@clerk/expo',
        {
          // This tells the Clerk native plugin which Android OAuth client to use
          androidClientId: process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID || "687773363103-l0v40el2g2lr6023026e7jfl5gn75dnn.apps.googleusercontent.com",
        },
      ],
      withKotlinGradlePluginVersion,
    ],
  },
};
