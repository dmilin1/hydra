import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { useContext, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import URL from "./URL";
import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";

const SHARE_CACHE_DIRECTORY = "hydra-shares";
const SHARE_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const FILE_TYPES = {
  gif: { extension: "gif", mimeType: "image/gif", uti: "com.compuserve.gif" },
  jpeg: { extension: "jpg", mimeType: "image/jpeg", uti: "public.jpeg" },
  jpg: { extension: "jpg", mimeType: "image/jpeg", uti: "public.jpeg" },
  m4v: {
    extension: "m4v",
    mimeType: "video/x-m4v",
    uti: "com.apple.m4v-video",
  },
  mp4: { extension: "mp4", mimeType: "video/mp4", uti: "public.mpeg-4" },
  png: { extension: "png", mimeType: "image/png", uti: "public.png" },
  webp: {
    extension: "webp",
    mimeType: "image/webp",
    uti: "org.webmproject.webp",
  },
} as const;

const DEFAULT_FILE_TYPE = {
  image: { extension: "jpg", mimeType: "image/jpeg", uti: "public.jpeg" },
  video: { extension: "mp4", mimeType: "video/mp4", uti: "public.mpeg-4" },
} as const;

function getShareDirectory() {
  const directory = new Directory(Paths.cache, SHARE_CACHE_DIRECTORY);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function cleanupStaleShares(directory: Directory) {
  const now = Date.now();

  for (const item of directory.list()) {
    if (item instanceof Directory) continue;

    try {
      const { modificationTime, creationTime } = item.info();
      const timestamp = modificationTime ?? creationTime ?? 0;
      if (!timestamp || now - timestamp > SHARE_CACHE_MAX_AGE_MS) {
        item.delete();
      }
    } catch (_) {
      // Cache cleanup is best effort; sharing should not fail because a stale
      // file could not be inspected or deleted.
    }
  }
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getFileType(type: "image" | "video", fileName: string) {
  const extension = getFileExtension(fileName);
  return (
    FILE_TYPES[extension as keyof typeof FILE_TYPES] ?? DEFAULT_FILE_TYPE[type]
  );
}

function getShareFileName(type: "image" | "video", mediaUrl: string) {
  const rawFileName = new URL(mediaUrl).getBasePath().split("/").pop() ?? "";
  const decodedFileName = decodeURIComponent(rawFileName);
  const sanitizedFileName = decodedFileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  const fallback = `media.${DEFAULT_FILE_TYPE[type].extension}`;
  const baseFileName = sanitizedFileName || fallback;
  const fileType = getFileType(type, baseFileName);
  const extension = getFileExtension(baseFileName);
  const fileName = extension
    ? baseFileName
    : `${baseFileName}.${fileType.extension}`;

  return `${Date.now()}-${fileName}`;
}

export default function useMediaSharing() {
  const { setModal } = useContext(ModalContext);
  const { theme } = useContext(ThemeContext);

  const { width, height } = useWindowDimensions();

  const alreadyAsking = useRef(false);

  return async (type: "image" | "video", mediaUrl: string) => {
    if (alreadyAsking.current) return;
    alreadyAsking.current = true;
    try {
      setModal(
        <TouchableOpacity
          style={[styles.modalContainer, { width, height }]}
          onPress={() => setModal(null)}
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.background,
                borderColor: theme.divider,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              Preparing {type === "image" ? "Image" : "Video"}...
            </Text>
            <ActivityIndicator size="small" />
          </View>
        </TouchableOpacity>,
      );
      const directory = getShareDirectory();
      cleanupStaleShares(directory);

      const fileName = getShareFileName(type, mediaUrl);
      const file = new File(directory, fileName);
      const fileType = getFileType(type, fileName);

      await File.downloadFileAsync(mediaUrl, file, { idempotent: true });
      setModal(null);
      await Sharing.shareAsync(file.uri, {
        dialogTitle: `Share ${type === "image" ? "Image" : "Video"}`,
        mimeType: fileType.mimeType,
        UTI: fileType.uti,
      });
    } catch (_e) {
      Alert.alert("Error", `Failed to share ${type}`);
      setModal(null);
    }
    alreadyAsking.current = false;
  };
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
});
