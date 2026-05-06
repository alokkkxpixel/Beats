import { useEffect, useState } from 'react';
import { PlayerQueue, TrackPlayer } from 'react-native-nitro-player';

export const useSetupPlayer = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        // ===== COMMENTED OUT: Old RNTP setup code =====
        // try {
        //   await TrackPlayer.setupPlayer();
        // } catch (e: any) {
        //   if (!e?.message?.includes('already been initialized')) {
        //     throw e;
        //   }
        //   console.log('TrackPlayer already initialized, skipping setupPlayer');
        // }
        //
        // await TrackPlayer.updateOptions({
        //   android: {
        //     appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        //   },
        //   capabilities: [
        //     Capability.Play,
        //     Capability.Pause,
        //     Capability.SkipToNext,
        //     Capability.SkipToPrevious,
        //     Capability.SeekTo,
        //     Capability.Stop,
        //   ],
        //   compactCapabilities: [
        //     Capability.Play,
        //     Capability.Pause,
        //     Capability.SkipToNext,
        //   ],
        //   notificationCapabilities: [
        //     Capability.Play,
        //     Capability.Pause,
        //     Capability.SkipToNext,
        //     Capability.SkipToPrevious,
        //   ],
        // });
        //
        // await TrackPlayer.reset();
        // await TrackPlayer.add({
        //   id: '1',
        //   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        //   title: 'Test Track',
        //   artist: 'Test',
        // });
        // await TrackPlayer.play();
        // ==========================================

        // ===== NEW: Nitro Player Setup =====
        console.log('🎵 Setting up Nitro Player...');

        // Configure Nitro Player
        await TrackPlayer.configure({
          showInNotification: true,
          androidAutoEnabled: false,
          carPlayEnabled: false,
        });

        // Create a default playlist
        const playlistId = await PlayerQueue.createPlaylist(
          'Default Queue',
          'Default playback queue'
        );

        // Add test track to verify setup works
        // await PlayerQueue.addTracksToPlaylist(playlistId, [
        //   {
        //     id: 'test-1',
        //     title: 'Test Track',
        //     artist: 'Test Artist',
        //     album: 'Test Album',
        //     duration: 245,
        //     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        //     artwork: 'https://via.placeholder.com/300x300?text=Test+Album',
        //   },
        // ]);

        // Load the playlist
        await PlayerQueue.loadPlaylist(playlistId);

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
