export function isMediaVolumeIncrease(
  previousVolume: number | null,
  nextVolume: number,
  volumeType?: string,
) {
  return (
    previousVolume !== null &&
    nextVolume > previousVolume &&
    (volumeType === undefined || volumeType === "music")
  );
}
