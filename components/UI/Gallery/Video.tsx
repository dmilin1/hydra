import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useContext, useEffect, useRef } from "react";
import { Animated, AppState, View } from "react-native";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";

export default function Video({ uri }: { uri: string }) {
    const { theme } = useContext(ThemeContext);
    const progress = useRef(new Animated.Value(0)).current;

    const player = useVideoPlayer(uri, (player) => {
        player.audioMixingMode = "mixWithOthers";
        player.volume = 0;
        player.loop = true;
        player.timeUpdateEventInterval = 1 / 15;
        player.play();
    });

    useEventListener(player, "timeUpdate", (e) => {
        progress.setValue(e.currentTime / player.duration);
    });

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active" && player.status === 'readyToPlay') {
                player.play();
            }
        });
        return () => subscription.remove();
    }, [player]);

    return (
        <View style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden' }} pointerEvents="box-none">
            <VideoView
                player={player}
                style={{ width: '100%', flex: 1 }}
                contentFit="contain"
                nativeControls={false}
                allowsVideoFrameAnalysis={false}
            />
            <Animated.View style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    width: '200%',
                    left: '-100%',
                    height: 2,
                    backgroundColor: theme.subtleText,
                    transform: [{
                        scaleX: progress,
                    }],
                },
            ]} />
        </View>
    )
}