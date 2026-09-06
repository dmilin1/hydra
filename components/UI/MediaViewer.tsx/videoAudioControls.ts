export function isMediaVolumeChange(
  previousVolume: number | null,
  nextVolume: number,
  volumeType?: string,
) {
  // Duplicate readings do not imply intent, even at the volume limits.
  return (
    previousVolume !== null &&
    nextVolume !== previousVolume &&
    (volumeType === undefined || volumeType === "music")
  );
}

type Subscription = { remove(): void };
type VolumeEvent = { volume: number; type?: string };

export function subscribeToVideoUnmute({
  volume,
  watchIntent,
  isActive,
  onUnmute,
}: {
  volume: {
    getVolume(): Promise<{ volume: number }>;
    addVolumeListener(listener: (event: VolumeEvent) => void): Subscription;
  };
  watchIntent(listener: () => void): () => void;
  isActive(): boolean;
  onUnmute(): void;
}): () => void {
  let stopped = false;
  let volumeSubscription: Subscription | undefined;
  let stopIntent = () => {};
  const stop = () => {
    stopped = true;
    volumeSubscription?.remove();
    volumeSubscription = undefined;
    stopIntent();
    stopIntent = () => {};
  };
  const requestUnmute = () => {
    if (stopped || !isActive()) return;
    stop(); // Release session mute before changing the shared player mute state.
    onUnmute();
  };
  try {
    stopIntent = watchIntent(requestUnmute);
    if (stopped) stopIntent();
  } catch {
    // A missing or unavailable intent capability does not disable volume events.
  }
  // Intent does not depend on an initial volume reading succeeding.
  Promise.resolve()
    .then(() => volume.getVolume())
    .then(({ volume: initialVolume }) => {
      if (stopped) return;
      let previousVolume = initialVolume;
      volumeSubscription = volume.addVolumeListener((event) => {
        if (isMediaVolumeChange(previousVolume, event.volume, event.type)) {
          requestUnmute();
        }
        if (event.type === undefined || event.type === "music") {
          previousVolume = event.volume;
        }
      });
    })
    .catch(() => {
      // Native intent and the explicit mute button remain available.
    });
  return stop;
}
