import * as Haptics from "expo-haptics";
import {
  PropsWithChildren,
  ReactElement,
  cloneElement,
  useContext,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, ColorValue, LayoutChangeEvent } from "react-native";
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
import type { IconProps } from "@react-native-vector-icons/common";

const SHORT_SWIPE_THRESHOLD = 75;
const LONG_SWIPE_THRESHOLD = 130;
const EDGE_GESTURE_ZONE = 30;

const SPRING_CONFIG = {
  stiffness: 342.1,
  damping: 36.93,
  mass: 1,
};

export type SlideItem<SlideName extends string> = {
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

  /**
   * WORKAROUND: stale child frames under RNGH's GestureDetector after a width
   * change. Found Oct 2026 on react-native 0.88.0 + react-native-gesture-handler
   * 3.3.0; still present in RN 0.88.1 and RNGH 3.4.0 (checked their source),
   * no upstream issue filed.
   *
   * Symptom: when the container gets wider or narrower without its content
   * re-rendering, the content keeps its old native frames. The 10pt separator
   * at the bottom of each post then lands outside the container and
   * `overflow: "hidden"` clips it, so separators between posts vanish (inbox
   * replies and comments are affected the same way). Spacing stays correct
   * because Yoga and FlashList see the right layout; only the mounted frames
   * are stale.
   *
   * Cause: RNGH v3's native detector is `display: contents`, so Yoga gives it
   * no frame, and RNGestureHandlerDetectorShadowNode::layout sets the frame
   * itself and shifts the children into it. A width change coming only from
   * the parent doesn't get that step to re-run for the children. Anything
   * that changes layout inside the subtree fixes it, which is why voting on
   * an affected post makes its separator come back.
   *
   * Fix: after the first layout, a width change sets an explicit width on the
   * view inside the detector. It's the width flex gives it anyway, but it
   * dirties the subtree so the detector lays its children out again. Mounting
   * doesn't re-render, since the first width only goes into the ref.
   *
   * To recheck after upgrading RN or RNGH: delete `relayoutWidth` from the
   * Animated.View's style, rebuild, then
   *   1. on an unfolded iPhone Duo (or iPad), open a feed and rotate, and
   *   2. in landscape, open a post in split view, then close the split view.
   * If the grey bands between posts all stay visible, it's fixed upstream and
   * this workaround can go. To confirm you're looking at this bug: without
   * `overflow: "hidden"` the separators show up overlapping the next post.
   */
  const layoutWidth = useRef<number | null>(null);
  const [relayoutWidth, setRelayoutWidth] = useState<number>();
  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (layoutWidth.current !== null && layoutWidth.current !== width) {
      setRelayoutWidth(width);
    }
    layoutWidth.current = width;
  };

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
    <View style={styles.slideableContainer} onLayout={onContainerLayout}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.animatedView,
            { backgroundColor: theme.background, width: relayoutWidth },
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
