module.exports = {
  expo: {
    ...require('./app.json').expo,
    extra: {
      ...require('./app.json').expo.extra,
      // Real values from .env.local (overrides the placeholders in app.json)
      EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID,
    },
    plugins: [
      ...(require('./app.json').expo.plugins || []).filter(
        (p) => p !== '@clerk/expo' && !(Array.isArray(p) && p[0] === '@clerk/expo')
      ),
      [
        '@clerk/expo',
        {
          // This tells the Clerk native plugin which Android OAuth client to use
          androidClientId: process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID,
        },
      ],
    ],
  },
};
