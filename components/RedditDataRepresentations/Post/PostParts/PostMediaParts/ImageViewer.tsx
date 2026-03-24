import { Image } from "expo-image";
import React, { useState, useContext, useRef } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";

import { default as ImageView } from "./ImageView/ImageViewing";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { ModalContext } from "../../../../../contexts/ModalContext";
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
  const { setModal } = useContext(ModalContext);

  const [loadLowData, setLoadLowData] = useState(currentDataMode === "lowData");
  const initialImageIndex = useRef(0);

  const { theme } = useContext(ThemeContext);

  const isGif = new URL(images[0]).getRelativePath().endsWith(".gif");
  const maxPreviewWidth = Math.ceil(width);
  const maxPreviewHeight = Math.ceil(height * 0.6);

  let displayImgs = images.slice(0, 2);
  if ((loadLowData || isGif) && thumbnail) {
    displayImgs = [thumbnail];
  }
  const secondaryDisplayImg = displayImgs[1] ?? displayImgs[0];

  const img1 = useImage(displayImgs[0], {
    maxWidth: maxPreviewWidth,
    maxHeight: maxPreviewHeight,
  });

  const img2 = useImage(
    secondaryDisplayImg,
    {
      maxWidth: maxPreviewWidth,
      maxHeight: maxPreviewHeight,
      onError: () => {
        /* This image might not exist */
      },
    },
  );

  const imgRefs = [img1, ...(displayImgs.length === 2 ? [img2] : [])];

  const imgRatio = aspectRatio ?? (img1 ? img1.width / img1.height : 0);
  const heightIfFullSize = width / imgRatio;
  const imgHeight = Math.min(height * 0.6, heightIfFullSize);

  const openImageViewer = (index: number) => {
    setLoadLowData(false);
    initialImageIndex.current = index;
    setModal(
      <ImageView
        images={images.map((image) => ({ uri: image }))}
        initialImageIndex={index}
        presentationStyle="overFullScreen"
        animationType="none"
        visible={true}
        onRequestClose={() => setModal(undefined)}
        onLongPress={(imgSource) =>
          typeof imgSource === "object" &&
          imgSource.uri &&
          shareMedia("image", imgSource.uri)
        }
        onImageIndexChange={(imageIndex) => {
          initialImageIndex.current = imageIndex;
        }}
        delayLongPress={500}
      />,
    );
  };

  return (
    <View
      style={[
        styles.imageViewerContainer,
        {
          height: numImgsToDisplay === 2 ? imgHeight / 2 : imgHeight,
        },
      ]}
    >
      {imgRefs.map((img, index, imgs) => (
        /**
         * Don't change this to TouchableWithoutFeedback, it will break images in comments
         * by making them offset weirdly. I have no idea why.
         */
        <Pressable
          key={index}
          onPress={(event) => {
            event.stopPropagation();
            openImageViewer(index);
          }}
          style={styles.touchableZone}
          onLongPress={(event) => {
            event.stopPropagation();
            shareMedia("image", images[index]);
          }}
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
        </Pressable>
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
