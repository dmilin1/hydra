import React, { useRef, useState, useContext, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Video, ResizeMode, VideoFullscreenUpdate, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { ThemeContext, t } from '../../contexts/ThemeContext';


export default function VideoPlayer({ source }: { source: string }) {
  const theme = useContext(ThemeContext);
  
  const [fullscreen, setFullscreen] = useState(false);
  
  const video = useRef<Video>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastProgress = useRef(0);

  return (
    <View style={styles.videoPlayerContainer}>
        <TouchableWithoutFeedback
          onPress={() => video.current?.presentFullscreenPlayer()}
        >
          <Video
            ref={video}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            source={{ uri: source }}
            isLooping={true}
            shouldPlay={true}
            useNativeControls={fullscreen}
            volume={fullscreen ? 1 : 0}
            onFullscreenUpdate={(e) => {
              setFullscreen(
                e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_PRESENT
                || e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT
              );
              if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                video.current?.playAsync();
              }
            }}
            onPlaybackStatusUpdate={(e: AVPlaybackStatus) => {
              const status = e as AVPlaybackStatusSuccess;
              if (!status.durationMillis) return;
              const newProgress = (status.progressUpdateIntervalMillis + status.positionMillis) / status.durationMillis;
              Animated.timing(progressAnim, {
                toValue: newProgress,
                duration: newProgress < lastProgress.current ? 0 : 500,
                useNativeDriver: false,
                easing: Easing.linear,
              }).start();
              lastProgress.current = newProgress;
            }}
            progressUpdateIntervalMillis={500}
          />
      </TouchableWithoutFeedback>
      <View style={t(styles.progressContainer, {
        backgroundColor: theme.background,
      })}>
        <Animated.View style={t(styles.progressBar, {
          backgroundColor: theme.tint,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        })}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoPlayerContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  progressContainer: {
    height: 5,
  },
  progressBar: {
    flex: 1,
  }
});
