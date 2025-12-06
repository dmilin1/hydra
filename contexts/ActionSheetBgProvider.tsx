import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionSheetBgContext } from "./ActionSheetBgContext";
import { Animated, StyleSheet } from "react-native";

export function ActionSheetBgProvider({ children }: React.PropsWithChildren) {
  const [isActionSheetShowing, setIsActionSheetShowing] = useState(false);
  const actionSheetBgOpacity = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    Animated.timing(actionSheetBgOpacity, {
      toValue: isActionSheetShowing ? 0.5 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActionSheetShowing]);

  /**
   * Since this provider only provides functions, we need to memoize the value
   * or all consumers will re-render when the provider re-renders.
   */
  const value = useMemo(
    () => ({
      setIsActionSheetShowing,
    }),
    [],
  );

  return (
    <ActionSheetBgContext.Provider value={value}>
      <Animated.View
        style={[
          styles.actionSheetBg,
          {
            opacity: actionSheetBgOpacity,
            pointerEvents: isActionSheetShowing ? "auto" : "none",
          },
        ]}
      />
      {children}
    </ActionSheetBgContext.Provider>
  );
}

const styles = StyleSheet.create({
  actionSheetBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 1000,
  },
});
