import { useIsFocused } from "@react-navigation/native";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";

const MAX_DISK_CACHE_SIZE = 1024 * 1024 * 512; // 512MB
const MAX_MEMORY_CACHE_SIZE = 1024 * 1024 * 256; // 128MB

Image.configureCache({
  maxDiskSize: MAX_DISK_CACHE_SIZE,
  maxMemoryCost: MAX_MEMORY_CACHE_SIZE,
});

AppState.addEventListener("memoryWarning", () => {
  Image.clearMemoryCache();
});

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
