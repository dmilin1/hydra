import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function useVoteBounce() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const bounce = () => {
    cancelAnimation(scale);
    scale.value = 1;
    scale.value = withSequence(
      withTiming(1.2, { duration: 75 }),
      withSpring(1, {
        stiffness: 500,
        damping: 23,
        mass: 0.7,
        overshootClamping: false,
      }),
    );
  };
  return { style, bounce };
}
