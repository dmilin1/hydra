import { Image, ImageSource } from "expo-image";
import React, { useState, useContext } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableHighlight,
  useWindowDimensions,
} from "react-native";

import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import useMediaSharing from "../../../../../utils/useMediaSharing";
import { MediaViewerContext } from "../../../../../contexts/MediaViewerContext";
import { Post } from "../../../../../api/Posts";
import { PostDetail } from "../../../../../api/PostDetail";

export default function ImageViewer({
  images,
  aspectRatio,
  post,
}: {
  images: (string | ImageSource[])[];
  aspectRatio: number;
  post?: Post | PostDetail;
}) {
  const { currentDataMode } = useContext(DataModeContext);
  const { displayMedia } = useContext(MediaViewerContext);
  const shareMedia = useMediaSharing();
  const { width, height } = useWindowDimensions();

  const [loadLowData, setLoadLowData] = useState(currentDataMode === "lowData");

  const { theme } = useContext(ThemeContext);

  const numImgsToDisplay = loadLowData ? 1 : Math.min(2, images.length);

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
      {images.slice(0, numImgsToDisplay).map((img, index) => {
        const imgSrc =
          typeof img === "string" ? img : loadLowData ? [img[0]] : img;
        return (
          /**
           * Don't change this to TouchableWithoutFeedback, it will break images in comments
           * by making them offset weirdly. I have no idea why.
           */
          <TouchableHighlight
            key={index}
            activeOpacity={1}
            onPress={() => {
              setLoadLowData(false);
              displayMedia({
                media: [images.map((img) => ({ type: "image", source: img }))],
                initialIndex: index,
                getCurrentPost: () => post ?? null,
              });
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
              recyclingKey={typeof imgSrc === "string" ? imgSrc : imgSrc[0].uri}
              contentFit="contain"
              source={imgSrc}
              transition={250}
            />
          </TouchableHighlight>
        );
      })}
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
