// ===== COMMENTED OUT: Using React Native Nitro Player instead =====
// import TrackPlayer, { Event } from "react-native-track-player";
// 
// export const PlaybackService = async function () {
//   console.log("🎵 PlaybackService: REGISTERED AND RUNNING");
//
//   TrackPlayer.addEventListener(Event.RemotePlay, () => {
//     console.log("🎵🎵🎵 NOTIFICATION: PLAY PRESSED 🎵🎵🎵");
//     TrackPlayer.play();
//   });
//
//   TrackPlayer.addEventListener(Event.RemotePause, () => {
//     console.log("⏸️⏸️⏸️ NOTIFICATION: PAUSE PRESSED ⏸️⏸️⏸️");
//     TrackPlayer.pause();
//   });
//
//   TrackPlayer.addEventListener(Event.RemoteNext, () => {
//     console.log("⏭️⏭️⏭️ NOTIFICATION: NEXT PRESSED ⏭️⏭️⏭️");
//     TrackPlayer.skipToNext();
//   });
//
//   TrackPlayer.addEventListener(Event.RemotePrevious, () => {
//     console.log("⏮️⏮️⏮️ NOTIFICATION: PREVIOUS PRESSED ⏮️⏮️⏮️");
//     TrackPlayer.skipToPrevious();
//   });
//
//   TrackPlayer.addEventListener(Event.RemoteStop, () => {
//     console.log("🛑🛑🛑 NOTIFICATION: STOP PRESSED 🛑🛑🛑");
//     TrackPlayer.reset();
//   });
//
//   TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
//     console.log("🔄🔄🔄 NOTIFICATION: SEEK TO", event.position, "🔄🔄🔄");
//     TrackPlayer.seekTo(event.position);
//   });
// };
// ====================================================================

// Nitro Player handles background events automatically
export const PlaybackService = async function () {
  console.log("🎵 PlaybackService: Using Nitro Player (no custom handlers needed)");
};
