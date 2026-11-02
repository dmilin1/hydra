import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  ScrollViewInstance,
  ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SafeAreaView as ScreensSafeAreaView,
  ScrollViewMarker,
} from "react-native-screens/experimental";

import {
  TabBarHiddenContext,
  USES_NATIVE_TAB_BAR_MINIMIZE,
} from "./TabScrollContext";

type TabBarInsets = { bottom: number; left: number; right: number };

const TabBarInsetsContext = createContext<TabBarInsets>({
  bottom: 0,
  left: 0,
  right: 0,
});

export const useTabBarInsets = () => useContext(TabBarInsetsContext);

// Every tab shares the bar, so a newly mounted tab starts from the last measurement
let lastInsets: TabBarInsets | null = null;

/**
 * Native tabs don't expose the tab bar's size, and it isn't always at the
 * bottom (iPad floats it at the top, iPhone Duo can put it on a side). The
 * screens SafeAreaView knows the tab's real insets and applies them as margins,
 * so measuring its frame against the container recovers them. Only one per tab:
 * on Android each new one replaces the previous one's inset listener.
 */
export function TabBarInsetsProvider({ children }: PropsWithChildren) {
  const safeAreaInsets = useSafeAreaInsets();
  const [insets, setInsets] = useState<TabBarInsets>(
    () =>
      lastInsets ?? {
        bottom: 0,
        left: safeAreaInsets.left,
        right: safeAreaInsets.right,
      },
  );
  const container = useRef({ width: 0, height: 0 });
  const frame = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const hasMeasured = useRef(false);

  /**
   * Hiding the bar on scroll must not change layout: shrinking list footers
   * would clamp the scroll position and the resulting scroll event would show
   * the bar again. The bar overlays the content, so hiding never resizes the
   * container; a resize while hidden is a real reflow and is still measured.
   */
  const tabBarHidden = useContext(TabBarHiddenContext);
  const containerWhenHidden = useRef<{ width: number; height: number } | null>(
    null,
  );
  if (!tabBarHidden) containerWhenHidden.current = null;
  else if (!containerWhenHidden.current)
    containerWhenHidden.current = { ...container.current };

  const updateInsets = () => {
    const hiddenSize = containerWhenHidden.current;
    if (
      hiddenSize &&
      hiddenSize.width === container.current.width &&
      hiddenSize.height === container.current.height
    )
      return;
    if (!container.current.width || !frame.current.width) return;
    const next = {
      bottom: Math.round(
        container.current.height - frame.current.y - frame.current.height,
      ),
      left: Math.round(frame.current.x),
      right: Math.round(
        container.current.width - frame.current.x - frame.current.width,
      ),
    };
    // The SafeAreaView lays out once with no insets before the native ones arrive
    const isEmpty = !next.bottom && !next.left && !next.right;
    if (isEmpty && !hasMeasured.current) return;
    hasMeasured.current = true;
    lastInsets = next;
    setInsets((prev) =>
      prev.bottom === next.bottom &&
      prev.left === next.left &&
      prev.right === next.right
        ? prev
        : next,
    );
  };

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        container.current = { width, height };
        updateInsets();
      }}
    >
      <ScreensSafeAreaView
        style={StyleSheet.absoluteFill}
        edges={{ bottom: true, left: true, right: true }}
        onLayout={(e: LayoutChangeEvent) => {
          frame.current = e.nativeEvent.layout;
          updateInsets();
        }}
      />
      <TabBarInsetsContext.Provider value={insets}>
        {children}
      </TabBarInsetsContext.Provider>
    </View>
  );
}

/** Spacer for lists that scroll beneath the tab bar. */
export function TabBarSpacer() {
  const { bottom } = useTabBarInsets();
  // TabBarScrollView lets UIKit inset the list instead
  return USES_NATIVE_TAB_BAR_MINIMIZE ? null : (
    <View style={{ height: bottom }} />
  );
}

/**
 * Main scroll view of a screen that draws beneath the tab bar. On iOS 26 the
 * marker tells the tab bar which list drives minimize-on-scroll, and UIKit
 * insets the content for the glass bars, tracking them as they minimize. Plain
 * function, no hooks: FlashList calls renderScrollComponent directly.
 *
 * The marker doesn't reach the iOS 27 header minimize: UIKit finds that list
 * itself and only searches a few levels down the first-subview chain. Keep the
 * views above this one layout-only (no background, onLayout, borders...) so
 * Fabric flattens them, and render it before any overlay siblings.
 */
export function TabBarScrollView({
  ref,
  ...props
}: ScrollViewProps & { ref?: React.Ref<ScrollViewInstance> }) {
  return USES_NATIVE_TAB_BAR_MINIMIZE ? (
    <ScrollViewMarker style={styles.container}>
      <ScrollView
        ref={ref}
        {...props}
        contentInsetAdjustmentBehavior="automatic"
      />
    </ScrollViewMarker>
  ) : (
    <ScrollView ref={ref} {...props} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
