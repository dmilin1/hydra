import { useEvent, useEventListener } from "expo";
import { VideoPlayer, VideoView } from "expo-video";
import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import { Post } from "../../../api/Posts";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";
import { useSharedVideoPlayer } from "../../../utils/useSharedVideoPlayer";

type MediaVideoProps = {
  source: Post["videos"][number];
  focused: boolean;
  onScrubbingChange: (isScrubbing: boolean) => void;
  onFocusedPlayerChange: (player: VideoPlayer, focused: boolean) => void;
};

function MediaVideo({
  source,
  focused,
  onFocusedPlayerChange,
  onScrubbingChange,
}: MediaVideoProps) {
  const { slideAnywhereToScrub } = useContext(PostSettingsContext);
  const { width, height } = useSafeAreaFrame();

  const player = useSharedVideoPlayer(source.source);

  const touchStart = useRef({
    x: 0,
    y: 0,
    videoTime: 0,
    initiallyPlaying: player.playing,
    isSkimming: false,
  });

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

  const animationFrameRequest = useRef<number | null>(null);

  const panThroughVideo = (deltaX: number, deltaY: number) => {
    if (!touchStart.current.isSkimming) {
      if (Math.abs(deltaX) > 20 && Math.abs(deltaY) < 30) {
        touchStart.current.x += deltaX;
        touchStart.current.y += deltaY;
        touchStart.current.isSkimming = true;
        player.scrubbingModeOptions = {
          scrubbingModeEnabled: true,
        };
        player.pause();
        onScrubbingChange(true);
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

  const handleScrubTouchStart = (e: GestureResponderEvent) => {
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      videoTime: player.currentTime,
      initiallyPlaying: player.playing,
      isSkimming: false,
    };
  };

  const handleScrubTouchMove = (e: GestureResponderEvent) => {
    const deltaX = e.nativeEvent.pageX - touchStart.current.x;
    const deltaY = e.nativeEvent.pageY - touchStart.current.y;
    panThroughVideo(deltaX, deltaY);
  };

  const handleScrubTouchEnd = () => {
    /**
     * Always cancel the pending seek frame: it reads videoTime through the
     * ref, so letting it fire after the reset below would seek relative to 0.
     */
    if (animationFrameRequest.current) {
      cancelAnimationFrame(animationFrameRequest.current);
      animationFrameRequest.current = null;
    }
    if (touchStart.current.initiallyPlaying && touchStart.current.isSkimming) {
      player.play();
    }
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: false,
    };
    touchStart.current = {
      x: 0,
      y: 0,
      videoTime: 0,
      initiallyPlaying: player.playing,
      isSkimming: false,
    };
    onScrubbingChange(false);
  };

  useEventListener(player, "statusChange", (e) => {
    if (e.status !== "loading") {
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
    player.muted = false;
    player.play();
    player.volume = 1;
    onFocusedPlayerChange(player, true);
    return () => {
      player.volume = 0;
      player.muted = true;
      onFocusedPlayerChange(player, false);
    };
  }, [focused, player]);

  useEffect(() => {
    return () => {
      if (animationFrameRequest.current) {
        cancelAnimationFrame(animationFrameRequest.current);
        animationFrameRequest.current = null;
      }
    };
  }, []);

  return (
    <View
      style={[styles.container, { width, height }]}
      onTouchStart={slideAnywhereToScrub ? handleScrubTouchStart : undefined}
      onTouchMove={slideAnywhereToScrub ? handleScrubTouchMove : undefined}
      onTouchEnd={slideAnywhereToScrub ? handleScrubTouchEnd : undefined}
    >
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
        <VideoView
          player={player}
          style={[styles.video, { width }]}
          contentFit="contain"
          nativeControls={false}
          allowsVideoFrameAnalysis={false}
        />
      </View>
    </View>
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
  video: {
    flex: 1,
  },
});
