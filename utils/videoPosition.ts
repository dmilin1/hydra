const MAX_TRACKED_VIDEOS = 50;

const positions = new Map<string, number>();

/**
 * The last key written sits at the end of the Map already, letting the
 * repeated writes from a playing video skip the reorder.
 */
let newestKey: string | null = null;

function moveToNewest(source: string, position: number) {
  positions.delete(source);
  positions.set(source, position);
  newestKey = source;
}

export function getVideoPosition(source: string): number {
  const position = positions.get(source);
  if (position === undefined) {
    return 0;
  }
  if (source !== newestKey) {
    // Being read means the video is active again, so protect it from eviction.
    moveToNewest(source, position);
  }
  return position;
}

export function setVideoPosition(source: string, position: number) {
  // currentTime can briefly be NaN while a source loads; never store it.
  if (!Number.isFinite(position)) {
    return;
  }
  if (source === newestKey) {
    positions.set(source, position);
    return;
  }
  moveToNewest(source, position);
  if (positions.size > MAX_TRACKED_VIDEOS) {
    const oldest = positions.keys().next().value;
    if (oldest !== undefined) {
      positions.delete(oldest);
    }
  }
}
