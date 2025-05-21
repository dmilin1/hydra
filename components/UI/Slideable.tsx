import * as Haptics from "expo-haptics";
import { ReactNode, cloneElement, useContext, useRef, useState } from "react";
import { View, StyleSheet, Animated, ColorValue } from "react-native";

import { ScrollerContext } from "../../contexts/ScrollerContext";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { IconProps } from "@expo/vector-icons/build/createIconSet";

type SlideItem = {
  icon: ReactNode;
  color: ColorValue;
  action: () => void;
};

type SlideableProps = {
  left?: SlideItem[];
  right?: SlideItem[];
  xScrollToEngage?: number;
};

export default function Slideable({
  children,
  left,
  right,
  xScrollToEngage,
}: React.PropsWithChildren<SlideableProps>) {
  const { theme } = useContext(ThemeContext);
  const { setScrollDisabled } = useContext(ScrollerContext);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchX = useRef(new Animated.Value(0)).current;

  const [slideItem, setSlideItem] = useState<
    SlideItem & { side: keyof SlideableProps }
  >();

  let icon = null;
  if (slideItem?.icon) {
    icon = slideItem.icon;
  } else if (slideItem?.side === "left" && left && left.length > 0) {
    icon = left[0].icon;
  } else if (slideItem?.side === "right" && right && right.length > 0) {
    icon = right[0].icon;
  }

  const calcItem = (list: SlideItem[], delta: number) => {
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
        if (
          touchStart.current &&
          Math.abs(e.nativeEvent.pageX - touchStart.current?.x) >
            (xScrollToEngage ?? 20) &&
          Math.abs(e.nativeEvent.pageY - touchStart.current?.y) < 10
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
          const delta = e.nativeEvent.pageX - touchStart.current?.x;
          touchX.setValue(delta);

          let item = null;
          if (delta > 0 && left) {
            item = calcItem(left, delta);
          }
          if (delta < 0 && right) {
            item = calcItem(right, delta);
          }
          if (item && item.color !== slideItem?.color) {
            setSlideItem({
              side: delta > 0 ? "left" : "right",
              ...item,
            });
          }
          if (!item && slideItem) {
            setSlideItem(undefined);
          }
          if (item && item.color !== slideItem?.color) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }}
      onResponderEnd={(e) => {
        if (touchStart.current) {
          const delta = e.nativeEvent.pageX - touchStart.current?.x;
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
        style={t(styles.animatedView, {
          backgroundColor: theme.background,
          transform: [
            {
              translateX: touchX,
            },
          ],
        })}
      >
        {children}
      </Animated.View>
      <View
        style={t(styles.backgroundContainer, {
          backgroundColor: slideItem?.color ?? theme.tint,
        })}
      >
        <View
          style={t(styles.iconContainer, {
            marginLeft: slideItem?.side === "left" ? 0 : "auto",
          })}
        >
          {icon &&
            cloneElement(icon as React.ReactElement<IconProps<string>>, {
              color: slideItem?.color ? theme.text : theme.subtleText,
              size: slideItem?.color ? 32 : 28,
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
