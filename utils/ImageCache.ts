import { useIsFocused } from "@react-navigation/native";
import { Directory, File, Paths } from "expo-file-system/next";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const MAX_CACHE_SIZE = 1024 * 1024 * 512; // 512MB

export default class ImageCache {
  private static readonly cacheDir = new Directory(
    `${Paths.cache.uri}/com.hackemist.SDImageCache/default`,
  );

  static getCacheSize(): number {
    let size = 0;
    if (!this.cacheDir.exists) return 0;
    this.cacheDir.list().forEach((file) => {
      if (file instanceof File) {
        size += file?.size ?? 0;
      }
    });
    return size;
  }

  static async clearCache(withAlert: boolean = true): Promise<void> {
    await Image.clearDiskCache();
    if (withAlert) {
      Alert.alert("Cache Cleared", "The image cache has been cleared.");
    }
  }

  static async doMaintenance() {
    const cacheSize = ImageCache.getCacheSize();
    if (cacheSize > MAX_CACHE_SIZE) {
      await ImageCache.clearCache(false);
    }
  }

  static useCache() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isFocused = useIsFocused();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [cacheSize, setCacheSize] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!isFocused) return;
      setCacheSize(ImageCache.getCacheSize());
    }, [isFocused]);

    return {
      cacheSize,
      clearCache: async (withAlert: boolean = true) => {
        await ImageCache.clearCache(withAlert);
        setCacheSize(0);
      },
    };
  }
}
