import * as Haptics from "expo-haptics";
import {
  PropsWithChildren,
  ReactElement,
  cloneElement,
  useContext,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Animated, ColorValue } from "react-native";

import { ScrollerContext } from "../../contexts/ScrollerContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { GesturesContext } from "../../contexts/SettingsContexts/GesturesContext";
import { IconProps } from "@expo/vector-icons/build/createIconSet";

const SHORT_SWIPE_THRESHOLD = 75;
const LONG_SWIPE_THRESHOLD = 130;

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

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchX = useRef(new Animated.Value(0)).current;

  const [slideItem, setSlideItem] = useState<
    SlideItem<SlideName> & { side: "left" | "right" }
  >();

  const lookupOption = (name: SlideName | undefined) =>
    options.find((option) => option.name === name);

  const shortLeftItem = lookupOption(shortLeftName);
  const longLeftItem = lookupOption(longLeftName);
  const shortRightItem = lookupOption(shortRightName);
  const longRightItem = lookupOption(longRightName);

  const resolveActiveItemForDelta = (delta: number) => {
    const [shortItem, longItem] =
      delta > 0
        ? [shortLeftItem, longLeftItem]
        : [shortRightItem, longRightItem];
    const absD = Math.abs(delta);
    if (absD >= LONG_SWIPE_THRESHOLD) return longItem ?? shortItem;
    if (absD >= SHORT_SWIPE_THRESHOLD) return shortItem;
    return undefined;
  };

  return (
    <View
      style={styles.slideableContainer}
      onStartShouldSetResponderCapture={(e) => {
        touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        return false;
      }}
      onResponderGrant={() => setScrollDisabled(true)}
      onResponderReject={() => setScrollDisabled(false)}
      onMoveShouldSetResponder={(e) => {
        if (!touchStart.current) return false;
        const deltaX = e.nativeEvent.pageX - touchStart.current.x;
        const deltaY = e.nativeEvent.pageY - touchStart.current.y;
        const isSwipeAllowed = !swipeAnywhereToNavigate || deltaX < 0;
        if (
          Math.abs(deltaX) > (xScrollToEngage ?? 20) &&
          Math.abs(deltaY) < 10 &&
          isSwipeAllowed
        ) {
          touchStart.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          };
          return true;
        }
        return false;
      }}
      onResponderMove={(e) => {
        if (touchStart.current) {
          const delta = Math.min(
            e.nativeEvent.pageX - touchStart.current.x,
            swipeAnywhereToNavigate ? 0 : 1000,
          );
          touchX.setValue(delta);
          const item = resolveActiveItemForDelta(delta);
          if (item?.name !== slideItem?.name) {
            setSlideItem(
              item
                ? { side: delta > 0 ? "left" : "right", ...item }
                : undefined,
            );
            if (item) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }}
      onResponderEnd={(e) => {
        if (touchStart.current) {
          const delta = e.nativeEvent.pageX - touchStart.current.x;
          if (swipeAnywhereToNavigate && delta > 0) {
            setScrollDisabled(false);
            return;
          }
          const item = resolveActiveItemForDelta(delta);
          if (item) {
            item.action();
          }
          Animated.spring(touchX, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start(() => {
            setSlideItem(undefined);
          });
        }
        setScrollDisabled(false);
      }}
      onResponderTerminationRequest={() => false}
    >
      <Animated.View
        style={[
          styles.animatedView,
          {
            backgroundColor: theme.background,
            transform: [
              {
                translateX: touchX,
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
      <View
        style={[
          styles.backgroundContainer,
          {
            backgroundColor: slideItem?.color ?? theme.tint,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              marginLeft: slideItem?.side === "left" ? 0 : "auto",
            },
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
    flex: 1,
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
