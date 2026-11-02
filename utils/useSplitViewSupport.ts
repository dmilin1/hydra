import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useMMKVBoolean } from "react-native-mmkv";

export const SPLIT_VIEW_MIN_WIDTH = 768;

export function useSplitViewSupport() {
  const [storedSplitViewEnabled, setSplitViewEnabled] =
    useMMKVBoolean("splitViewEnabled");
  // Follows window resizes (iPad multitasking, iPhone Duo fold)
  const windowSupportsSplitView =
    useSafeAreaFrame().width >= SPLIT_VIEW_MIN_WIDTH;

  const splitViewEnabled = storedSplitViewEnabled ?? true;
  return {
    windowSupportsSplitView,
    splitViewEnabled,
    setSplitViewEnabled,
  };
}
