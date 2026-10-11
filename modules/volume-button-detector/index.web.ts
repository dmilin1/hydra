/** Web has no hardware volume buttons. */
export function onVolumeButtonPressed(): () => void {
  return () => {};
}
