import { useActionSheet } from "@expo/react-native-action-sheet";
import { saveToLibraryAsync } from "expo-media-library";
import React, { useState, useContext } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
} from "react-native";
import { default as ImageView } from "react-native-image-viewing";

import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";
import URL from "../../../../../utils/URL";

export default function ImageViewer({
  images,
  thumbnail,
}: {
  images: string[];
  thumbnail?: string;
}) {
  const { currentDataMode } = useContext(DataModeContext);
  const { showActionSheetWithOptions } = useActionSheet();

  const [loadLowData, setLoadLowData] = useState(currentDataMode === "lowData");
  const [visible, setVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { theme } = useContext(ThemeContext);

  const isGif = new URL(images[0]).getRelativePath().endsWith(".gif");

  const saveImage = async () => {
    const cancelButtonIndex = 1;
    showActionSheetWithOptions(
      {
        options: ["Save Image", "Cancel"],
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex)
          return;
        await saveToLibraryAsync(images[imageIndex]);
        Alert.alert("Image saved to library");
      },
    );
  };

  return (
    <View style={styles.imageViewerContainer}>
      {!loadLowData && (
        <ImageView
          images={images.map((image) => ({ uri: image }))}
          imageIndex={imageIndex}
          presentationStyle="fullScreen"
          visible={visible}
          onRequestClose={() => setVisible(false)}
          onLongPress={saveImage}
        />
      )}
      {images.slice(0, loadLowData ? 1 : 2).map((image, index) => (
        <TouchableHighlight
          key={index}
          onPress={() => {
            setLoadLowData(false);
            setImageIndex(index);
            setVisible(true);
          }}
          style={styles.touchableZone}
          onLongPress={saveImage}
        >
          <Image
            style={styles.img}
            resizeMode="contain"
            source={{
              uri: (isGif || loadLowData) && thumbnail ? thumbnail : image,
            }}
            alt="image failed to load"
          />
        </TouchableHighlight>
      ))}
      {images.length >= 2 && (
        <View
          style={t(styles.imageCountContainer, {
            backgroundColor: theme.background,
          })}
        >
          <Text
            style={t(styles.imageCountText, {
              color: theme.text,
            })}
          >
            {images.length} IMAGES
          </Text>
        </View>
      )}
      {isGif && (
        <View
          style={t(styles.isGifContainer, {
            backgroundColor: theme.background,
          })}
        >
          <Text
            style={t(styles.isGifText, {
              color: theme.text,
            })}
          >
            GIF
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageViewerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  touchableZone: {
    flex: 1,
  },
  img: {
    flex: 1,
  },
  imageCountContainer: {
    position: "absolute",
    borderRadius: 5,
    overflow: "hidden",
    margin: 5,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  imageCountText: {
    padding: 5,
  },
  gifContainer: {
    flex: 1,
    margin: 5,
    left: 0,
    bottom: 0,
    opacity: 0.6,
  },
  isGifContainer: {
    position: "absolute",
    borderRadius: 5,
    overflow: "hidden",
    margin: 5,
    left: 0,
    bottom: 0,
    opacity: 0.6,
  },
  isGifText: {
    padding: 5,
  },
});
