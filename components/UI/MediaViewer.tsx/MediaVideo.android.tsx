import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { FontAwesome } from "@expo/vector-icons";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import VideoCache from "../../../utils/VideoCache";
import { Post } from "../../../api/Posts";
import { AnimatedStyleHandle } from "react-native-reanimated/lib/typescript/hook/commonTypes";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";

export type VideoItem = {
  type: "video";
  source: Post["videos"][number];
};

type MediaVideoProps = {
  source: Post["videos"][number];
  focused: boolean;
  overlayStyle: AnimatedStyleHandle<{ opacity: number }>;
};

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

function MediaVideo(props: MediaVideoProps) {
  const { source, focused, overlayStyle } = props;
  const { width, height } = useSafeAreaFrame();
  const { top: safeAreaTop, left: safeAreaLeft } = useSafeAreaInsets();

  const player = useVideoPlayer(
    VideoCache.makeCachedVideoSource(source.source),
    (player) => {
      player.audioMixingMode = "mixWithOthers";
      player.loop = true;
      player.timeUpdateEventInterval = 1 / 15;
      player.seekTolerance = {
        toleranceBefore: 0.1,
        toleranceAfter: 0.1,
      };
    },
  );

  const videoTimeAtSeekStart = useSharedValue(0);
  const wasPlayingAtSeekStart = useSharedValue(false);
  const isSeeking = useSharedValue(false);

  const [isPlaying, setIsPlaying] = useState(player.playing);
  const [status, setStatus] = useState(player.status);
  const [error, setError] = useState<string | null>(null);

  const dimensions = {
    width: player.videoTrack?.size.width ?? 0,
    height: player.videoTrack?.size.height ?? 0,
  };

  const aspectRatio = dimensions.width / dimensions.height;

  const progress = useSharedValue(0);

  const playbackRate = useEvent(player, "playbackRateChange")?.playbackRate;

  const animationFrameRequest = useRef<number | null>(null);

  const handleActivateOnJS = () => {
    videoTimeAtSeekStart.value = player.currentTime;
    wasPlayingAtSeekStart.value = player.playing;
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: true,
    };
  };

  const handleUpdateOnJS = (translationX: number) => {
    const duration = player.duration;
    const newTime =
      videoTimeAtSeekStart.value + translationX / (width / duration);
    player.currentTime = newTime;
    progress.value = Math.max(0, newTime / duration);
  };

  const handleDeactivateOnJS = () => {
    if (animationFrameRequest.current) {
      cancelAnimationFrame(animationFrameRequest.current);
    }
    if (wasPlayingAtSeekStart.value) {
      player.play();
    }
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: false,
    };
  };

  const panGesture = usePanGesture({
    enabled: true,
    maxPointers: 1,
    activeOffsetX: [-3, 3],
    failOffsetY: [-5, 5],
    onActivate: () => {
      isSeeking.value = true;
      runOnJS(handleActivateOnJS)();
    },
    onUpdate: (event) => {
      runOnJS(handleUpdateOnJS)(event.translationX);
    },
    onDeactivate: () => {
      runOnJS(handleDeactivateOnJS)();
      isSeeking.value = false;
    },
  });

  useEventListener(player, "statusChange", (e) => {
    if (e.status !== "loading" || e.oldStatus === "idle") {
      setStatus(e.status);
      setError(e.error?.message ?? null);
    }
  });

  useEventListener(player, "playingChange", (e) => {
    if (isSeeking.value) {
      return;
    }
    const newIsPlaying = e.isPlaying;
    if (newIsPlaying !== isPlaying) {
      setIsPlaying(newIsPlaying);
    }
  });

  useEventListener(player, "timeUpdate", (e) => {
    if (isSeeking.value) return;
    progress.value = e.currentTime / player.duration;
  });

  useEffect(() => {
    if (focused) {
      player.play();
      player.volume = 1;
    } else {
      player.pause();
      player.volume = 0;
    }
  }, [focused]);

  useEffect(() => {
    return () => {
      if (animationFrameRequest.current) {
        cancelAnimationFrame(animationFrameRequest.current);
        animationFrameRequest.current = null;
      }
    };
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { width, height }]}>
        {error ? (
          <View style={styles.notReadyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : status === "loading" ? (
          <View style={styles.notReadyContainer}>
            <ActivityIndicator color="white" />
          </View>
        ) : null}
        <View
          style={[
            styles.videoContainer,
            { width, height: Math.min(height, width / aspectRatio) },
          ]}
        >
          {/* VideoView swallows touch events on android so we need to block them */}
          <View style={styles.videoTouchBlocker}>
            <VideoView
              player={player}
              style={[styles.video, { width }]}
              contentFit="contain"
              nativeControls={false}
              allowsVideoFrameAnalysis={false}
            />
          </View>
          <Animated.View
            style={[styles.playButtonContainer, overlayStyle]}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            >
              {isPlaying ? (
                <FontAwesome name="pause" size={24} color="white" />
              ) : (
                <FontAwesome
                  name="play"
                  size={24}
                  color="white"
                  style={styles.playButtonIcon}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.progressBarBackground} />
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [
                  {
                    scaleX: progress,
                  },
                ],
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.playbackRateContainer,
            {
              top: safeAreaTop + 10,
              left: safeAreaLeft + 10,
            },
            overlayStyle,
          ]}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <TouchableOpacity
            style={styles.playbackRateButton}
            onPress={() => {
              const currentIndex = PLAYBACK_RATES.indexOf(playbackRate ?? 1);
              const newIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
              player.playbackRate = PLAYBACK_RATES[newIndex];
            }}
          >
            <Text style={{ color: "white" }}>{playbackRate ?? 1}x</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function MediaVideoWrapper(props: MediaVideoProps) {
  return (
    <DismountWhenBackgrounded>
      <MediaVideo {...props} />
    </DismountWhenBackgrounded>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  videoContainer: {
    position: "relative",
    overflow: "hidden",
  },
  notReadyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    zIndex: 1,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    margin: 10,
  },
  videoTouchBlocker: {
    flex: 1,
    pointerEvents: "none",
  },
  video: {
    flex: 1,
  },
  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  playButton: {
    borderRadius: 100,
    padding: 15,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
  },
  playButtonIcon: {
    marginRight: -5,
  },
  progressBarBackground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 2,
    backgroundColor: "black",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    width: "200%",
    left: "-100%",
    height: 2,
    backgroundColor: "#ccc",
  },
  playbackRateContainer: {
    position: "absolute",
    left: 10,
  },
  playbackRateButton: {
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    width: 40,
    aspectRatio: 1,
  },
});
