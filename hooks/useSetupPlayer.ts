import { useEffect, useState } from "react";
import { TrackPlayer } from "react-native-nitro-player";
import { usePlayerStore } from "@/src/store/usePlayerStore";

export const useSetupPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        // ===== NEW: Nitro Player Setup =====
        console.log("🎵 Setting up Nitro Player...");

        // Configure Nitro Player
        await TrackPlayer.configure({
          showInNotification: true,
          androidAutoEnabled: false,
          carPlayEnabled: false,
          lookaheadCount: 10,
          // androidNotificationIcon: "ic_notification", // Android-only custom notification icon
        });

        console.log("✅ Nitro Player setup complete");

        // Sync liked playlist with Nitro Player on app launch
        await usePlayerStore.getState().syncLikedPlaylist();

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
