import { createVideoPlayer, VideoPlayer } from "expo-video";
import { useEffect, useId } from "react";
import VideoCache from "./VideoCache";
import { onVolumeButtonPressed } from "../modules/volume-button-detector";
import KeyStore from "./KeyStore";
import { AppState } from "react-native";

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
    // A later release may have already destroyed this entry or replaced it in the map.
    if (entry.owners.size > 0 || entries.get(source) !== entry) return;
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

let hasUnmutedThisSession = false;

AppState.addEventListener('change', (state) => {
  if (state === 'background') {
    hasUnmutedThisSession = false;
  }
});

export function useSharedVideoPlayer(
  source: string,
  canPlayAudio: boolean = false
): VideoPlayer {
  const ownerId = useId();
  const entry = getEntry(source, ownerId);

  useEffect(() => {
    /**
     * This line is no-op normally, but fixes a leak during development fast refresh.
     * When React fast refreshes, it reruns useEffects. Which means we release and
     * might not reacquire the player.
     */
    entry.owners.add(ownerId);
    return () => releaseEntry(source, ownerId);
  }, [source]);

  useEffect(() => {
    if (!canPlayAudio) return;
    const muteVideosByDefault = KeyStore.getBoolean('muteVideosByDefault') ?? true;
    if (!muteVideosByDefault || hasUnmutedThisSession) {
      entry.player.muted = false;
    };
    return () => {
      entry.player.muted = true;
    }
  }, [source]);

  useEffect(() => {
    if (!canPlayAudio) return;
    let unsubscribeVolPress: (() => void) | undefined = undefined;
    const startVolPress = () => {
      unsubscribeVolPress?.();
      if (!entry.player.muted) return;
      unsubscribeVolPress = onVolumeButtonPressed(() => {
        entry.player.muted = false;
      });
    };
    startVolPress();
    const { remove: unsubscribeMuted } = entry.player.addListener(
      "mutedChange",
      ({ muted }) => {
        startVolPress();
        if (!muted) {
          hasUnmutedThisSession = true;
        }
      }
    );
    return () => {
      unsubscribeMuted();
      unsubscribeVolPress?.();
    };
  }, [source]);

  return entry.player;
}
