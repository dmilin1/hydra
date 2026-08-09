import { createVideoPlayer, VideoPlayer } from "expo-video";
import { useEffect } from "react";
import VideoCache from "./VideoCache";

type Entry = {
  player: VideoPlayer;
  refCount: number;
};

const entries = new Map<string, Entry>();
const graveyardPlayers = new Array<VideoPlayer>();

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

function releaseEntry(source: string, entry: Entry) {
  if (entry.refCount > 0) {
    return;
  }
  /**
   * React runs all cleanups before all mount effects within a commit.
   * So, if a component is trying to claim an entry in the same render
   * cycle as another component that to release it to the graveyard, the
   * release will happen first, moving the claimed entry to the graveyard.
   * This fixes the problem by waiting until the claiming component's use
   * effect (entry.refCount++) has finished running.
   *
   * I tried triggering this bug during testing and couldn't trigger it,
   * so maybe it's fine, but better safe than sorry.
   */
  queueMicrotask(() => {
    if (entry.refCount > 0 || entries.get(source) !== entry) {
      return;
    }
    const position = entry.player.currentTime;
    if (Number.isFinite(position) && position > 0) {
      backgroundPositions.set(source, position);
    }
    if (graveyardPlayers.length > 5) {
      entry.player.release();
      devModePlayerFix(entry.player);
    } else {
      entry.player.replaceAsync(null);
      graveyardPlayers.push(entry.player);
    }
    entries.delete(source);
  });
}

function getEntry(source: string): Entry {
  const existing = entries.get(source);
  if (existing) {
    return existing;
  }
  const graveyardPlayer = graveyardPlayers.pop();
  if (graveyardPlayer) {
    graveyardPlayer
      .replaceAsync(VideoCache.makeCachedVideoSource(source))
      .then(() => {
        const position = backgroundPositions.get(source) ?? 0;
        if (position > 0) {
          backgroundPositions.delete(source);
          graveyardPlayer.currentTime = position;
        }
      });
    graveyardPlayer.muted = true;
    graveyardPlayer.playbackRate = 1;
    graveyardPlayer.scrubbingModeOptions = {
      scrubbingModeEnabled: false,
    };
    const entry = { player: graveyardPlayer, refCount: 0 };
    entries.set(source, entry);
    return entry;
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
