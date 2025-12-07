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

type SlideItem<SlideName extends string> = {
  name: SlideName;
  icon: ReactElement<IconProps<string>>;
  size?: number;
  color: ColorValue;
  action: () => void;
};

type SlideableProps<SlideName extends string> = {
  options: SlideItem<SlideName>[];
  leftNames?: SlideName[];
  rightNames?: SlideName[];
  xScrollToEngage?: number;
};

export default function Slideable<SlideName extends string>({
  children,
  options,
  leftNames,
  rightNames,
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

  const left = leftNames
    ?.map((name) => options.find((option) => option.name === name))
    .filter((option) => option !== undefined);
  const right = rightNames
    ?.map((name) => options.find((option) => option.name === name))
    .filter((option) => option !== undefined);

  let icon = null;
  if (slideItem?.icon) {
    icon = slideItem.icon;
  } else if (slideItem?.side === "left" && left && left.length > 0) {
    icon = left[0].icon;
  } else if (slideItem?.side === "right" && right && right.length > 0) {
    icon = right[0].icon;
  }

  const calcItem = (list: SlideItem<SlideName>[], delta: number) => {
    const baseSlideDistance = 20;
    const distanceBetweenItems = 55;
    return list[
      Math.min(
        Math.floor(
          (Math.abs(delta) - baseSlideDistance) / distanceBetweenItems,
        ),
        list.length,
      ) - 1
    ];
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
            e.nativeEvent.pageX - touchStart.current?.x,
            swipeAnywhereToNavigate ? 0 : -1000,
          );
          touchX.setValue(delta);

          let item = null;
          if (delta > 0 && left) {
            item = calcItem(left, delta);
          }
          if (delta < 0 && right) {
            item = calcItem(right, delta);
          }
          if (item && item.name !== slideItem?.name) {
            setSlideItem({
              side: delta > 0 ? "left" : "right",
              ...item,
            });
          }
          if (!item && slideItem) {
            setSlideItem(undefined);
          }
          if (item && item.name !== slideItem?.name) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }}
      onResponderEnd={(e) => {
        if (touchStart.current) {
          const delta = e.nativeEvent.pageX - touchStart.current?.x;
          if (swipeAnywhereToNavigate && delta > 0) {
            setScrollDisabled(false);
            return;
          }
          let item = null;
          if (delta > 0 && left) {
            item = calcItem(left, delta);
          }
          if (delta < 0 && right) {
            item = calcItem(right, delta);
          }
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
          {icon &&
            cloneElement(icon, {
              color: theme.text,
              size: slideItem?.size ?? 32,
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
