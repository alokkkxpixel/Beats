import { useEffect, useState } from 'react';
import TrackPlayer, { Capability, RatingType, AppKilledPlaybackBehavior } from 'react-native-track-player';

export const useSetupPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
        });
        setIsPlayerReady(true);
      } catch (error) {
        console.log('Error setting up player:', error);
      }
    }

    setup();
  }, []);

  return isPlayerReady;
};
