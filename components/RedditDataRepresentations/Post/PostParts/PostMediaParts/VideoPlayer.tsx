import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useRef, useState, useContext } from "react";
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import ImageViewer from "./ImageViewer";
import { PostInteractionContext } from "../../../../../contexts/PostInteractionContext";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import useVideoMenu from "../../../../../utils/useVideoMenu";
import { FontAwesome } from "@expo/vector-icons";
import { PostSettingsContext } from "../../../../../contexts/SettingsContexts/PostSettingsContext";

type VideoPlayerProps = {
  source: string;
  thumbnail: string;
  videoDownloadURL?: string;
  straightToFullscreen?: boolean;
  exitedFullScreenCallback?: () => void;
  aspectRatio?: number;
};

const DEVICE_HEIGHT = Dimensions.get("window").height;
const DEVICE_WIDTH = Dimensions.get("window").width;

export default function VideoPlayer({
  source,
  thumbnail,
  videoDownloadURL,
  straightToFullscreen,
  exitedFullScreenCallback,
  aspectRatio,
}: VideoPlayerProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { autoPlayVideos } = useContext(PostSettingsContext);
  const { interactedWithPost } = useContext(PostInteractionContext);
  const showVideoMenu = useVideoMenu();

  const [dontRenderYet, setDontRenderYet] = useState(
    currentDataMode === "lowData",
  );
  const [failedToLoadErr, setFailedToLoadErr] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  const player = useVideoPlayer(source, (player) => {
    player.audioMixingMode = "mixWithOthers";
    player.volume = 0;
    player.loop = true;
    player.timeUpdateEventInterval = 1 / 60;
    if (autoPlayVideos) {
      player.play();
    }
  });

  const isPlaying = useEvent(player, "playingChange")?.isPlaying;

  useEventListener(player, "sourceChange", () => {
    player.volume = 0;
  });

  useEventListener(player, "timeUpdate", (e) => {
    progress.setValue(e.currentTime / player.duration);
  });

  useEventListener(player, "statusChange", (e) => {
    if (e.error) {
      setFailedToLoadErr(e.error.message);
    } else if (e.status === "readyToPlay") {
      if (straightToFullscreen) {
        video.current?.enterFullscreen();
      }
      if (autoPlayVideos) {
        player.play();
      }
    }
  });

  useEventListener(player, "sourceChange", () => {
    // Component was recycled by FlashList. Need to reset state.
    // https://shopify.github.io/flash-list/docs/recycling
    setDontRenderYet(currentDataMode === "lowData");
    setFailedToLoadErr(null);
  });

  const videoRatio = aspectRatio ?? 1;
  const heightIfFullSize = DEVICE_WIDTH / videoRatio;
  const videoHeight = Math.min(DEVICE_HEIGHT * 0.6, heightIfFullSize);

  const video = useRef<VideoView>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const progressPercent = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.videoPlayerContainer,
        {
          height: videoHeight,
        },
      ]}
    >
      {dontRenderYet ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.imgContainer,
            {
              height: videoHeight,
            },
          ]}
          onPress={() => setDontRenderYet(false)}
        >
          {/* Have to put an invisible layer on top of the ImageViewer to keep it from stealing clicks */}
          <View style={styles.invisibleLayer} />
          <ImageViewer images={[thumbnail]} />
          <View
            style={[
              styles.isVideoContainer,
              {
                backgroundColor: theme.background,
              },
            ]}
          >
            <Text
              style={[
                styles.isVideoText,
                {
                  color: theme.text,
                },
              ]}
            >
              VIDEO
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableWithoutFeedback
            onPress={() => {
              interactedWithPost();
              video.current?.enterFullscreen();
              player.play();
            }}
            onLongPress={() =>
              videoDownloadURL ? showVideoMenu(videoDownloadURL) : null
            }
          >
            {failedToLoadErr ? (
              <View
                style={[
                  styles.video,
                  {
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.videoError,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  Failed to load video: {failedToLoadErr}
                </Text>
              </View>
            ) : (
              <View style={styles.videoContainer}>
                {!isPlaying && (
                  <View style={styles.playButtonContainer}>
                    <FontAwesome
                      name="play-circle"
                      size={50}
                      color={theme.text}
                    />
                  </View>
                )}
                <VideoView
                  ref={(videoRef) => {
                    video.current = videoRef;
                  }}
                  allowsPictureInPicture={isFullscreen || isPictureInPicture}
                  player={player}
                  style={styles.video}
                  onFullscreenEnter={() => {
                    setIsFullscreen(true);
                    player.volume = 1;
                  }}
                  onFullscreenExit={() => {
                    setIsFullscreen(false);
                    player.volume = 0;
                    exitedFullScreenCallback?.();
                    if (autoPlayVideos) {
                      player.play();
                    } else {
                      player.pause();
                    }
                  }}
                  onPictureInPictureStop={() => {
                    player.volume = 0;
                    setIsPictureInPicture(false);
                    exitedFullScreenCallback?.();
                  }}
                  onPictureInPictureStart={() => {
                    setIsPictureInPicture(true);
                    setTimeout(() => {
                      player.volume = 1;
                    }, 750);
                  }}
                />
              </View>
            )}
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.progressContainer,
              {
                backgroundColor: theme.background,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: theme.subtleText,
                  width: progressPercent,
                },
              ]}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoPlayerContainer: {
    flex: 1,
  },
  imgContainer: {
    marginVertical: 10,
  },
  invisibleLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  isVideoContainer: {
    position: "absolute",
    borderRadius: 5,
    overflow: "hidden",
    margin: 5,
    left: 0,
    bottom: 0,
    opacity: 0.6,
  },
  isVideoText: {
    padding: 5,
  },
  videoContainer: {
    flex: 1,
  },
  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    zIndex: 1,
  },
  video: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    height: 1,
  },
  progressBar: {
    flex: 1,
  },
  videoError: {
    marginHorizontal: 20,
  },
});
