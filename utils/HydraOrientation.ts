import { NativeModules, Platform } from "react-native";

type HydraOrientationModule = {
  allowFullscreenRotation?: () => void;
  lockPortrait?: () => void;
};

const nativeModule: HydraOrientationModule =
  NativeModules.HydraOrientation ?? {};

export function allowFullscreenRotation() {
  if (Platform.OS !== "android") {
    return;
  }
  nativeModule.allowFullscreenRotation?.();
}

export function lockPortraitOrientation() {
  if (Platform.OS !== "android") {
    return;
  }
  nativeModule.lockPortrait?.();
}
