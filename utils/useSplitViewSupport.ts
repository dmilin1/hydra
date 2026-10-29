import { Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const MIN_WIDTH = 768;
export const deviceSupportsSplitView =
  Dimensions.get("screen").width >= MIN_WIDTH;

export function useSplitViewSupport() {
  const [storedSplitViewEnabled, setSplitViewEnabled] =
    useMMKVBoolean("splitViewEnabled");
  const [windowSupportsSplitView, setWindowSupportsSplitView] = useState(
    Dimensions.get("window").width >= MIN_WIDTH,
  );

  const splitViewEnabled = storedSplitViewEnabled ?? deviceSupportsSplitView;

  useEffect(() => {
    // We shouldn't have to type this as any. For some reason, the React Native library removed the types for this event
    const subscription = Dimensions.addEventListener("change", (event: any) => {
      const newWindowSupportsSplitView = event.window.width >= MIN_WIDTH;
      if (newWindowSupportsSplitView !== windowSupportsSplitView) {
        setWindowSupportsSplitView(newWindowSupportsSplitView);
      }
    });
    return () => subscription.remove();
  }, [windowSupportsSplitView]);
  return {
    deviceSupportsSplitView,
    windowSupportsSplitView,
    splitViewEnabled,
    setSplitViewEnabled,
  };
}
