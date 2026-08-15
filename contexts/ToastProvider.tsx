import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

import { ToastContext, ToastOptions } from "./ToastContext";
import { ThemeContext } from "./SettingsContexts/ThemeContext";

const DEFAULT_DELAY_MS = 2_000;
const HIDE_DURATION_MS = 200;
const DISMISS_DRAG_THRESHOLD = -20;
const DISMISS_VELOCITY_THRESHOLD = -500;
// Anywhere offscreen. Corrected to the real height on first layout.
const INITIAL_OFFSCREEN_Y = -1_000;

const SPRING_CONFIG = {
  stiffness: 342.1,
  damping: 36.93,
  mass: 1,
};

type Toast = ToastOptions & {
  delay: number;
};

export function ToastProvider({ children }: React.PropsWithChildren) {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<Toast | null>(null);

  const translateY = useSharedValue(INITIAL_OFFSCREEN_Y);
  const toastHeight = useSharedValue(-INITIAL_OFFSCREEN_Y);
  const progress = useSharedValue(1);
  const onScreen = useRef(false);
  const autoDismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = () => {
    onScreen.current = false;
    setToast(null);
  };

  const dismiss = () => {
    cancelAutoDismiss();
    translateY.value = withTiming(
      -toastHeight.value,
      { duration: HIDE_DURATION_MS },
      (finished) => {
        if (finished) runOnJS(clearToast)();
      },
    );
  };

  // Freezes the progress bar in place along with the timer it mirrors.
  const cancelAutoDismiss = () => {
    if (autoDismissTimeout.current) clearTimeout(autoDismissTimeout.current);
    cancelAnimation(progress);
  };

  const startAutoDismiss = () => {
    if (!toast) return;
    cancelAutoDismiss();
    autoDismissTimeout.current = setTimeout(dismiss, toast.delay);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: toast.delay,
      easing: Easing.linear,
    });
  };

  useEffect(() => {
    if (toast) startAutoDismiss();
    return cancelAutoDismiss;
  }, [toast]);

  const showToast = ({
    title,
    body,
    delay = DEFAULT_DELAY_MS,
  }: ToastOptions) => {
    setToast({ title, body, delay });
    // Interrupts an in-flight hide animation. Interrupting it also keeps its
    // completion callback from clearing the replacement toast.
    if (onScreen.current) translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const onToastLayout = (e: LayoutChangeEvent) => {
    toastHeight.value = e.nativeEvent.layout.height;
    if (!onScreen.current) {
      onScreen.current = true;
      translateY.value = -e.nativeEvent.layout.height;
      translateY.value = withSpring(0, SPRING_CONFIG);
    }
  };

  const panGesture = usePanGesture({
    activeOffsetY: [-5, 5],
    onActivate: () => {
      "worklet";
      runOnJS(cancelAutoDismiss)();
    },
    onUpdate: (e) => {
      "worklet";
      // Upward tracks the finger. Downward drags away from the dismiss
      // direction, so they just stretch with heavy resistance.
      translateY.value =
        e.translationY > 0 ? e.translationY / 15 : e.translationY;
    },
    onDeactivate: (e) => {
      "worklet";
      if (
        !e.canceled &&
        (e.translationY < DISMISS_DRAG_THRESHOLD ||
          e.velocityY < DISMISS_VELOCITY_THRESHOLD)
      ) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
        runOnJS(startAutoDismiss)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Drains toward the center as the auto dismiss delay runs out.
  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  /**
   * Since this provider only provides functions, we need to memoize the value
   * or all consumers will re-render when the provider re-renders.
   */
  const value = useMemo(
    () => ({
      showToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.toastContainer,
            { paddingTop: Math.max(insets.top, 12) },
            animatedStyle,
          ]}
          onLayout={onToastLayout}
        >
          <GestureDetector gesture={panGesture}>
            <View
              style={[
                styles.toast,
                {
                  backgroundColor: theme.tint,
                  borderColor: theme.verySubtleText,
                  shadowColor: theme.background,
                },
              ]}
            >
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={2}
              >
                {toast.title}
              </Text>
              {toast.body ? (
                <Text
                  style={[styles.body, { color: theme.subtleText }]}
                  numberOfLines={3}
                >
                  {toast.body}
                </Text>
              ) : null}
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.iconOrTextButton },
                  progressStyle,
                ]}
              />
            </View>
          </GestureDetector>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  toast: {
    maxWidth: "100%",
    minWidth: 200,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 22,
    borderRadius: 200,
    borderWidth: 1,
    borderBottomWidth: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
  },
  body: {
    marginTop: 2,
    fontSize: 14,
    textAlign: "center",
  },
  progressBar: {
    alignSelf: "stretch",
    height: 1,
    marginTop: 8,
    borderRadius: 2,
    transformOrigin: "left",
  },
});
