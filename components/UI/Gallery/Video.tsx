import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useContext, useEffect, useRef } from "react";
import { Animated, AppState, StyleSheet, View } from "react-native";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import DismountWhenBackgrounded from "../../Other/DismountWhenBackgrounded";
import VideoCache from "../../../utils/VideoCache";

type VideoProps = {
  uri: string;
};

function Video({ uri }: VideoProps) {
  const { theme } = useContext(ThemeContext);
  const progress = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(
    VideoCache.makeCachedVideoSource(uri),
    (player) => {
      player.audioMixingMode = "mixWithOthers";
      player.volume = 0;
      player.loop = true;
      player.timeUpdateEventInterval = 1 / 15;
      player.play();
    },
  );

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

  return (
    <View style={styles.videoContainer} pointerEvents="box-none">
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsVideoFrameAnalysis={false}
      />
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
  return (
    <DismountWhenBackgrounded>
      <Video {...props} />
    </DismountWhenBackgrounded>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: "100%",
    flex: 1,
    position: "relative",
    overflow: "hidden",
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
