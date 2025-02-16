import { Entypo } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Directory, File, Paths } from "expo-file-system/next";
import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import List from "../../components/UI/List";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

const imageCacheDir = new Directory(
  `${Paths.cache.uri}/com.hackemist.SDImageCache/default`,
);

const calcDirectorySize = (dir: Directory) => {
  let size = 0;
  if (!dir.exists) return 0;
  dir.list().forEach((file) => {
    if (file instanceof File) {
      size += file?.size ?? 0;
    }
  });
  return (size / 1024 / 1024).toFixed(0);
};

export default function Advanced() {
  const { theme } = useContext(ThemeContext);

  const isFocused = useIsFocused();

  const [imageCacheMb, setImageCacheMb] = useState(
    calcDirectorySize(imageCacheDir),
  );

  const clearCache = async () => {
    if (imageCacheDir.exists) {
      imageCacheDir.list().forEach((file) => {
        if (file instanceof File) {
          file.delete();
        }
      });
    }
    setImageCacheMb(calcDirectorySize(imageCacheDir));
    Alert.alert("Cache Cleared", "The image cache has been cleared.");
  };

  useEffect(() => {
    if (!isFocused) return;
    setImageCacheMb(calcDirectorySize(imageCacheDir));
  }, [isFocused]);

  return (
    <>
      <List
        title="Caching"
        items={[
          {
            key: "errorReporting",
            icon: <Entypo name="image" size={24} color={theme.text} />,
            rightIcon: <></>,
            text: `Clear Image Cache (${imageCacheMb} MB)`,
            onPress: () => clearCache(),
          },
        ]}
      />
    </>
  );
}
