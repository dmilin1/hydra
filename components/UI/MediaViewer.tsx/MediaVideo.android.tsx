import useVideoAudioControls from "./useVideoAudioControls";
import { useEvent, useEventListener } from "expo";
import { VideoPlayer, VideoView } from "expo-video";
import { useContext, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import { Post } from "../../../api/Posts";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";
import { useSharedVideoPlayer } from "../../../utils/useSharedVideoPlayer";

type MediaVideoProps = {
  source: Post["videos"][number];
  focused: boolean;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  onFocusedPlayerChange: (player: VideoPlayer, focused: boolean) => void;
};

function MediaVideo({
  source,
  focused,
  isMuted,
  setIsMuted,
  onFocusedPlayerChange,
}: MediaVideoProps) {
  const { slideAnywhereToScrub } = useContext(PostSettingsContext);
  const { width, height } = useSafeAreaFrame();

  const player = useSharedVideoPlayer(source.source);

  const videoTimeAtSeekStart = useRef(0);
  const wasPlayingAtSeekStart = useRef(false);

  const [status, setStatus] = useState(player.status);
  const [error, setError] = useState<string | null>(null);

  // A shared player may have fired videoTrackChange before this mount.
  const videoTrack =
    useEvent(player, "videoTrackChange")?.videoTrack ?? player.videoTrack;

  const dimensions = {
    width: videoTrack?.size.width ?? 0,
    height: videoTrack?.size.height ?? 0,
  };

  const aspectRatio = dimensions.width / dimensions.height;

  const handleScrubStart = () => {
    videoTimeAtSeekStart.current = player.currentTime;
    wasPlayingAtSeekStart.current = player.playing;
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: true,
    };
  };

  const handleScrubUpdate = (translationX: number) => {
    player.currentTime =
      videoTimeAtSeekStart.current + translationX / (width / player.duration);
  };

  const handleScrubEnd = () => {
    if (wasPlayingAtSeekStart.current) {
      player.play();
    }
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: false,
    };
  };

  const panGesture = usePanGesture({
    enabled: slideAnywhereToScrub,
    maxPointers: 1,
    activeOffsetX: [-3, 3],
    failOffsetY: [-5, 5],
    onActivate: () => {
      runOnJS(handleScrubStart)();
    },
    onUpdate: (event) => {
      runOnJS(handleScrubUpdate)(event.translationX);
    },
    onDeactivate: () => {
      runOnJS(handleScrubEnd)();
    },
  });

  useEventListener(player, "statusChange", (e) => {
    if (e.status !== "loading" || e.oldStatus === "idle") {
      setStatus(e.status);
      setError(e.error?.message ?? null);
    }
  });

  useEffect(() => {
    if (!focused) {
      player.pause();
      player.muted = true;
      player.volume = 0;
      return;
    }
    player.muted = isMuted;
    player.play();
    player.volume = 1;
    onFocusedPlayerChange(player, true);
    return () => {
      player.volume = 0;
      player.muted = true;
      onFocusedPlayerChange(player, false);
    };
  }, [focused, player]);

  useVideoAudioControls({ player, focused, isMuted, setIsMuted });

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
        </View>
      </View>
    </GestureDetector>
  );
}

export default function MediaVideoWrapper(props: MediaVideoProps) {
  const error = props.source.sourceLoadError ?? null;
  return error ? (
    <View style={styles.notReadyContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : (
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
});
