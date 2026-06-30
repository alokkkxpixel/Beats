import { Redirect } from "expo-router";

/**
 * Root index — handles the `beats:///` deep link that arrives after
 * OAuth redirects back to the app. Without this file, Expo Router shows
 * a "Route Mismatch" screen briefly before the JS navigation fires.
 */
export default function Index() {
  return <Redirect href="/(drawer)/(tabs)" />;
}
