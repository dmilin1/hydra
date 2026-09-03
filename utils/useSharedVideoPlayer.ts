import { createVideoPlayer, VideoPlayer } from "expo-video";
import { useEffect, useId } from "react";
import VideoCache from "./VideoCache";

type Entry = {
  player: VideoPlayer;
  owners: Set<string>;
};

const entries = new Map<string, Entry>();

const backgroundPositions = new Map<string, number>();

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

function releaseEntry(source: string, ownerId: string) {
  const entry = entries.get(source);
  if (!entry) {
    throw new Error(`Tried to release player, but found no entry`);
  }
  entry.owners.delete(ownerId);
  setTimeout(() => {
    if (entry.owners.size > 0) return;
    entries.delete(source);
    const position = entry.player.currentTime;
    if (Number.isFinite(position) && position > 0) {
      backgroundPositions.set(source, position);
    }
    destroyPlayer(entry.player);
  }, 250);
}

function getEntry(source: string, ownerId: string): Entry {
  const existing = entries.get(source);
  if (existing) {
    existing.owners.add(ownerId);
    return existing;
  }
  const player = createVideoPlayer(VideoCache.makeCachedVideoSource(source));
  player.audioMixingMode = "mixWithOthers";
  player.volume = 0;
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
  const entry: Entry = { player, owners: new Set([ownerId]) };
  entries.set(source, entry);
  return entry;
}

/**
 * True while more than one component holds the same player, i.e. the
 * fullscreen viewer took over a player the post's inline video owns.
 */
export function isPlayerShared(source: string): boolean {
  return (entries.get(source)?.owners.size ?? 0) > 1;
}

export function useSharedVideoPlayer(source: string): VideoPlayer {
  const ownerId = useId();
  const entry = getEntry(source, ownerId);

  useEffect(() => {
    return () => {
      releaseEntry(source, ownerId);
    };
  }, []);

  return entry.player;
}
