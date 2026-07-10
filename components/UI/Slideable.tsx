import * as Haptics from "expo-haptics";
import {
  PropsWithChildren,
  ReactElement,
  cloneElement,
  useContext,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, ColorValue } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

import { ScrollerContext } from "../../contexts/ScrollerContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { GesturesContext } from "../../contexts/SettingsContexts/GesturesContext";
import { IconProps } from "@expo/vector-icons/build/createIconSet";

const SHORT_SWIPE_THRESHOLD = 75;
const LONG_SWIPE_THRESHOLD = 130;
const EDGE_GESTURE_ZONE = 30;

const SPRING_CONFIG = {
  stiffness: 342.1,
  damping: 36.93,
  mass: 1,
};

type SlideItem<SlideName extends string> = {
  name: SlideName;
  icon: ReactElement<IconProps<string>>;
  size?: number;
  color: ColorValue;
  action: () => void;
};

type SlideableProps<SlideName extends string> = {
  options: SlideItem<SlideName>[];
  shortLeftName?: SlideName;
  longLeftName?: SlideName;
  shortRightName?: SlideName;
  longRightName?: SlideName;
  xScrollToEngage?: number;
};

function levelForDelta(delta: number) {
  "worklet";
  const absDelta = Math.abs(delta);
  const magnitude =
    absDelta >= LONG_SWIPE_THRESHOLD
      ? 2
      : absDelta >= SHORT_SWIPE_THRESHOLD
        ? 1
        : 0;
  return delta > 0 ? magnitude : delta < 0 ? -magnitude : 0;
}

export default function Slideable<SlideName extends string>({
  children,
  options,
  shortLeftName,
  longLeftName,
  shortRightName,
  longRightName,
  xScrollToEngage,
}: PropsWithChildren<SlideableProps<SlideName>>) {
  const { theme } = useContext(ThemeContext);
  const { setScrollDisabled } = useContext(ScrollerContext);
  const { swipeAnywhereToNavigate } = useContext(GesturesContext);

  const [slideItem, setSlideItem] = useState<
    SlideItem<SlideName> & { side: "left" | "right" }
  >();

  const lookupOption = (name: SlideName | undefined) =>
    options.find((option) => option.name === name);

  const shortLeftItem = lookupOption(shortLeftName);
  const longLeftItem = lookupOption(longLeftName);
  const shortRightItem = lookupOption(shortRightName);
  const longRightItem = lookupOption(longRightName);

  const itemForLevel = (level: number) => {
    if (level === 2) return longLeftItem ?? shortLeftItem;
    if (level === 1) return shortLeftItem;
    if (level === -2) return longRightItem ?? shortRightItem;
    if (level === -1) return shortRightItem;
    return undefined;
  };

  const activeName = useRef<SlideName | undefined>(undefined);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const prevLevel = useSharedValue(0);
  const isSliding = useSharedValue(false);

  const handleLevelChange = (level: number) => {
    const item = itemForLevel(level);
    if (item?.name === activeName.current) return;
    activeName.current = item?.name;
    setSlideItem(
      item ? { side: level > 0 ? "left" : "right", ...item } : undefined,
    );
    if (item) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRelease = (delta: number) => {
    if (swipeAnywhereToNavigate && delta > 0) return;
    itemForLevel(levelForDelta(delta))?.action();
  };

  const resetSlideItem = () => {
    activeName.current = undefined;
    setSlideItem(undefined);
  };

  const engageThreshold = xScrollToEngage ?? 20;

  const panGesture = usePanGesture({
    activeOffsetX: swipeAnywhereToNavigate
      ? -engageThreshold
      : [-engageThreshold, engageThreshold],
    failOffsetY: [-10, 10],
    // Keeps the pan from starting in the screen-edge bands so the native back
    // swipe and the forward swipe (StackFutureContext) keep working.
    hitSlop: { left: -EDGE_GESTURE_ZONE, right: -EDGE_GESTURE_ZONE },
    onActivate: (e) => {
      "worklet";
      isSliding.value = true;
      startX.value = e.translationX;
      prevLevel.value = 0;
      runOnJS(setScrollDisabled)(true);
    },
    onUpdate: (e) => {
      "worklet";
      const delta = Math.min(
        e.translationX - startX.value,
        swipeAnywhereToNavigate ? 0 : 1000,
      );
      translateX.value = delta;
      const level = levelForDelta(delta);
      if (level !== prevLevel.value) {
        prevLevel.value = level;
        runOnJS(handleLevelChange)(level);
      }
    },
    onDeactivate: (e) => {
      "worklet";
      if (!e.canceled) runOnJS(handleRelease)(e.translationX - startX.value);
    },
    onFinalize: () => {
      "worklet";
      if (!isSliding.value) return;
      isSliding.value = false;
      prevLevel.value = 0;
      translateX.value = withSpring(0, SPRING_CONFIG, (finished) => {
        if (finished) runOnJS(resetSlideItem)();
      });
      runOnJS(setScrollDisabled)(false);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.slideableContainer}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.animatedView,
            { backgroundColor: theme.background },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
      <View
        style={[
          styles.backgroundContainer,
          { backgroundColor: slideItem?.color ?? theme.tint },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { marginLeft: slideItem?.side === "left" ? 0 : "auto" },
          ]}
        >
          {slideItem?.icon &&
            cloneElement(slideItem.icon, {
              color: theme.text,
              size: slideItem.size ?? 32,
            })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideableContainer: {
    flexDirection: "row",
    overflow: "hidden",
  },
  animatedView: {
    flex: 1,
  },
  backgroundContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  iconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
