import {
  Video,
  ResizeMode,
  VideoFullscreenUpdate,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
} from "expo-av";
import { Sound, SoundObject } from "expo-av/build/Audio";
import React, { useRef, useState, useContext, useEffect } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import ImageViewer from "./ImageViewer";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";

type VideoPlayerProps = {
  source: string;
  thumbnail: string;
};

export default function VideoPlayer({ source, thumbnail }: VideoPlayerProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);

  const [dontRenderYet, setDontRenderYet] = useState(
    currentDataMode === "lowData",
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);

  const video = useRef<Video>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastProgress = useRef(0);
  const lastProgressMillis = useRef(0);
  const isFullscreen = useRef(false);
  const audio = useRef<SoundObject>();
  const audioIsPlaying = useRef(false);
  const isChangingAudio = useRef(false);

  const loadAudio = async () => {
    const audioUrl = source.replace(/DASH_\d+/, "DASH_AUDIO_128");
    try {
      audio.current = await Sound.createAsync({ uri: audioUrl });
      audio.current.sound.setIsLoopingAsync(true);
    } catch {
      /* video has no audio */
    }
  };

  const oneChangeAtATime = async (func: Function) => {
    if (isChangingAudio.current) return;
    isChangingAudio.current = true;
    await func();
    isChangingAudio.current = false;
  };

  useEffect(() => {
    loadAudio();
  }, []);

  return (
    <View style={styles.videoPlayerContainer}>
      {dontRenderYet ? (
        <TouchableOpacity
          style={styles.imgContainer}
          onPress={() => setDontRenderYet(false)}
        >
          {/* Have to put an invisible layer on top of the ImageViewer to keep it from stealing clicks */}
          <View style={styles.invisibleLayer} />
          <ImageViewer images={[thumbnail]} />
          <View
            style={t(styles.isVideoContainer, {
              backgroundColor: theme.background,
            })}
          >
            <Text
              style={t(styles.isVideoText, {
                color: theme.text,
              })}
            >
              VIDEO
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableWithoutFeedback
            onPress={() => video.current?.presentFullscreenPlayer()}
          >
            {failedToLoad ? (
              <View
                style={t(styles.video, {
                  backgroundColor: theme.background,
                })}
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
                  onFullscreenUpdate={(e) => {
                    setFullscreen(
                      e.fullscreenUpdate ===
                        VideoFullscreenUpdate.PLAYER_WILL_PRESENT ||
                        e.fullscreenUpdate ===
                          VideoFullscreenUpdate.PLAYER_DID_PRESENT,
                    );
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
            style={t(styles.progressContainer, {
              backgroundColor: theme.background,
            })}
          >
            <Animated.View
              style={t(styles.progressBar, {
                backgroundColor: theme.tint,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              })}
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
    height: 200,
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
