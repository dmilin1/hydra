import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  StyleSheet,
  View,
} from "react-native";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "./SettingsContexts/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { useMMKVString } from "react-native-mmkv";
import { ScrollToNextButtonContext } from "./ScrollToNextButtonContext";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;
const BUTTON_SIZE = 40;
const EDGE_PADDING = 20;

export default function ScrollToNextButtonProvider({
  children,
}: PropsWithChildren) {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [showButton, setShowButton] = useState(false);
  const scrollToNext = useRef<(() => void) | null>(null);
  const scrollToPrevious = useRef<(() => void) | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);

  const CONTAINER_HEIGHT =
    WINDOW_HEIGHT - insets.top - headerHeight - tabBarHeight;
  const CONTAINER_WIDTH = WINDOW_WIDTH;

  const LOCKED_POSITIONS = {
    "bottom-right": {
      x: CONTAINER_WIDTH - BUTTON_SIZE - EDGE_PADDING,
      y:
        CONTAINER_HEIGHT -
        BUTTON_SIZE -
        EDGE_PADDING +
        insets.top +
        headerHeight,
    },
    "top-right": {
      x: CONTAINER_WIDTH - BUTTON_SIZE - EDGE_PADDING,
      y: EDGE_PADDING + insets.top + headerHeight,
    },
    "bottom-left": {
      x: EDGE_PADDING,
      y:
        CONTAINER_HEIGHT -
        BUTTON_SIZE -
        EDGE_PADDING +
        insets.top +
        headerHeight,
    },
    "top-left": {
      x: EDGE_PADDING,
      y: EDGE_PADDING + insets.top + headerHeight,
    },
    "bottom-center": {
      x: CONTAINER_WIDTH / 2 - BUTTON_SIZE / 2,
      y:
        CONTAINER_HEIGHT -
        BUTTON_SIZE -
        EDGE_PADDING +
        insets.top +
        headerHeight,
    },
    "top-center": {
      x: CONTAINER_WIDTH / 2 - BUTTON_SIZE / 2,
      y: EDGE_PADDING + insets.top + headerHeight,
    },
    "left-center": {
      x: EDGE_PADDING,
      y: CONTAINER_HEIGHT / 2 - BUTTON_SIZE / 2 + insets.top + headerHeight,
    },
    "right-center": {
      x: CONTAINER_WIDTH - BUTTON_SIZE - EDGE_PADDING,
      y: CONTAINER_HEIGHT / 2 - BUTTON_SIZE / 2 + insets.top + headerHeight,
    },
    "left-three-quarters-bottom": {
      x: EDGE_PADDING,
      y: (CONTAINER_HEIGHT * 3) / 4 - BUTTON_SIZE + insets.top + headerHeight,
    },
    "right-three-quarters-bottom": {
      x: CONTAINER_WIDTH - BUTTON_SIZE - EDGE_PADDING,
      y: (CONTAINER_HEIGHT * 3) / 4 - BUTTON_SIZE + insets.top + headerHeight,
    },
  };

  const [storedButtonPosition, setButtonPosition] = useMMKVString(
    "scrollToNextButtonPosition",
  );
  const buttonPosition = (storedButtonPosition ??
    "bottom-right") as keyof typeof LOCKED_POSITIONS;

  const [showOverlay, setShowOverlay] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const touchStartedTime = useRef<number | null>(null);
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const inMoveMode = useRef(false);

  const scrollToPreviousTimeout = useRef<number | null>(null);
  const startDragTimeout = useRef<number | null>(null);

  const clearTimeouts = () => {
    if (scrollToPreviousTimeout.current) {
      clearTimeout(scrollToPreviousTimeout.current);
    }
    if (startDragTimeout.current) {
      clearTimeout(startDragTimeout.current);
    }
  };

  const getButtonOffsetPosition = (e: GestureResponderEvent) => {
    return {
      x: e.nativeEvent.pageX - BUTTON_SIZE / 2,
      y: e.nativeEvent.pageY - BUTTON_SIZE / 2 - 30,
    };
  };

  const getHoveredLockedPosition = (btnPosition: { x: number; y: number }) => {
    for (const [positionName, lockedPosition] of Object.entries(
      LOCKED_POSITIONS,
    )) {
      const distance = Math.sqrt(
        (btnPosition.x - lockedPosition.x) ** 2 +
          (btnPosition.y - lockedPosition.y) ** 2,
      );
      if (distance < BUTTON_SIZE) {
        return {
          positionName,
          position: lockedPosition,
        };
      }
    }
  };

  const startDrag = () => {
    clearTimeouts();
    inMoveMode.current = true;
    setShowOverlay(true);
    overlayOpacity.setValue(0);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    position.setValue(LOCKED_POSITIONS[buttonPosition]);
  }, [headerHeight]);

  return (
    <ScrollToNextButtonContext.Provider
      value={{
        setShowButton,
        setScrollToNext: (fn) => {
          scrollToNext.current = fn;
        },
        setScrollToPrevious: (fn) => {
          scrollToPrevious.current = fn;
        },
        setHeaderHeight,
        setTabBarHeight,
      }}
    >
      {showButton && (
        <Animated.View
          style={[
            styles.skipToNextButton,
            {
              top: 0,
              left: 0,
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
              backgroundColor: theme.buttonBg,
              opacity: buttonOpacity,
              zIndex: 1000,
            },
          ]}
          onTouchStart={() => {
            touchStartedTime.current = Date.now();
            buttonOpacity.setValue(0.7);
            scrollToPreviousTimeout.current = setTimeout(() => {
              scrollToPrevious.current?.();
            }, 300);
            startDragTimeout.current = setTimeout(() => {
              startDrag();
            }, 1000);
          }}
          onTouchMove={(event) => {
            if (!inMoveMode.current) {
              const distance = Math.sqrt(
                event.nativeEvent.locationX ** 2 +
                  event.nativeEvent.locationY ** 2,
              );
              if (distance > 30) {
                startDrag();
              }
            }
            if (inMoveMode.current) {
              const btnPosition = getButtonOffsetPosition(event);
              const hoveredLockedPosition =
                getHoveredLockedPosition(btnPosition);
              if (hoveredLockedPosition) {
                position.setValue(hoveredLockedPosition.position);
                return;
              }
              position.setValue(btnPosition);
            }
          }}
          onTouchEnd={(e) => {
            buttonOpacity.setValue(1);
            if (inMoveMode.current) {
              const hoveredLockedPosition = getHoveredLockedPosition(
                getButtonOffsetPosition(e),
              );
              if (hoveredLockedPosition) {
                setButtonPosition(hoveredLockedPosition.positionName);
              } else {
                Animated.spring(position, {
                  toValue: LOCKED_POSITIONS[buttonPosition],
                  useNativeDriver: true,
                }).start();
              }
              inMoveMode.current = false;
              setShowOverlay(false);
            }
            if (!touchStartedTime.current) return;
            const delay = Date.now() - touchStartedTime.current;
            if (touchStartedTime.current && delay < 300) {
              clearTimeouts();
              scrollToNext.current?.();
            }
            if (startDragTimeout.current && delay < 1000) {
              clearTimeouts();
            }
          }}
        >
          <AntDesign name="down" size={18} color={theme.buttonText} />
        </Animated.View>
      )}
      {showOverlay && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          {Object.entries(LOCKED_POSITIONS).map(([key, lockedPosition]) => (
            <View
              key={key}
              style={[
                styles.lockedPosition,
                {
                  left: lockedPosition.x,
                  top: lockedPosition.y,
                  borderColor: theme.buttonBg,
                },
              ]}
            />
          ))}
        </Animated.View>
      )}
      {children}
    </ScrollToNextButtonContext.Provider>
  );
}

const styles = StyleSheet.create({
  skipToNextButton: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1000,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  overlay: {
    zIndex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  lockedPosition: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 1000,
    borderWidth: 2,
  },
});
