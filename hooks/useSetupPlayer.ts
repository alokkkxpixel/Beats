import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { TrackPlayer } from "react-native-nitro-player";

export const useSetupPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        // ===== NEW: Nitro Player Setup =====
        // console.log("🎵 Setting up Nitro Player...");

        // Configure Nitro Player
        await TrackPlayer.configure({
          showInNotification: true,
          androidAutoEnabled: false,
          carPlayEnabled: false,
          lookaheadCount: 10,
          ...(Platform.OS === 'android' && { androidNotificationIcon: "ic_notification" }), // Android-only custom notification icon
        } as any);

        // console.log("✅ Nitro Player setup complete");

        // Sync liked playlist with Nitro Player on app launch
        await usePlayerStore.getState().syncLikedPlaylist();

        // Restore player state from local storage
        await usePlayerStore.getState().restorePlaybackState();

        setIsPlayerReady(true);
      } catch (error) {
        console.error("❌ Error setting up Nitro Player:", error);
        setIsPlayerReady(false);
      }
    }

    setup();
  }, []);

  return isPlayerReady;
};
