import { NativeModule, requireOptionalNativeModule } from "expo-modules-core";

declare class VolumeButtonDetectorModule extends NativeModule<{
  onVolumeButtonPressed: () => void;
}> {}

// Optional so a dev client built before this module existed degrades to
// "volume buttons do nothing" instead of crashing at import.
const native = requireOptionalNativeModule<VolumeButtonDetectorModule>(
  "VolumeButtonDetector",
);

/**
 * Calls `listener` on each hardware volume button press while subscribed.
 * Native detection is armed only while at least one listener exists. On iOS
 * before 26 the trigger is a volume change, so a press at the limit is not
 * reported. Returns an unsubscribe function.
 */
export function onVolumeButtonPressed(listener: () => void): () => void {
  const subscription = native?.addListener("onVolumeButtonPressed", listener);
  return () => subscription?.remove();
}
