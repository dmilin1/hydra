import FontAwesome from "@react-native-vector-icons/fontawesome";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useEventListener } from "expo";
import { VideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import {
  OVERLAY_BACKGROUND_COLOR,
  OverlayIsland,
  useOverlayInteraction,
} from "./OverlayContext";

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];
const SKIP_SECONDS = 10;
const PAUSE_ICON_DEBOUNCE_MS = 100;

/**
 * The raw `playing` flag dips to false while the player rebuffers after a
 * seek, which flickered the play/pause icon. Rising edges apply instantly,
 * falling edges only if the pause outlasts a seek hiccup, and taps force the
 * state so the button always responds immediately.
 */
function useDisplayedPlayingState(player: VideoPlayer) {
  const [isPlaying, setIsPlaying] = useState(player.playing);
  const pauseDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounce = () => {
    if (pauseDebounce.current) {
      clearTimeout(pauseDebounce.current);
      pauseDebounce.current = null;
    }
  };

  const forceIsPlaying = (playing: boolean) => {
    clearDebounce();
    setIsPlaying(playing);
  };

  useEventListener(player, "playingChange", (e) => {
    clearDebounce();
    if (e.isPlaying) {
      setIsPlaying(true);
    } else {
      pauseDebounce.current = setTimeout(
        () => setIsPlaying(false),
        PAUSE_ICON_DEBOUNCE_MS,
      );
    }
  });

  useEffect(() => clearDebounce, []);

  return [isPlaying, forceIsPlaying] as const;
}

export function PlaybackCluster({ player }: { player: VideoPlayer }) {
  const { bumpAutoHide } = useOverlayInteraction();

  const [isPlaying, forceIsPlaying] = useDisplayedPlayingState(player);

  return (
    <OverlayIsland style={styles.clusterRow}>
      <Touchable
        activeOpacity={0.8}
        animationDuration={{ in: 0, out: 150 }}
        style={styles.skipButton}
        onPress={() => {
          player.seekBy(-SKIP_SECONDS);
          bumpAutoHide();
        }}
      >
        <MaterialIcons name="replay-10" size={26} color="white" />
      </Touchable>
      <Touchable
        activeOpacity={0.8}
        animationDuration={{ in: 0, out: 150 }}
        style={styles.playButton}
        onPress={() => {
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
          forceIsPlaying(!isPlaying);
          bumpAutoHide();
        }}
      >
        {isPlaying ? (
          <FontAwesome name="pause" size={24} color="white" />
        ) : (
          <FontAwesome
            name="play"
            size={24}
            color="white"
            style={styles.playIcon}
          />
        )}
      </Touchable>
      <Touchable
        activeOpacity={0.8}
        animationDuration={{ in: 0, out: 150 }}
        style={styles.skipButton}
        onPress={() => {
          player.seekBy(SKIP_SECONDS);
          bumpAutoHide();
        }}
      >
        <MaterialIcons name="forward-10" size={26} color="white" />
      </Touchable>
    </OverlayIsland>
  );
}

export function PlaybackRateButton({ player }: { player: VideoPlayer }) {
  const { bumpAutoHide } = useOverlayInteraction();

  const [playbackRate, setPlaybackRate] = useState(player.playbackRate);

  useEventListener(player, "playbackRateChange", (e) => {
    setPlaybackRate(e.playbackRate);
  });

  useEffect(() => {
    setPlaybackRate(player.playbackRate);
  }, [player]);

  return (
    <Touchable
      activeOpacity={0.2}
      animationDuration={{ in: 0, out: 150 }}
      style={styles.rateButton}
      onPress={() => {
        const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
        const newIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
        player.playbackRate = PLAYBACK_RATES[newIndex];
        bumpAutoHide();
      }}
    >
      <Text style={styles.rateText}>{playbackRate}x</Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  clusterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
  },
  skipButton: {
    borderRadius: 100,
    width: 45,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
  },
  playButton: {
    borderRadius: 100,
    width: 55,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
  },
  playIcon: {
    marginRight: -5,
  },
  rateButton: {
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    aspectRatio: 1,
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
  },
  rateText: {
    color: "white",
    fontSize: 14,
  },
});
