import React, { useState, useContext, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Dimensions,
} from "react-native";

import { default as ImageView } from "./ImageView/ImageViewing";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";
import MediaLibrary from "../../../../../utils/MediaLibrary";
import URL from "../../../../../utils/URL";

const DEVICE_HEIGHT = Dimensions.get("window").height;
const DEVICE_WIDTH = Dimensions.get("window").width;

export default function ImageViewer({
  images,
  thumbnail,
  resizeDynamically,
}: {
  images: string[];
  thumbnail?: string;
  resizeDynamically?: boolean;
}) {
  const { currentDataMode } = useContext(DataModeContext);
  const saveImage = MediaLibrary.useSaveImage();

  const [loadLowData, setLoadLowData] = useState(currentDataMode === "lowData");
  const [visible, setVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  const { theme } = useContext(ThemeContext);

  const isGif = new URL(images[0]).getRelativePath().endsWith(".gif");

  const imgRatio = dimensions.width / dimensions.height;
  const heightIfFullSize = DEVICE_WIDTH / imgRatio;
  const imgHeight = Math.min(DEVICE_HEIGHT * 0.5, heightIfFullSize);

  const getDimensions = async (uri: string) => {
    Image.getSize(uri, (width, height) => {
      setDimensions({ width, height });
    });
  };

  useEffect(() => {
    if (!resizeDynamically) {
    } else if (loadLowData && thumbnail) {
      getDimensions(thumbnail);
    } else if (!loadLowData) {
      getDimensions(images[0]);
    }
  }, []);

  return (
    <View style={styles.imageViewerContainer}>
      {!loadLowData && (
        <ImageView
          images={images.map((image) => ({ uri: image }))}
          imageIndex={0}
          presentationStyle="overFullScreen"
          animationType="none"
          visible={visible}
          onRequestClose={() => setVisible(false)}
          onLongPress={() => saveImage(images[imageIndex])}
          onImageIndexChange={(index) => setImageIndex(index)}
          delayLongPress={500}
        />
      )}
      {images.slice(0, loadLowData ? 1 : 2).map((image, index) => (
        <TouchableHighlight
          key={`${image}-${index}`}
          onPress={() => {
            setLoadLowData(false);
            setImageIndex(index);
            setVisible(true);
          }}
          style={styles.touchableZone}
          onLongPress={() => saveImage(images[imageIndex])}
        >
          <Image
            style={[
              styles.img,
              {
                height: images.length >= 2 ? imgHeight / 2 : imgHeight,
              },
            ]}
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
