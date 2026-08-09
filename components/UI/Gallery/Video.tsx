import { useEventListener } from "expo";
import { VideoView } from "expo-video";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Platform,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { MediaViewerContext } from "../../../contexts/MediaViewerContext";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import { Post } from "../../../api/Posts";
import {
  isPlayerShared,
  useSharedVideoPlayer,
} from "../../../utils/useSharedVideoPlayer";

type VideoProps = {
  video: Post["videos"][number];
};

function Video({ video }: VideoProps) {
  const { theme } = useContext(ThemeContext);
  const { subscribeToVisibility } = useContext(MediaViewerContext);
  const progress = useRef(new Animated.Value(0)).current;

  const player = useSharedVideoPlayer(video.source);

  const [status, setStatus] = useState(player.status);
  const [error, setError] = useState<string | null>(null);
  const [hideVideoView, setHideVideoView] = useState(false);

  useEventListener(player, "statusChange", (e) => {
    setStatus(e.status);
    setError(e.error?.message ?? null);
  });

  useEventListener(player, "timeUpdate", (e) => {
    progress.setValue(e.currentTime / player.duration);
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && player.status === "readyToPlay") {
        player.play();
      }
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    return subscribeToVisibility((isShowing) => {
      if (isShowing) {
        // The fullscreen viewer drives the player when it holds the same one.
        if (!isPlayerShared(video.source)) {
          player.pause();
        }
        if (Platform.OS === "android") {
          /**
           * Android allows one view per player and its native assertion fires
           * if a recycled view swaps players while the fullscreen view holds
           * ours. No mounted view, no assertion; remounting on close also
           * reclaims the stolen surface. The decoder is untouched.
           */
          setHideVideoView(true);
        }
      } else {
        player.muted = true;
        player.play();
        setHideVideoView(false);
      }
    });
  }, [player, subscribeToVisibility]);

  return (
    <View style={styles.videoContainer} pointerEvents="none">
      {error ? (
        <View style={styles.notReadyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : status === "loading" ? (
        <View style={styles.notReadyContainer}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : null}
      {hideVideoView ? null : (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
          allowsVideoFrameAnalysis={false}
        />
      )}
      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: theme.background },
        ]}
      />
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: theme.subtleText,
            transform: [
              {
                scaleX: progress,
              },
            ],
          },
        ]}
      />
    </View>
  );
}

export default function VideoPlayerWrapper(props: VideoProps) {
  const error = props.video.sourceLoadError ?? null;
  return error ? (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : (
    <DismountWhenBackgrounded>
      <Video {...props} />
    </DismountWhenBackgrounded>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    flex: 1,
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
    width: "100%",
    flex: 1,
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
  },
});
