import {
  Video,
  ResizeMode,
  VideoFullscreenUpdate,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
} from "expo-av";
import { Sound, SoundObject, setAudioModeAsync } from "expo-av/build/Audio";
import React, { useRef, useState, useContext, useEffect } from "react";
import {
  Animated,
  Easing,
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

type VideoPlayerProps = {
  source: string;
  thumbnail: string;
  redditAudioSource?: string;
  straightToFullscreen?: boolean;
  exitedFullScreenCallback?: () => void;
  aspectRatio?: number;
};

const DEVICE_HEIGHT = Dimensions.get("window").height;
const DEVICE_WIDTH = Dimensions.get("window").width;

export default function VideoPlayer({
  source,
  thumbnail,
  redditAudioSource,
  straightToFullscreen,
  exitedFullScreenCallback,
  aspectRatio,
}: VideoPlayerProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { interactedWithPost } = useContext(PostInteractionContext);

  const showVideoMenu = useVideoMenu();

  const [dontRenderYet, setDontRenderYet] = useState(
    currentDataMode === "lowData",
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);

  const lastLoadedVideo = useRef(source);
  if (lastLoadedVideo.current !== source) {
    // Component was recycled by FlashList. Need to reset state.
    // https://shopify.github.io/flash-list/docs/recycling
    lastLoadedVideo.current = source;
    setDontRenderYet(currentDataMode === "lowData");
    setFullscreen(false);
    setFailedToLoad(false);
  }

  const videoRatio = aspectRatio ?? 1;
  const heightIfFullSize = DEVICE_WIDTH / videoRatio;
  const videoHeight = Math.min(DEVICE_HEIGHT * 0.6, heightIfFullSize);

  const video = useRef<Video>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastProgress = useRef(0);
  const lastProgressMillis = useRef(0);
  const isFullscreen = useRef(false);
  const audio = useRef<SoundObject | null>(null);
  const audioIsPlaying = useRef(false);
  const isChangingAudio = useRef(false);

  const loadAudio = async () => {
    if (!redditAudioSource) return;
    await setAudioModeAsync({ playsInSilentModeIOS: true });
    try {
      audio.current = await Sound.createAsync({ uri: redditAudioSource });
      audio.current.sound.setIsLoopingAsync(true);
    } catch {
      /* video has no audio */
    }
  };

  const oneChangeAtATime = async (func: () => Promise<void>) => {
    if (isChangingAudio.current) return;
    isChangingAudio.current = true;
    await func();
    isChangingAudio.current = false;
  };

  useEffect(() => {
    loadAudio();
    return () => {
      audio.current?.sound.unloadAsync();
    };
  }, [redditAudioSource]);

  useEffect(() => {
    if (fullscreen || straightToFullscreen) {
      interactedWithPost();
    }
  }, [fullscreen, straightToFullscreen]);

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
            onPress={() => video.current?.presentFullscreenPlayer()}
            onLongPress={() => showVideoMenu(source)}
          >
            {failedToLoad ? (
              <View
                style={[
                  styles.video,
                  {
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.subtleText,
                  }}
                >
                  Failed to load video
                </Text>
              </View>
            ) : (
              /**
               * Had to add this seeminly useless View as well as the
               * width: 100%, height 100% properties to fix this bug:
               * https://github.com/expo/expo/issues/26829
               */
              <View style={styles.video}>
                <Video
                  ref={video}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  source={{
                    uri: source,
                    headers: {
                      "User-Agent": "Hydra",
                    },
                  }}
                  isLooping
                  shouldPlay
                  useNativeControls={fullscreen}
                  volume={fullscreen ? 1 : 0}
                  onLoad={() => {
                    if (straightToFullscreen) {
                      video.current?.presentFullscreenPlayer();
                    }
                  }}
                  onFullscreenUpdate={(e) => {
                    const newFullscreen =
                      e.fullscreenUpdate ===
                        VideoFullscreenUpdate.PLAYER_WILL_PRESENT ||
                      e.fullscreenUpdate ===
                        VideoFullscreenUpdate.PLAYER_DID_PRESENT;
                    setFullscreen(newFullscreen);
                    if (!newFullscreen) {
                      exitedFullScreenCallback?.();
                    }
                    if (
                      e.fullscreenUpdate ===
                      VideoFullscreenUpdate.PLAYER_DID_PRESENT
                    ) {
                      audio.current?.sound.playFromPositionAsync(
                        lastProgressMillis.current,
                      );
                      audioIsPlaying.current = true;
                      isFullscreen.current = true;
                    }
                    if (
                      e.fullscreenUpdate ===
                      VideoFullscreenUpdate.PLAYER_DID_DISMISS
                    ) {
                      video.current?.playAsync();
                      audio.current?.sound.pauseAsync();
                      audioIsPlaying.current = false;
                      isFullscreen.current = false;
                    }
                  }}
                  onPlaybackStatusUpdate={async (e: AVPlaybackStatus) => {
                    const status = e as AVPlaybackStatusSuccess;
                    if (!status.durationMillis) return;
                    const newProgress =
                      (status.progressUpdateIntervalMillis +
                        status.positionMillis) /
                      status.durationMillis;
                    Animated.timing(progressAnim, {
                      toValue: newProgress,
                      duration: newProgress < lastProgress.current ? 0 : 500,
                      useNativeDriver: false,
                      easing: Easing.linear,
                    }).start();
                    lastProgress.current = newProgress;
                    lastProgressMillis.current = status.positionMillis;
                    if (!audio.current) return;
                    const audioStatus =
                      (await audio.current?.sound.getStatusAsync()) as AVPlaybackStatusSuccess;
                    const audioDelay = Math.abs(
                      audioStatus.positionMillis - status.positionMillis,
                    );
                    if (audioDelay > 500 && isFullscreen.current) {
                      oneChangeAtATime(async () => {
                        /* adding ~150ms to account for OS time to set play spot */
                        audio.current?.sound.setPositionAsync(
                          audioStatus.positionMillis + audioDelay + 150,
                        );
                      });
                    }
                    if (audioIsPlaying.current && !status.isPlaying) {
                      audio.current?.sound.pauseAsync();
                      audioIsPlaying.current = false;
                    }
                    if (
                      !audioIsPlaying.current &&
                      status.isPlaying &&
                      isFullscreen.current
                    ) {
                      audio.current?.sound.playFromPositionAsync(
                        status.durationMillis,
                      );
                      audioIsPlaying.current = true;
                    }
                  }}
                  progressUpdateIntervalMillis={500}
                  onError={() => {
                    setFailedToLoad(true);
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
                  backgroundColor: theme.tint,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
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
  video: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    height: 5,
  },
  progressBar: {
    flex: 1,
  },
});
