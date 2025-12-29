import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
} from "react-native";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Revisit this to add better video scrubbing using changes introduced to
 * expo-video in this PR:
 * https://github.com/expo/expo/pull/40203
 */

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

export default function Video({
  uri,
  focused,
  overlayOpacity,
}: {
  uri: string;
  focused: boolean;
  overlayOpacity: Animated.Value;
}) {
  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const aspectRatio = dimensions.width / dimensions.height;

  const progress = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(uri, (player) => {
    player.audioMixingMode = "mixWithOthers";
    player.loop = true;
    player.timeUpdateEventInterval = 1 / 15;
  });

  const touchStart = useRef({
    x: 0,
    y: 0,
    videoTime: 0,
    initiallyPlaying: player.playing,
    isSkimming: false,
  });

  const [isPlaying, setIsPlaying] = useState(player.playing);

  const playbackRate = useEvent(player, "playbackRateChange")?.playbackRate;

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

  const dropDragEventCount = useRef(-1);
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
    dropDragEventCount.current++;
    if (dropDragEventCount.current % 2 !== 0) {
      return;
    }
    const videoChange = deltaX / (width / player.duration);
    // player.seekBy(videoChange);
    player.currentTime = touchStart.current.videoTime + videoChange;
  };

  useEffect(() => {
    if (focused) {
      player.play();
      player.volume = 1;
    } else {
      player.pause();
      player.volume = 0;
    }
  }, [focused]);

  return (
    <View
      style={{ width, height, justifyContent: "center" }}
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
      <View
        style={{ position: "relative", width, height: width / aspectRatio }}
      >
        <VideoView
          player={player}
          style={{ width, flex: 1 }}
          contentFit="contain"
          nativeControls={false}
          allowsVideoFrameAnalysis={false}
        />
        <Animated.View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            opacity: overlayOpacity,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 100,
              padding: 15,
              aspectRatio: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
            }}
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
                style={{ marginRight: -5 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              width: "200%",
              left: "-100%",
              height: 2,
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
      <Animated.View
        style={{
          position: "absolute",
          top: top + 10,
          left: 10,
          opacity: overlayOpacity,
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: 100,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(100, 100, 100, 0.5)",
            width: 40,
            aspectRatio: 1,
          }}
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
