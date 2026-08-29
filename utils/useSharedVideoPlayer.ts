import { createVideoPlayer, VideoPlayer } from "expo-video";
import { useEffect } from "react";
import VideoCache from "./VideoCache";

type Entry = {
  player: VideoPlayer;
  refCount: number;
};

const entries = new Map<string, Entry>();

const backgroundPositions = new Map<string, number>();

/**
 * Players are never reused: a slow load could land on a recycled player after
 * it was parked and leave it playing audio with no owner. They also can't be
 * left to the garbage collector, because expo-video's cache layer pins players
 * that loaded a cached source. So released players are torn down explicitly,
 * but release() drops frames, so it's paced: one player at a time, only after
 * releases have gone quiet (a proxy for the user having stopped scrolling).
 */
const graveyard: VideoPlayer[] = [];
const MAX_GRAVEYARD = 30;
const QUIET_BEFORE_RELEASE_MS = 1500;
const BETWEEN_RELEASES_MS = 250;
let drainTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * In dev mode, when React rerenders a component, it calls logComponentRender
 * which iterates over all the properties of a component's old props. The
 * player has getter functions as properies that call native code. This means
 * that after we release the player, React will try to access the properties
 * and cause the app to crash. This fixes it by overriding all the getters.
 *
 * https://github.com/react/react/issues/35126
 * https://github.com/react/react/pull/36867
 */
function devModePlayerFix(player: VideoPlayer) {
  for (const key in player) {
    Object.defineProperty(player, key, {
      get() {
        return undefined;
      },
    });
  }
}

function destroyPlayer(player: VideoPlayer) {
  player.release();
  if (__DEV__) {
    devModePlayerFix(player);
  }
}

function scheduleDrain(delay: number) {
  if (drainTimer) {
    clearTimeout(drainTimer);
  }
  drainTimer = setTimeout(() => {
    drainTimer = null;
    const player = graveyard.shift();
    if (!player) {
      return;
    }
    destroyPlayer(player);
    if (graveyard.length) {
      scheduleDrain(BETWEEN_RELEASES_MS);
    }
  }, delay);
}

function parkPlayer(player: VideoPlayer) {
  player.pause();
  player.muted = true;
  player.replaceAsync(null);
  graveyard.push(player);
  if (graveyard.length > MAX_GRAVEYARD) {
    const player = graveyard.shift();
    if (player) {
      destroyPlayer(player);
    }
  }
  // Every park resets the timer, so draining waits until scrolling stops.
  scheduleDrain(QUIET_BEFORE_RELEASE_MS);
}

function releaseEntry(source: string, entry: Entry) {
  if (entry.refCount > 0) {
    return;
  }
  /**
   * React runs all cleanups before all mount effects within a commit.
   * So, if a component is trying to claim an entry in the same render
   * cycle as another component that is releasing it, the release would
   * happen first. Waiting a microtask lets the claiming component's
   * effect (entry.refCount++) run first.
   */
  queueMicrotask(() => {
    if (entry.refCount > 0 || entries.get(source) !== entry) {
      return;
    }
    const position = entry.player.currentTime;
    if (Number.isFinite(position) && position > 0) {
      backgroundPositions.set(source, position);
    }
    parkPlayer(entry.player);
    entries.delete(source);
  });
}

function getEntry(source: string): Entry {
  const existing = entries.get(source);
  if (existing) {
    return existing;
  }
  const player = createVideoPlayer(VideoCache.makeCachedVideoSource(source));
  player.audioMixingMode = "mixWithOthers";
  player.muted = true;
  player.loop = true;
  player.timeUpdateEventInterval = 1 / 15;
  player.seekTolerance = {
    toleranceBefore: 0.1,
    toleranceAfter: 0.1,
  };
  player.bufferOptions = {
    maxBufferBytes: 1024 * 1024 * 5, // 5MB - Android only setting (prevents crashes)
  };
  const position = backgroundPositions.get(source) ?? 0;
  if (position > 0) {
    backgroundPositions.delete(source);
    player.currentTime = position;
  }
  const entry: Entry = { player, refCount: 0 };
  entries.set(source, entry);
  return entry;
}

/**
 * True while more than one component holds the same player, i.e. the
 * fullscreen viewer took over a player the post's inline video owns.
 */
export function isPlayerShared(source: string): boolean {
  return (entries.get(source)?.refCount ?? 0) > 1;
}

export function useSharedVideoPlayer(source: string): VideoPlayer {
  const entry = getEntry(source);

  useEffect(() => {
    entry.refCount++;
    const prevEntry = entry;
    const prevSource = source;
    return () => {
      prevEntry.refCount--;
      releaseEntry(prevSource, prevEntry);
    };
  }, [entry]);

  return entry.player;
}
