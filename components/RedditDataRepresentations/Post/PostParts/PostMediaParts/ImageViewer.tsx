import { Image } from "expo-image";
import React, { useState, useContext, useRef } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableHighlight,
  useWindowDimensions,
} from "react-native";

import { default as ImageView } from "./ImageView/ImageViewing";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import URL from "../../../../../utils/URL";
import useMediaSharing from "../../../../../utils/useMediaSharing";

export default function ImageViewer({
  images,
  aspectRatio,
  thumbnail,
}: {
  images: string[];
  aspectRatio: number;
  thumbnail?: string;
}) {
  const { currentDataMode } = useContext(DataModeContext);
  const shareMedia = useMediaSharing();
  const { width, height } = useWindowDimensions();

  const [loadLowData, setLoadLowData] = useState(currentDataMode === "lowData");
  const [visible, setVisible] = useState(false);
  const initialImageIndex = useRef(0);

  const { theme } = useContext(ThemeContext);

  const isGif = new URL(images[0]).getRelativePath().endsWith(".gif");

  const numImgsToDisplay = (loadLowData || isGif) && thumbnail ? 1 : 2;

  const imgRatio = aspectRatio;
  const heightIfFullSize = width / imgRatio;
  const imgHeight = Math.min(height * 0.6, heightIfFullSize);

  return (
    <View
      style={[
        styles.imageViewerContainer,
        {
          height: numImgsToDisplay === 2 ? imgHeight / 2 : imgHeight,
        },
      ]}
    >
      {!loadLowData && (
        <ImageView
          images={images.map((image) => ({ uri: image }))}
          initialImageIndex={initialImageIndex.current}
          presentationStyle="overFullScreen"
          animationType="none"
          visible={visible}
          onRequestClose={() => setVisible(false)}
          onLongPress={(imgSource) =>
            typeof imgSource === "object" &&
            imgSource.uri &&
            shareMedia("image", imgSource.uri)
          }
          onImageIndexChange={(index) => (initialImageIndex.current = index)}
          delayLongPress={500}
        />
      )}
      {images.slice(0, numImgsToDisplay).map((img, index) => (
        /**
         * Don't change this to TouchableWithoutFeedback, it will break images in comments
         * by making them offset weirdly. I have no idea why.
         */
        <TouchableHighlight
          key={index}
          activeOpacity={1}
          onPress={() => {
            setLoadLowData(false);
            initialImageIndex.current = index;
            setVisible(true);
          }}
          style={styles.touchableZone}
          underlayColor={theme.background}
          onLongPress={() => shareMedia("image", img)}
        >
          <Image
            style={[
              styles.img,
              {
                height: numImgsToDisplay === 2 ? imgHeight / 2 : imgHeight,
              },
            ]}
            recyclingKey={img}
            contentFit="contain"
            source={img}
            transition={250}
          />
        </TouchableHighlight>
      ))}
      {images.length >= 2 && (
        <View
          style={[
            styles.imageCountContainer,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          <Text
            style={[
              styles.imageCountText,
              {
                color: theme.text,
              },
            ]}
          >
            {images.length} IMAGES
          </Text>
        </View>
      )}
      {isGif && (
        <View
          style={[
            styles.isGifContainer,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          <Text
            style={[
              styles.isGifText,
              {
                color: theme.text,
              },
            ]}
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
