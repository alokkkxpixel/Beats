import { useEffect, useState } from 'react';
import { PlayerQueue, TrackPlayer } from 'react-native-nitro-player';

export const useSetupPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        
        // ===== NEW: Nitro Player Setup =====
        console.log('🎵 Setting up Nitro Player...');

        // Configure Nitro Player
        await TrackPlayer.configure({
          showInNotification: true,
          androidAutoEnabled: false,
          carPlayEnabled: false,
        });

        console.log('✅ Nitro Player setup complete');
        setIsPlayerReady(true);
      } catch (error) {
        console.error('❌ Error setting up Nitro Player:', error);
        setIsPlayerReady(false);
      }
    }

    setup();
  }, []);

  return isPlayerReady;
};
