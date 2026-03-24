import {
  clearVideoCacheAsync,
  getCurrentVideoCacheSize,
  VideoSource,
} from "expo-video";
import { Alert } from "react-native";
import KeyStore from "./KeyStore";
import URL from "./URL";

const VIDEO_CACHE_CLEAR_REQUESTED_KEY = "videoCacheClearRequested";

export default class VideoCache {
  static getCacheSize(): number {
    return getCurrentVideoCacheSize();
  }

  /**
   * Need to clear on startup because the cache cannot be cleared when any
   * video components are mounted.
   */
  static async requestCacheClear(): Promise<void> {
    KeyStore.set(VIDEO_CACHE_CLEAR_REQUESTED_KEY, true);
    Alert.alert("The video cache will be cleared next time you restart Hydra.");
  }

  static async clearCacheIfRequested(): Promise<void> {
    if (KeyStore.getBoolean(VIDEO_CACHE_CLEAR_REQUESTED_KEY)) {
      try {
        await clearVideoCacheAsync();
      } catch (_e) {}
      KeyStore.set(VIDEO_CACHE_CLEAR_REQUESTED_KEY, false);
    }
  }

  static makeCachedVideoSource(uri: string): VideoSource {
    const isCacheable = !new URL(uri).getBasePath().endsWith(".m3u8");
    return {
      uri,
      useCaching: isCacheable,
    };
  }
}
