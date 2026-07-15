import { VideoPlayer } from "expo-video";
import { useEffect } from "react";
import { VolumeManager } from "react-native-volume-manager";
import { isMediaVolumeIncrease } from "./videoAudioControls";

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
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!focused || !isMuted) return;

    let cancelled = false;
    let listener: ReturnType<typeof VolumeManager.addVolumeListener> | null =
      null;
    let previousVolume: number | null = null;

    VolumeManager.getVolume()
      .then(({ volume }) => {
        if (cancelled) return;
        previousVolume = volume;
        listener = VolumeManager.addVolumeListener((event) => {
          if (isMediaVolumeIncrease(previousVolume, event.volume, event.type)) {
            setIsMuted(false);
          }
          if (event.type === undefined || event.type === "music") {
            previousVolume = event.volume;
          }
        });
      })
      .catch(() => {
        // The mute button still works if the native volume API is unavailable.
      });

    return () => {
      cancelled = true;
      listener?.remove();
    };
  }, [focused, isMuted, setIsMuted]);
}
