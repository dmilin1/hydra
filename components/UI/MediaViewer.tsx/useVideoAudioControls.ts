import { VideoPlayer } from "expo-video";
import { useLayoutEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { VolumeManager } from "react-native-volume-manager";
import { watchUnmuteIntent } from "../../../modules/video-audio-controls";
import { subscribeToVideoUnmute } from "./videoAudioControls";

export default function useVideoAudioControls({
  player,
  focused,
  isMuted,
  setIsMuted,
}: {
  player: VideoPlayer;
  focused: boolean;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
}) {
  useLayoutEffect(() => {
    if (focused) player.muted = isMuted;
    if (!focused || !isMuted) return;
    let stop = () => {};
    const update = (state: AppStateStatus) => {
      stop();
      if (state !== "active") return;
      stop = subscribeToVideoUnmute({
        volume: VolumeManager,
        watchIntent: watchUnmuteIntent,
        isActive: () => AppState.currentState === "active",
        onUnmute: () => setIsMuted(false),
      });
    };
    const appStateSubscription = AppState.addEventListener("change", update);
    update(AppState.currentState);
    return () => {
      appStateSubscription.remove();
      stop();
    };
  }, [focused, isMuted, player, setIsMuted]);
}
