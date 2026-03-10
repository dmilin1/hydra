import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import VideoCache from "../../../utils/VideoCache";

/**
 * Revisit this to add better video scrubbing using changes introduced to
 * expo-video in this PR:
 * https://github.com/expo/expo/pull/40203
 */

export type VideoItem = {
  type: "video";
  uri: string;
};

type MediaVideoProps = {
  uri: string;
  focused: boolean;
  overlayOpacity: Animated.Value;
};

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

function MediaVideo(props: MediaVideoProps) {
  const { uri, focused, overlayOpacity } = props;
  const { width, height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const aspectRatio =
    dimensions.width > 0 && dimensions.height > 0
      ? dimensions.width / dimensions.height
      : 1;

  const progress = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(
    VideoCache.makeCachedVideoSource(uri),
    (player) => {
      player.audioMixingMode = "mixWithOthers";
      player.loop = true;
      player.timeUpdateEventInterval = 1 / 15;
    },
  );

  const touchStart = useRef({
    x: 0,
    y: 0,
    videoTime: 0,
    initiallyPlaying: player.playing,
    isSkimming: false,
  });

  const [isPlaying, setIsPlaying] = useState(player.playing);

  const playbackRate = useEvent(player, "playbackRateChange")?.playbackRate;

  const animationFrameRequest = useRef<number | null>(null);
  const progressScrubAnimationFrame = useRef<number | null>(null);
  const pendingProgressScrubTime = useRef<number | null>(null);
  const progressBarWidth = useRef(0);
  const progressBarPageX = useRef(0);
  const progressBarScrubState = useRef({
    initiallyPlaying: false,
    isScrubbing: false,
    seekTime: 0,
  });
  const ignoreNextTouchEnd = useRef(false);

  const commitProgressScrubSeek = (seekTime: number) => {
    pendingProgressScrubTime.current = seekTime;
    if (progressScrubAnimationFrame.current) {
      return;
    }
    progressScrubAnimationFrame.current = requestAnimationFrame(() => {
      progressScrubAnimationFrame.current = null;
      if (pendingProgressScrubTime.current == null) {
        return;
      }
      player.currentTime = pendingProgressScrubTime.current;
    });
  };

  const seekToProgress = (touchX: number) => {
    if (!player.duration || !Number.isFinite(player.duration)) {
      return;
    }
    const width = progressBarWidth.current;
    if (width <= 0) {
      return;
    }
    const clampedX = Math.max(0, Math.min(width, touchX));
    const nextProgress = clampedX / width;
    progress.setValue(nextProgress);
    const seekTime = nextProgress * player.duration;
    progressBarScrubState.current.seekTime = seekTime;
    commitProgressScrubSeek(seekTime);
  };

  const beginProgressScrub = () => {
    ignoreNextTouchEnd.current = true;
    progressBarScrubState.current = {
      initiallyPlaying: player.playing,
      isScrubbing: true,
      seekTime: player.currentTime,
    };
  };

  const updateProgressScrub = (event: GestureResponderEvent) => {
    seekToProgress(event.nativeEvent.pageX - progressBarPageX.current);
  };

  const endProgressScrub = () => {
    if (progressScrubAnimationFrame.current) {
      cancelAnimationFrame(progressScrubAnimationFrame.current);
      progressScrubAnimationFrame.current = null;
    }
    player.currentTime = progressBarScrubState.current.seekTime;
    if (progressBarScrubState.current.initiallyPlaying) {
      if (!player.playing) {
        player.play();
      }
    } else if (player.playing) {
      player.pause();
    }
    progressBarScrubState.current = {
      initiallyPlaying: false,
      isScrubbing: false,
      seekTime: 0,
    };
    pendingProgressScrubTime.current = null;
  };

  const panThroughVideo = (deltaX: number, deltaY: number) => {
    if (!touchStart.current.isSkimming) {
      if (Math.abs(deltaX) > 20 && Math.abs(deltaY) < 30) {
        touchStart.current.x += deltaX;
        touchStart.current.y += deltaY;
        touchStart.current.isSkimming = true;
        player.pause();
      }
      return;
    }
    if (animationFrameRequest.current) {
      cancelAnimationFrame(animationFrameRequest.current);
    }
    animationFrameRequest.current = requestAnimationFrame(() => {
      const videoChange = deltaX / (width / player.duration);
      player.currentTime = touchStart.current.videoTime + videoChange;
    });
  };

  useEventListener(player, "playingChange", (e) => {
    if (touchStart.current.isSkimming) {
      return;
    }
    const newIsPlaying = e.isPlaying;
    if (newIsPlaying !== isPlaying) {
      setIsPlaying(newIsPlaying);
    }
  });

  useEventListener(player, "timeUpdate", (e) => {
    if (progressBarScrubState.current.isScrubbing) {
      return;
    }
    progress.setValue(e.currentTime / player.duration);
  });

  useEventListener(player, "videoTrackChange", (e) => {
    if (e.videoTrack) {
      setDimensions({
        width: e.videoTrack.size.width,
        height: e.videoTrack.size.height,
      });
    }
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
      if (progressScrubAnimationFrame.current) {
        cancelAnimationFrame(progressScrubAnimationFrame.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={[styles.videoContainer, { width, height: width / aspectRatio }]}
      >
        <View
          style={styles.videoGestureSurface}
          onTouchStart={(e) => {
            touchStart.current = {
              x: e.nativeEvent.pageX,
              y: e.nativeEvent.pageY,
              videoTime: player.currentTime,
              initiallyPlaying: player.playing,
              isSkimming: false,
            };
          }}
          onTouchMove={(e) => {
            const deltaX = e.nativeEvent.pageX - touchStart.current.x;
            const deltaY = e.nativeEvent.pageY - touchStart.current.y;
            panThroughVideo(deltaX, deltaY);
          }}
          onTouchEnd={() => {
            if (ignoreNextTouchEnd.current) {
              ignoreNextTouchEnd.current = false;
              touchStart.current = {
                x: 0,
                y: 0,
                videoTime: 0,
                initiallyPlaying: player.playing,
                isSkimming: false,
              };
              return;
            }
            if (
              touchStart.current.initiallyPlaying &&
              touchStart.current.isSkimming
            ) {
              player.play();
            }
            touchStart.current = {
              x: 0,
              y: 0,
              videoTime: 0,
              initiallyPlaying: player.playing,
              isSkimming: false,
            };
          }}
        >
          <VideoView
            player={player}
            style={[styles.video, { width }]}
            contentFit="contain"
            nativeControls={false}
            allowsVideoFrameAnalysis={false}
            surfaceType={Platform.OS === "android" ? "textureView" : undefined}
          />
        </View>
        <Animated.View
          style={[
            styles.playButtonContainer,
            {
              opacity: overlayOpacity,
            },
          ]}
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
        <View
          style={styles.progressTrack}
          onLayout={(event) => {
            progressBarWidth.current = event.nativeEvent.layout.width;
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={(event) => {
            progressBarPageX.current =
              event.nativeEvent.pageX - event.nativeEvent.locationX;
            beginProgressScrub();
            updateProgressScrub(event);
          }}
          onResponderMove={updateProgressScrub}
          onResponderRelease={endProgressScrub}
          onResponderTerminate={endProgressScrub}
        >
          <View pointerEvents="none" style={styles.progressBarBackground} />
          <Animated.View
            pointerEvents="none"
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
      </View>
      <Animated.View
        style={[
          styles.playbackRateContainer,
          {
            top: top + 10,
            opacity: overlayOpacity,
          },
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
  },
  video: {
    flex: 1,
  },
  videoGestureSurface: {
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
    width: "100%",
    height: 2,
    backgroundColor: "black",
  },
  progressBar: {
    position: "absolute",
    top: 11,
    width: "200%",
    left: "-100%",
    height: 2,
    backgroundColor: "#ccc",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    height: 24,
    zIndex: 2,
    justifyContent: "center",
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
