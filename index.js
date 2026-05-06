// expo-router/entry MUST be first so the AppRegistry is set up
import "expo-router/entry";
import { TrackPlayer } from 'react-native-nitro-player';

// Nitro Player configuration is handled in hooks/useSetupPlayer.ts
// to ensure it's called within the React lifecycle and after app is ready.