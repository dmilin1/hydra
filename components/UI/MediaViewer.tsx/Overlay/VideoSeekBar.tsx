import { useEventListener } from "expo";
import { VideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

import { useOverlayInteraction } from "./OverlayContext";

const THUMB_SIZE = 14;
const TRACK_HEIGHT = 3;
const TRACK_HEIGHT_EXPANDED = 7;
const HIT_ZONE_HEIGHT = 40;

function formatTime(totalSeconds: number) {
  const rounded = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function VideoSeekBar({ player }: { player: VideoPlayer }) {
  const { bumpAutoHide } = useOverlayInteraction();

  const [displaySeconds, setDisplaySeconds] = useState(() =>
    Number.isFinite(player.currentTime) ? Math.floor(player.currentTime) : 0,
  );
  const [duration, setDuration] = useState(() =>
    Number.isFinite(player.duration) ? player.duration : 0,
  );

  const progress = useSharedValue(0);
  const buffered = useSharedValue(0);
  const expansion = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const scrubbing = useSharedValue(false);

  const wasPlayingBeforeScrub = useRef(false);
  const seekRatio = useRef(0);
  const seekFrameRequest = useRef<number | null>(null);

  const updateDisplaySeconds = (seconds: number) => {
    const floored = Math.floor(seconds);
    setDisplaySeconds((previous) =>
      previous === floored ? previous : floored,
    );
  };

  const refreshDuration = () => {
    setDuration((previous) =>
      Number.isFinite(player.duration) &&
      player.duration > 0 &&
      player.duration !== previous
        ? player.duration
        : previous,
    );
  };

  useEventListener(player, "timeUpdate", (e) => {
    refreshDuration();
    if (player.duration > 0) {
      if (!scrubbing.value) {
        progress.value = Math.min(1, e.currentTime / player.duration);
        updateDisplaySeconds(e.currentTime);
      }
      buffered.value = Math.min(
        1,
        Math.max(0, e.bufferedPosition / player.duration),
      );
    }
  });

  useEventListener(player, "statusChange", () => refreshDuration());

  useEffect(() => {
    return () => {
      if (seekFrameRequest.current) {
        cancelAnimationFrame(seekFrameRequest.current);
      }
    };
  }, []);

  const startScrub = () => {
    wasPlayingBeforeScrub.current = player.playing;
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: true,
    };
    player.pause();
  };

  const seekToRatio = (ratio: number) => {
    seekRatio.current = ratio;
    if (seekFrameRequest.current) return;
    seekFrameRequest.current = requestAnimationFrame(() => {
      seekFrameRequest.current = null;
      if (player.duration > 0) {
        const newTime = seekRatio.current * player.duration;
        player.currentTime = newTime;
        updateDisplaySeconds(newTime);
      }
    });
  };

  const endScrub = () => {
    if (seekFrameRequest.current) {
      cancelAnimationFrame(seekFrameRequest.current);
      seekFrameRequest.current = null;
      if (player.duration > 0) {
        player.currentTime = seekRatio.current * player.duration;
      }
    }
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: false,
    };
    if (wasPlayingBeforeScrub.current) {
      player.play();
    }
    bumpAutoHide();
  };

  const panGesture = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      "worklet";
      scrubbing.value = true;
      expansion.value = withTiming(1, { duration: 120 });
      const ratio = Math.min(
        1,
        Math.max(0, e.x / Math.max(1, trackWidth.value)),
      );
      progress.value = ratio;
      runOnJS(startScrub)();
      runOnJS(seekToRatio)(ratio);
    },
    onUpdate: (e) => {
      "worklet";
      const ratio = Math.min(
        1,
        Math.max(0, e.x / Math.max(1, trackWidth.value)),
      );
      progress.value = ratio;
      runOnJS(seekToRatio)(ratio);
    },
    onFinalize: () => {
      "worklet";
      scrubbing.value = false;
      expansion.value = withTiming(0, { duration: 120 });
      runOnJS(endScrub)();
    },
  });

  const trackStyle = useAnimatedStyle(() => ({
    height:
      TRACK_HEIGHT + expansion.value * (TRACK_HEIGHT_EXPANDED - TRACK_HEIGHT),
  }));

  const bufferedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (buffered.value - 1) * trackWidth.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * trackWidth.value }],
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * trackWidth.value },
      { scale: 1 + expansion.value * 0.3 },
    ],
  }));

  return (
    <View style={styles.seekRow}>
      <Text style={styles.timeText}>{formatTime(displaySeconds)}</Text>
      <GestureDetector gesture={panGesture}>
        <View
          style={styles.hitZone}
          onLayout={(e) => {
            trackWidth.value = e.nativeEvent.layout.width;
          }}
        >
          <Animated.View style={[styles.track, trackStyle]}>
            <Animated.View style={[styles.trackBuffered, bufferedStyle]} />
            <Animated.View style={[styles.trackFill, fillStyle]} />
          </Animated.View>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
      <Text style={styles.timeText}>{formatTime(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeText: {
    color: "white",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  hitZone: {
    flex: 1,
    height: HIT_ZONE_HEIGHT,
    justifyContent: "center",
  },
  track: {
    borderRadius: TRACK_HEIGHT_EXPANDED / 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
  },
  trackBuffered: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  trackFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
  },
  thumb: {
    position: "absolute",
    left: -THUMB_SIZE / 2,
    top: (HIT_ZONE_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "white",
  },
});
