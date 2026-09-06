import { NativeModule, requireOptionalNativeModule } from "expo-modules-core";

declare class VideoAudioControlsModule extends NativeModule<{
  onUnmuteIntent: (event: { owner: string }) => void;
}> {
  start(owner: string): void;
  stop(owner: string): void;
}

const native =
  requireOptionalNativeModule<VideoAudioControlsModule>("VideoAudioControls");
let nextOwner = 0;

// Older clients can still use observed volume changes and the mute button.
export function watchUnmuteIntent(onIntent: () => void): () => void {
  const owner = `${Date.now()}-${++nextOwner}`;
  const subscription = native?.addListener("onUnmuteIntent", (event) => {
    if (event.owner === owner) onIntent();
  });
  const stop = () => {
    try {
      native?.stop(owner);
    } finally {
      subscription?.remove();
    }
  };
  try {
    native?.start(owner);
  } catch {
    stop();
  }
  return stop;
}
